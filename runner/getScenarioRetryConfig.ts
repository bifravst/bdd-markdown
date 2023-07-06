import { type Feature, type RetryConfig, type Scenario } from '..'
import {
	defaultRetryConfig,
	getRetryConfigFromComment,
	validateConfig,
} from './getRetryConfig'

/**
 * Returns the retry config for a scenario in case it has been defined.
 */

export const getScenarioRetryConfig = (
	scenario: Scenario,
	feature: Feature,
): RetryConfig => {
	const maybeValidRetryConfigFromFeature = validateConfig(
		feature?.frontMatter?.retryScenario ?? {},
	)
	const maybeValidRetryConfigFromScenario = getRetryConfigFromComment(
		scenario,
		'retryScenario',
	)
	return {
		...defaultRetryConfig,
		...maybeValidRetryConfigFromFeature,
		...maybeValidRetryConfigFromScenario,
	}
}
