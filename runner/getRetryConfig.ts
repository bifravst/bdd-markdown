import {
	Comment,
	Feature,
	Scenario,
	Step,
	StepKeyword,
	Tag,
} from '@nordicsemiconductor/bdd-markdown'
import { Static, Type } from '@sinclair/typebox'
import { InvalidSettingsError } from './errors/InvalidSettingsError.js'
import { validateWithJSONSchema } from './validateWithJSONSchema.js'

const retryConfigSchema = Type.Object(
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

export type PartialRetryConfig = Static<typeof retryConfigSchema>
export type RetryConfig = Required<PartialRetryConfig>

export const defaultRetryConfig: RetryConfig = {
	tries: retryConfigSchema.properties.tries.default,
	initialDelay: retryConfigSchema.properties.initialDelay.default,
	delayFactor: retryConfigSchema.properties.delayFactor.default,
}

const validator = validateWithJSONSchema(retryConfigSchema)

/**
 * FIXME: use retry config from step, scenario, or feature
 */
export const getRetryConfig = (
	step: Step,
	scenario: Scenario,
	feature: Feature,
	defaults: {
		noRetry: RetryConfig
		retry: RetryConfig
	} = {
		noRetry: {
			tries: 1,
			initialDelay: 0,
			delayFactor: 0,
		},
		retry: defaultRetryConfig,
	},
): RetryConfig => {
	// Whether to enable retry?
	if (step.keyword === StepKeyword.Soon) {
		const maybeValidRetryConfigFromFeature = validateConfig(
			feature?.frontMatter?.retry ?? {},
		)
		const maybeValidRetryConfigFromScenario =
			getRetryConfigFromComment(scenario)
		const maybeValidRetryConfigFromStep = getRetryConfigFromComment(step)
		return {
			...defaults.retry,
			...maybeValidRetryConfigFromFeature,
			...maybeValidRetryConfigFromScenario,
			...maybeValidRetryConfigFromStep,
		}
	}
	// Default retry configuration: no tries!
	return defaults.noRetry
}

export const formatRetryConfig = (
	cfg: ReturnType<typeof getRetryConfig>,
): string =>
	`@retry:tries=${cfg.tries},initialDelay=${cfg.initialDelay},delayFactor=${cfg.delayFactor}`

const toNumbers = <Props extends Tag>(
	o: Props,
): {
	[P in keyof Props]?: 'NaN' | number
} =>
	Object.entries(o).reduce(
		(o, [k, v]) => ({
			...o,
			[k]: typeof v === 'boolean' ? NaN : parseFloat(v),
		}),
		{} as Record<string, number>,
	)
const getRetryConfigFromComment = (commented: {
	comment?: Comment
}): PartialRetryConfig => {
	const config = toNumbers(commented.comment?.tags?.['retry'] ?? {})
	return validateConfig(config)
}

const validateConfig = (config: any): PartialRetryConfig => {
	const maybeValidRetryConfig = validator(config)
	if ('errors' in maybeValidRetryConfig) {
		throw new InvalidSettingsError(
			`Invalid retry configuration provided: ${JSON.stringify(
				maybeValidRetryConfig.errors,
			)}`,
		)
	}
	return maybeValidRetryConfig.value
}
