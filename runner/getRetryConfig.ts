import { Step, StepKeyword } from '@nordicsemiconductor/bdd-markdown'

/**
 * FIXME: use retry config from step, scenario, or feature
 */
export const getRetryConfig = (
	step: Step,
): {
	tries: number
	initialDelay: number
	delayFactor: number
} => {
	// Whether to enable retry?
	if (step.keyword === StepKeyword.Soon) {
		return {
			tries: 5,
			initialDelay: 250,
			delayFactor: 2,
		}
	}
	// Default retry configuration: no tries!
	return {
		tries: 1,
		initialDelay: 0,
		delayFactor: 0,
	}
}

export const formatRetryConfig = (
	cfg: ReturnType<typeof getRetryConfig>,
): string =>
	`@retry:tries=${cfg.tries},initialDelay=${cfg.initialDelay},delayFactor=${cfg.delayFactor}`
