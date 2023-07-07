import {
	RetryConfigSchema,
	StepKeyword,
	type Comment,
	type Feature,
	type PartialRetryConfig,
	type RetryConfig,
	type Scenario,
	type Step,
	type Tag,
} from '..'
import { InvalidSettingsError } from './errors/InvalidSettingsError.js'
import { validateWithJSONSchema } from './validateWithJSONSchema.js'

export const defaultRetryConfig: RetryConfig = {
	tries: RetryConfigSchema.properties.tries.default,
	initialDelay: RetryConfigSchema.properties.initialDelay.default,
	delayFactor: RetryConfigSchema.properties.delayFactor.default,
}

const validator = validateWithJSONSchema(RetryConfigSchema)

export const noRetry: RetryConfig = {
	tries: 1,
	initialDelay: 0,
	delayFactor: 0,
}

export const getRetryConfig = (
	step: Step,
	scenario: Scenario,
	feature: Feature,
	defaults: {
		noRetry: RetryConfig
		retry: RetryConfig
	} = {
		noRetry,
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
	keyword = 'retry',
): string =>
	`@${keyword}:tries=${cfg.tries},initialDelay=${cfg.initialDelay},delayFactor=${cfg.delayFactor}`

const toNumbers = <Props extends Tag>(
	o: Props,
): {
	[P in keyof Props]?: 'NaN' | number
} =>
	Object.entries(o).reduce(
		(o, [k, v]) => ({
			...o,
			[k]: k === 'scope' ? v : typeof v === 'boolean' ? NaN : parseFloat(v),
		}),
		{} as Record<string, number>,
	)
export const getRetryConfigFromComment = (
	commented: {
		comment?: Comment
	},
	keyword = 'retry',
): PartialRetryConfig => {
	const config = toNumbers(commented.comment?.tags?.[keyword] ?? {})
	return validateConfig(config)
}

export const validateConfig = (config: any): PartialRetryConfig => {
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
