import { IncompleteParseError } from './errors/IncompleteParseError'
import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import {
	Background,
	Example,
	Feature,
	Keyword,
	KeywordDefinition,
	Rule,
	Scenario,
	ScenarioOutline,
	Step,
	Table,
} from './grammar'
import { codeBlock } from './tokens/codeBlock'
import { comment } from './tokens/comment'
import { frontMatter } from './tokens/frontMatter'
import { keyword } from './tokens/keyword'
import { keywordDefinition } from './tokens/keywordDefinition'
import { step } from './tokens/step'
import { table } from './tokens/table'
import { whiteSpace } from './tokens/whiteSpace'
import { TokenStream } from './tokenStream'

export const feature = (s: TokenStream): Feature | null => {
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
): Background | Rule | Scenario | ScenarioOutline | Example | null => {
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
	}
	return null
}

const parseRule = (s: TokenStream, def: KeywordDefinition): Rule => {
	const scenarios = parseRuleChildren(s)
	if (scenarios === null)
		throw new InvalidSyntaxError(s, `Rule must contain Scenarios`)
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
): Background | Rule | Scenario | ScenarioOutline | Example => {
	const steps = parseSteps(s)
	if (def.keyword === Keyword.ScenarioOutline) {
		return {
			...def,
			keyword: Keyword.ScenarioOutline,
			steps,
			examples: parseExamples(s, 3),
		}
	} else if (def.keyword === Keyword.Example) {
		return {
			...def,
			keyword: Keyword.Example,
			steps,
		}
	} else if (def.keyword === Keyword.Scenario) {
		return {
			...def,
			keyword: Keyword.Scenario,
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
): (Scenario | ScenarioOutline | Example)[] | null => {
	const children: (Scenario | ScenarioOutline | Example)[] = []

	while (true) {
		const def = keywordDefinition(
			s,
			[Keyword.Scenario, Keyword.Example, Keyword.ScenarioOutline],
			3,
		)
		if (def === null) break

		const steps = parseSteps(s)
		if (def.keyword === Keyword.Example) {
			children.push({
				...def,
				keyword: Keyword.Example,
				steps,
			})
		} else if (def.keyword === Keyword.ScenarioOutline) {
			children.push({
				...def,
				keyword: Keyword.ScenarioOutline,
				steps,
				examples: parseExamples(s, 4),
			})
		} else if (def.keyword === Keyword.Scenario) {
			children.push({
				...def,
				keyword: Keyword.Scenario,
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
	const steps = []

	while (true) {
		const stepComment = comment(s)
		whiteSpace(s)
		const st = step(s)
		whiteSpace(s)
		const code = codeBlock(s)
		whiteSpace(s)
		if (st === null) break
		steps.push(st)
		if (stepComment !== null) st.comment = stepComment
		if (code !== null) st.codeBlock = code
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
	if (keyword(s, [Keyword.Example], level) === null)
		throw new InvalidSyntaxError(s, `Scenario outlines must provide examples.`)
	whiteSpace(s)
	const examples = table(s)
	if (examples === null)
		throw new InvalidSyntaxError(
			s,
			`Scenario outlines must provide an examples table.`,
		)
	return examples
}
