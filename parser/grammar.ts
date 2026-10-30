import { Type, type Static } from '@sinclair/typebox'

export const Keyword = {
	Feature: 'Feature',
	Scenario: 'Scenario',
	// Alias for 'Scenario'
	Example: 'Example',
	Background: 'Background',
	ScenarioOutline: 'Scenario Outline',
	ScenarioOutlineExamples: 'Examples',
	Rule: 'Rule',
} as const
export type Keyword = (typeof Keyword)[keyof typeof Keyword]
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
	comment?: Comment
}

export type Scenarios = (Scenario | ScenarioOutline)[]

export type Feature = KeywordDefinition & {
	keyword: typeof Keyword.Feature
	background?: Background
	scenarios: Scenarios
	rules?: Rule[]
	frontMatter?: Record<string, any> & {
		run?: 'never' | 'only'
		order?: 'first' | 'last'
		needs?: string[]
		variants?: Record<string, string>[]
		/** Used to define example replacements for placeholders during the step runner collection phase */
		exampleContext?: Record<string, any>
	}
}

/**
 * Used to group Scenarios
 */
export type Rule = KeywordDefinition & {
	keyword: typeof Keyword.Rule
	scenarios: Scenarios
}

export type Scenario = KeywordDefinition & {
	keyword: typeof Keyword.Scenario | typeof Keyword.Example
	steps: Step[]
}

export type Background = KeywordDefinition & {
	keyword: typeof Keyword.Background
	steps: Step[]
}

export type ScenarioOutline = KeywordDefinition & {
	keyword: typeof Keyword.ScenarioOutline
	steps: Step[]
	examples: Table
}

export const StepKeyword = {
	Given: 'Given',
	When: 'When',
	Then: 'Then',
	And: 'And',
	// Then, but with optional scenario retry
	Soon: 'Soon',
} as const
export type StepKeyword = (typeof StepKeyword)[keyof typeof StepKeyword]

export const steps = [
	StepKeyword.Given,
	StepKeyword.When,
	StepKeyword.Then,
	StepKeyword.Soon,
	StepKeyword.And,
]

export type EffectiveStepKeyword =
	| typeof StepKeyword.Given
	| typeof StepKeyword.When
	| typeof StepKeyword.Then
	| typeof StepKeyword.Soon

export type Step = {
	keyword: EffectiveStepKeyword
	title: string
	line: number
	comment?: Comment
	codeBlock?: CodeBlock
	description?: string[]
}

export type CodeBlock = {
	language?: string
	code: string
}

export type Row = Record<string, string>
export type Table = Row[]

export type Comment = { text: string }

const Run = {
	never: 'never',
	only: 'only',
	first: 'first',
	last: 'last',
} as const
type Run = (typeof Run)[keyof typeof Run]
export const RunConfigSchema = Type.Object({
	run: Type.Optional(
		Type.Union(Object.values(Run).map((v) => Type.Literal(v))),
	),
	needs: Type.Optional(
		Type.Array(
			Type.String({
				minLength: 1,
			}),
			{ minItems: 1 },
		),
	),
})

export type PartialRunConfig = Static<typeof RunConfigSchema>
export type RunConfig = Required<PartialRunConfig>
