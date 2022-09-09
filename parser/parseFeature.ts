import { Feature, Keyword, Scenario } from '../parser/grammar'
import {
	readFeatureKeywordDefinition,
	readSecondLevelKeywordDefinition,
} from '../parser/readKeywordDefinition'
import { skipWhiteSpace } from '../parser/skipWhiteSpace'
import { IncompleteParseError } from './errors/IncompleteParseError'
import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import { ParseError } from './errors/ParseError'
import { readCodeBlock } from './readCodeBlock'
import { readComments } from './readComments'
import { readExampleKeyword } from './readKeyword'
import { readStep } from './readStep'
import { TokenStream } from './tokenStream'

export const parseFeature = (s: TokenStream): Feature | null => {
	const maybeFeature = readFeatureKeywordDefinition(s)
	if (maybeFeature === null)
		throw new ParseError(`No feature found in source`, s)

	if (maybeFeature.keyword !== Keyword.Feature)
		throw new InvalidSyntaxError(
			s,
			'Must specify a feature as the first element!',
		)
	const feature = maybeFeature as Feature
	feature.scenarios = []

	while (true) {
		const maybeScenario = readSecondLevelKeywordDefinition(s)
		if (maybeScenario === null) break
		if (maybeScenario.keyword === Keyword.Feature)
			throw new InvalidSyntaxError(s, 'Must only specify one feature per file!')
		const scenario = maybeScenario as Scenario
		feature.scenarios.push(scenario)

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

		scenario.steps = steps

		if (maybeScenario.keyword === Keyword.ScenarioOutline) {
			// Must provide examples
			console.log(readExampleKeyword(s))
		}
	}

	// Ignore whitespace at end of file
	skipWhiteSpace(s)

	if (s.index() !== s.source().length) throw new IncompleteParseError(s)

	return feature
}
