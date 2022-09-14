export enum Keyword {
	Feature = 'Feature',
	Scenario = 'Scenario',
	// Alias for 'Scenario'
	Example = 'Example',
	Background = 'Background',
	ScenarioOutline = 'Scenario Outline',
	ScenarioOutlineExamples = 'Examples',
	Rule = 'Rule',
}
export const keywords: string[] = [
	Keyword.Feature,
	Keyword.Example,
	Keyword.Scenario,
	Keyword.ScenarioOutline,
	Keyword.Background,
	Keyword.Rule,
]

export type KeywordDefinition = {
	keyword: Keyword
	title?: string
	line: number
	description?: string[]
	comment?: string
}

export type Scenarios = (Scenario | ScenarioOutline)[]

export type Feature = KeywordDefinition & {
	keyword: Keyword.Feature
	background?: Background
	scenarios: Scenarios
	rules?: Rule[]
	frontMatter?: Record<string, any>
}

/**
 * Used to group Scenarios
 */
export type Rule = KeywordDefinition & {
	keyword: Keyword.Rule
	scenarios: Scenarios
}

export type Scenario = KeywordDefinition & {
	keyword: Keyword.Scenario | Keyword.Example
	steps: Step[]
}

export type Background = KeywordDefinition & {
	keyword: Keyword.Background
	steps: Step[]
}

export type ScenarioOutline = KeywordDefinition & {
	keyword: Keyword.ScenarioOutline
	steps: Step[]
	examples: Table
}

export enum StepKeyword {
	Given = 'Given',
	When = 'When',
	Then = 'Then',
	And = 'And',
	// Then, but with retry
	Soon = 'Soon',
}

export const steps = [
	StepKeyword.Given,
	StepKeyword.When,
	StepKeyword.Then,
	StepKeyword.Soon,
	StepKeyword.And,
]

export type EffectiveStepKeyword =
	| StepKeyword.Given
	| StepKeyword.When
	| StepKeyword.Then
	| StepKeyword.Soon

export type Step = {
	keyword: EffectiveStepKeyword
	title: string
	line: number
	comment?: string
	codeBlock?: CodeBlock
}

export type CodeBlock = {
	language?: string
	code: string
}

export type Row = Record<string, string>
export type Table = Row[]

export type Tags = Record<string, Record<string, string | true> | true>

export type Comment = { comment: string; tags?: Tags }
