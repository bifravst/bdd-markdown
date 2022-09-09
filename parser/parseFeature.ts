import { IncompleteParseError } from '../errors/IncompleteParseError'
import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { ParseError } from '../errors/ParseError'
import { Feature, Keyword, Scenario } from '../parser/grammar'
import { readKeywordDefinition } from '../parser/readKeywordDefinition'
import { skipWhiteSpace } from '../parser/skipWhiteSpace'
import { TokenStream } from '../tokenStream'
import { readComments } from './readComments'
import { readStep } from './readStep'

export const parseFeature = (s: TokenStream): Feature | null => {
	const feature: Feature | null = readKeywordDefinition<Feature>(s)

	if (feature === null) throw new ParseError(`No feature found in source`, s)

	if (feature.keyword !== Keyword.Feature)
		throw new InvalidSyntaxError(
			s,
			'Must specify a feature as the first element!',
		)
	feature.scenarios = []

	while (true) {
		const scenario = readKeywordDefinition<Scenario>(s)
		if (scenario === null) break
		feature.scenarios.push(scenario)

		const steps = []

		while (true) {
			const stepComment = readComments(s)
			skipWhiteSpace(s)
			const step = readStep(s)
			skipWhiteSpace(s)
			if (step === null) break
			steps.push(step)
			if (stepComment !== null) step.comment = stepComment
		}

		scenario.steps = steps
	}

	// Ignore whitespace at end of file
	skipWhiteSpace(s)

	if (s.index() !== s.source().length - 1) throw new IncompleteParseError(s)

	return feature
}
