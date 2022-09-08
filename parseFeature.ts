import { IncompleteParseError } from './errors/IncompleteParseError'
import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import { ParseError } from './errors/ParseError'
import { Feature, Keyword, Scenario } from './parser/grammar'
import { readKeywordDefinition } from './parser/readKeywordDefinition'
import { tokenStream } from './tokenStream'

export const parseFeature = (source: string) => {
	const stream = tokenStream(source)

	const feature: Feature | null = readKeywordDefinition<Feature>(stream)

	if (feature === null)
		throw new ParseError(`No feature found in source`, stream)

	if (feature.keyword !== Keyword.Feature)
		throw new InvalidSyntaxError(
			stream,
			'Must specify a feature as the first element!',
		)
	feature.scenarios = []

	while (true) {
		const scenario = readKeywordDefinition<Scenario>(stream)
		if (scenario === null) break
		feature.scenarios.push(scenario)
	}
	if (stream.index() !== source.length - 1)
		throw new IncompleteParseError(stream)

	return feature
}
