export enum Keyword {
	Feature = 'Feature',
	Example = 'Example',
	Scenario = 'Scenario',
	Background = 'Background',
	ScenarioOutline = 'Scenario Outline',
	Rule = 'Rule',
}
export const keywords: string[] = [
	Keyword.Feature,
	Keyword.Example,
	Keyword.Scenario,
	Keyword.Background,
	Keyword.Scenario,
	Keyword.Rule,
]

export type KeywordDefinition = {
	keyword: Keyword
	shortDescription?: string
	description?: string[]
	comment?: string
}

export type Feature = KeywordDefinition & {
	keyword: Keyword.Feature
	scenarios: Scenario[]
}

export type Scenario = KeywordDefinition & {
	keyword: Keyword.Scenario
	steps: Step[]
}

export type ScenarioOutline = Scenario & {
	keyword: Keyword.ScenarioOutline
	examples: Table
}

export enum StepKeyword {
	Given = 'Given',
	When = 'When',
	Then = 'Then',
	And = 'And',
}

export const steps = [
	StepKeyword.Given,
	StepKeyword.When,
	StepKeyword.Then,
	StepKeyword.And,
]

export type Step = {
	keyword: StepKeyword
	title: string
	values?: string[]
	comment?: string
	codeBlock?: CodeBlock
}

export type CodeBlock = {
	language?: string
	code: string
}

export type Row = Record<string, string>
export type Table = Row[]
