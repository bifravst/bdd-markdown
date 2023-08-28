import { IncompleteParseError } from './errors/IncompleteParseError.js'
import { InvalidSyntaxError } from './errors/InvalidSyntaxError.js'
import {
	Keyword,
	StepKeyword,
	type Background,
	type Feature,
	type KeywordDefinition,
	type Rule,
	type Scenario,
	type ScenarioOutline,
	type Step,
	type Table,
} from './grammar.js'
import { codeBlock } from './tokens/codeBlock.js'
import { description } from './tokens/description.js'
import { frontMatter } from './tokens/frontMatter.js'
import { keyword } from './tokens/keyword.js'
import { keywordDefinition } from './tokens/keywordDefinition.js'
import { step } from './tokens/step.js'
import { table } from './tokens/table.js'
import { whiteSpace } from './tokens/whiteSpace.js'
import { type TokenStream } from './tokenStream.js'

export const feature = (s: TokenStream): Feature => {
	// Features may have front matter
	const maybeFrontMatter = frontMatter(s)
	// Read the feature name
	const maybeFeature = keywordDefinition(s, [Keyword.Feature], 1)
	if (maybeFeature === null)
		throw new InvalidSyntaxError(s, `No feature found in source`)

	if (maybeFeature.keyword !== Keyword.Feature)
		throw new InvalidSyntaxError(
			s,
			'Must specify a feature as the first element!',
		)
	const feature = maybeFeature as Feature

	if (maybeFrontMatter !== null) feature.frontMatter = maybeFrontMatter

	// Read the children of a feature
	while (true) {
		const secondLevel = featureChildren(s)
		if (secondLevel === null) break
		// There may be one Background
		if (secondLevel.keyword === Keyword.Background) {
			if (feature.background !== undefined)
				throw new InvalidSyntaxError(
					s,
					`Must only define one Background per feature.`,
				)
			feature.background = secondLevel
		} else if (secondLevel.keyword === Keyword.Rule) {
			// Rules group scenarios, so store the in a separate key
			feature.rules = [...(feature.rules ?? []), secondLevel]
		} else {
			feature.scenarios = [...(feature.scenarios ?? []), secondLevel]
		}
	}

	// Ignore whitespace at end of file
	whiteSpace(s)

	if (s.index() !== s.source().length) throw new IncompleteParseError(s)

	// Feature must define at least one scenario
	const numScenarios =
		(feature?.scenarios ?? []).length +
		(feature?.rules ?? []).reduce(
			(ruleScenarios, { scenarios }) => scenarios.length + ruleScenarios,
			0,
		)
	if (numScenarios === 0)
		throw new InvalidSyntaxError(
			s,
			`Features must define at least one scenario.`,
		)

	return feature
}

/**
 * Parses possible children of features:
 *
 * - Background
 * - Scenario / Example
 * - Scenario Outline with Examples table
 * - Rule
 *
 * Each child can have a comment and a description.
 */
const featureChildren = (
	s: TokenStream,
): Background | Rule | Scenario | ScenarioOutline | null => {
	const def = keywordDefinition(
		s,
		[Keyword.Rule, Keyword.Scenario, Keyword.Example, Keyword.ScenarioOutline],
		2,
	)
	if (def === null) return null

	switch (def.keyword) {
		case Keyword.Scenario:
		case Keyword.ScenarioOutline:
		case Keyword.Example:
		case Keyword.Background:
			return featureChildSteps(s, def)
		case Keyword.Rule:
			return parseRule(s, def)
		case Keyword.Feature:
		case Keyword.ScenarioOutlineExamples:
			// Not handled here
			break
	}
	return null
}

const parseRule = (s: TokenStream, def: KeywordDefinition): Rule => {
	const scenarios = parseRuleChildren(s)
	if (scenarios === null)
		throw new InvalidSyntaxError(s, `Rule must contain scenarios`)
	const rule: Rule = {
		...def,
		keyword: Keyword.Rule,
		scenarios,
	}
	return rule
}

const featureChildSteps = (
	s: TokenStream,
	def: KeywordDefinition,
): Background | Rule | Scenario | ScenarioOutline => {
	const steps = parseSteps(s)
	if (def.keyword === Keyword.ScenarioOutline) {
		return {
			...def,
			keyword: Keyword.ScenarioOutline,
			steps,
			examples: parseExamples(s, 3),
		}
	} else if ([Keyword.Scenario, Keyword.Example].includes(def.keyword)) {
		return {
			...def,
			keyword: def.keyword as Keyword.Scenario | Keyword.Example,
			steps,
		}
	} else if (def.keyword === Keyword.Background) {
		return {
			...def,
			keyword: Keyword.Background,
			steps,
		}
	} else {
		throw new InvalidSyntaxError(s, `Unexpected keyword ${def.keyword}!`)
	}
}

/**
 * Parses possible children of rules:
 *
 * - Scenario / Example
 * - Scenario Outline with Examples table
 *
 * Each child can have a comment and a description.
 */
const parseRuleChildren = (
	s: TokenStream,
): (Scenario | ScenarioOutline)[] | null => {
	const children: (Scenario | ScenarioOutline)[] = []

	while (true) {
		const def = keywordDefinition(
			s,
			[Keyword.Scenario, Keyword.Example, Keyword.ScenarioOutline],
			3,
		)
		if (def === null) break

		const steps = parseSteps(s)
		if (def.keyword === Keyword.ScenarioOutline) {
			children.push({
				...def,
				keyword: Keyword.ScenarioOutline,
				steps,
				examples: parseExamples(s, 4),
			})
		} else if ([Keyword.Scenario, Keyword.Example].includes(def.keyword)) {
			children.push({
				...def,
				keyword: def.keyword as Keyword.Scenario | Keyword.Example,
				steps,
			})
		} else {
			throw new InvalidSyntaxError(s, `Unexpected keyword ${def.keyword}!`)
		}
	}

	if (children.length === 0) return null
	return children
}

/**
 * Parses the step definitions for a keyword
 *
 * Each step can have a comment and a code-block.
 */
const parseSteps = (s: TokenStream): Step[] => {
	const steps: Step[] = []

	while (true) {
		const st = step(s)
		if (st === null) break
		whiteSpace(s)
		const code = codeBlock(s)
		whiteSpace(s)
		const d = description(s)
		whiteSpace(s)
		if (code !== null) st.codeBlock = code
		if (d !== null) st.description = d
		// Resolve `And`ed keyword
		if (st.keyword === StepKeyword.And) {
			// Use previous keyword
			const andedKeyword: StepKeyword | undefined =
				steps[steps.length - 1]?.keyword
			if (andedKeyword === undefined)
				throw new InvalidSyntaxError(
					s,
					`Encountered And step without preceding specifying keyword.`,
				)
			steps.push({
				...st,
				keyword: andedKeyword,
			})
		} else {
			steps.push(st as Step)
		}
	}

	if (steps.length === 0)
		throw new InvalidSyntaxError(s, `Must define at least 1 step!`)

	return steps
}

/**
 * Parses the examples definition for a Scenario Outline
 */
const parseExamples = (s: TokenStream, level: number): Table => {
	// Must provide examples
	if (keyword(s, [Keyword.ScenarioOutlineExamples], level) === null)
		throw new InvalidSyntaxError(s, `Scenario outlines must provide examples.`)
	whiteSpace(s)
	const examples = table(s)
	if (examples === null)
		throw new InvalidSyntaxError(
			s,
			`Scenario outlines must provide an examples table.`,
		)
	// May have whitespace after the table
	whiteSpace(s)
	return examples
}
