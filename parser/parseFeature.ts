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
} from '../parser/grammar'
import { readKeywordDefinition } from '../parser/readKeywordDefinition'
import { skipWhiteSpace } from '../parser/skipWhiteSpace'
import { IncompleteParseError } from './errors/IncompleteParseError'
import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import { ParseError } from './errors/ParseError'
import { readCodeBlock } from './readCodeBlock'
import { readComments } from './readComments'
import { readKeyword } from './readKeyword'
import { readStep } from './readStep'
import { readTable } from './readTable'
import { TokenStream } from './tokenStream'

export const parseFeature = (s: TokenStream): Feature | null => {
	// Read the feature name
	const maybeFeature = readKeywordDefinition(s, [Keyword.Feature], 1)
	if (maybeFeature === null)
		throw new ParseError(`No feature found in source`, s)

	if (maybeFeature.keyword !== Keyword.Feature)
		throw new InvalidSyntaxError(
			s,
			'Must specify a feature as the first element!',
		)
	const feature = maybeFeature as Feature

	// Read the children of a feature
	while (true) {
		const secondLevel = parseFeatureChildren(s)
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
	skipWhiteSpace(s)

	if (s.index() !== s.source().length) throw new IncompleteParseError(s)

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
const parseFeatureChildren = (
	s: TokenStream,
): Background | Rule | Scenario | ScenarioOutline | Example | null => {
	const def = readKeywordDefinition(
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
			return parseFeatureChildSteps(s, def)
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

const parseFeatureChildSteps = (
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
		const def = readKeywordDefinition(
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
		const stepComment = readComments(s)
		skipWhiteSpace(s)
		const step = readStep(s)
		skipWhiteSpace(s)
		const codeBlock = readCodeBlock(s)
		skipWhiteSpace(s)
		if (step === null) break
		steps.push(step)
		if (stepComment !== null) step.comment = stepComment
		if (codeBlock !== null) step.codeBlock = codeBlock
	}

	return steps
}

/**
 * Parses the examples definition for a Scenario Outline
 */
const parseExamples = (s: TokenStream, level: number): Table => {
	// Must provide examples
	if (readKeyword(s, [Keyword.Example], level) === null)
		throw new InvalidSyntaxError(s, `Scenario outlines must provide examples.`)
	skipWhiteSpace(s)
	const examples = readTable(s)
	if (examples === null)
		throw new InvalidSyntaxError(
			s,
			`Scenario outlines must provide an examples table.`,
		)
	return examples
}
