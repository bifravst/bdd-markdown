import { IncompleteParseError } from './IncompleteParseError'
import { InvalidSyntaxError } from './InvalidSyntaxError'
import { ParseError } from './ParseError'
import { readKeyword } from './readKeyword'
import { tokenStream } from './TokenStream'

export enum Keyword {
	Feature = 'Feature',
	Contexts = 'Contexts',
	Example = 'Example',
	Scenario = 'Scenario',
	Background = 'Background',
	ScenarioOutline = 'Scenario Outline',
	Rule = 'Rule',
}
export const keywords: string[] = [
	Keyword.Feature,
	Keyword.Contexts,
	Keyword.Example,
	Keyword.Scenario,
	Keyword.Background,
	Keyword.Scenario,
]

export type ParsedKeyword = {
	keyword: Keyword
	shortDescription: string
	description: string[]
}

type Feature = ParsedKeyword & {
	keyword: Keyword.Feature
	scenarios: Scenario[]
}

type Scenario = ParsedKeyword & {
	keyword: Keyword.Scenario
}

export const parseFeature = (source: string) => {
	const stream = tokenStream(source)

	const feature: Feature | null = readKeyword<Feature>(stream)

	if (feature === null)
		throw new ParseError(`No feature found in source`, stream)

	if (feature.keyword !== Keyword.Feature)
		throw new InvalidSyntaxError(
			stream,
			'Must specify a feature as the first element!',
		)
	feature.scenarios = []

	while (true) {
		const scenario = readKeyword<Scenario>(stream)
		if (scenario === null) break
		feature.scenarios.push(scenario)
	}
	if (stream.index() !== source.length - 1)
		throw new IncompleteParseError(stream)

	return feature
}
