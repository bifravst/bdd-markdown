import { Type, type Static } from '@sinclair/typebox'

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
	comment?: Comment
}

export type Scenarios = (Scenario | ScenarioOutline)[]

export type Feature = KeywordDefinition & {
	keyword: Keyword.Feature
	background?: Background
	scenarios: Scenarios
	rules?: Rule[]
	frontMatter?: Record<string, any> & {
		run?: 'never' | 'only' | 'first' | 'last'
		retry?: PartialRetryConfig
		needs?: string[]
		variants?: Record<string, string>[]
	}
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

export type Tag = Record<string, string | true> | true
export type Tags = Record<string, Tag>

export type Comment = { text: string; tags?: Tags }

export const RetryConfigSchema = Type.Object(
	{
		tries: Type.Optional(
			Type.Integer({
				description: 'How many times to retry the step',
				minimum: 1,
				examples: [3],
				default: 5,
			}),
		),
		initialDelay: Type.Optional(
			Type.Integer({
				description: 'The initial retry delay in milliseconds',
				minimum: 1,
				examples: [500],
				default: 250,
			}),
		),
		delayFactor: Type.Optional(
			Type.Number({
				description: 'The factor to apply to the delay for every retry.',
				minimum: 0,
				examples: [1.5],
				default: 2,
			}),
		),
	},
	{
		additionalProperties: false,
	},
)

export type PartialRetryConfig = Static<typeof RetryConfigSchema>
export type RetryConfig = Required<PartialRetryConfig>

enum Run {
	never = 'never',
	only = 'only',
	first = 'first',
	last = 'last',
}
export const RunConfigSchema = Type.Object({
	run: Type.Optional(Type.Enum(Run)),
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
