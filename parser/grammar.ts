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

export type Feature = ParsedKeyword & {
	keyword: Keyword.Feature
	scenarios: Scenario[]
}

export type Scenario = ParsedKeyword & {
	keyword: Keyword.Scenario
}
