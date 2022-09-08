import { IncompleteParseError } from '../errors/IncompleteParseError'
import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { ParseError } from '../errors/ParseError'
import { Feature, Keyword, Scenario } from '../parser/grammar'
import { readKeywordDefinition } from '../parser/readKeywordDefinition'
import { skipWhiteSpace } from '../parser/skipWhiteSpace'
import { TokenStream } from '../tokenStream'

export const parseFeature = (source: TokenStream): Feature | null => {
	const feature: Feature | null = readKeywordDefinition<Feature>(source)

	if (feature === null)
		throw new ParseError(`No feature found in source`, source)

	if (feature.keyword !== Keyword.Feature)
		throw new InvalidSyntaxError(
			source,
			'Must specify a feature as the first element!',
		)
	feature.scenarios = []

	while (true) {
		const scenario = readKeywordDefinition<Scenario>(source)
		if (scenario === null) break
		feature.scenarios.push(scenario)
	}

	// Ignore whitespace at end of file
	skipWhiteSpace(source)

	if (source.index() !== source.source().length - 1)
		throw new IncompleteParseError(source)

	return feature
}
