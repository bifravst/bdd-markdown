import {
	StepKeyword,
	type Feature,
	type Scenario,
	type Step,
} from '../parser/grammar.js'
import { formatRetryConfig, getRetryConfig } from './getRetryConfig.js'
import { getUnreplacedPlaceholders } from './getUnreplacedPlaceholders.js'
import {
	logger,
	type LogEntry,
	type LogObserver,
	type Logger,
} from './logger.js'
import { replaceFromContext } from './replaceFromContext.js'
import { type ScenarioExecution } from './runFeature.js'

export type StepResult = {
	ok: boolean
	skipped: boolean
	result?: any
	/**
	 * The printable version of the result, if present, will be used instead of the undefined
	 */
	printable?: string
	logs: LogEntry[]
	duration: number
	/**
	 * The executed step with all replacements applied
	 */
	executed: Step
	tries: number
}

export const noMatch = Symbol('Step did not match.')
export type StepMatched = void | {
	result?: any
	/**
	 * The printable version of the result, if present, will be used instead of the result.
	 */
	printable?: string
}
export type StepRunResult = typeof noMatch | void | StepMatched
export type StepRunnerArgs<Context extends Record<string, any>> = {
	step: Step
	scenario: ScenarioExecution
	feature: Feature
	context: Context
	log: {
		step: Logger<Step>
		scenario: Logger<Scenario>
		feature: Logger<Feature>
	}
	previousResult?: [Step, any]
	previousResults: [Step, any][]
}
export type StepRunner<Context extends Record<string, any>> = (
	args: StepRunnerArgs<Context>,
) => Promise<StepRunResult>

export const runStep = async <Context extends Record<string, any>>({
	stepRunners,
	feature,
	scenario,
	step,
	context,
	previousResults,
	getRelativeTs,
	featureLogger,
	scenarioLogger,
	logObserver,
}: {
	stepRunners: StepRunner<Context>[]
	feature: Feature
	scenario: Scenario
	step: Step
	context: Context
	previousResults: [Step, any][]
	getRelativeTs: () => number
	featureLogger: Logger<Feature>
	scenarioLogger: Logger<Scenario>
	logObserver?: LogObserver
}): Promise<Omit<StepResult, 'skipped'>> => {
	const stepLogger = logger({ getRelativeTs, context: step, ...logObserver })

	const replacedStep = replaceFromContext(context)(step)
	const unreplaced = getUnreplacedPlaceholders(replacedStep)
	if (unreplaced.length > 0) {
		stepLogger.error({
			message: `Step has unreplaced placeholders: ${unreplaced.join(', ')}`,
			detail: unreplaced,
		})
		return {
			ok: false,
			logs: stepLogger.getLogs(),
			duration: 0,
			executed: replacedStep,
			tries: 0,
		}
	}

	// Retry configuration
	let tries = 1
	let initialDelay = 0
	let delayFactor = 0
	const retriesEnabled =
		step.keyword === StepKeyword.Soon &&
		// The entire scenario should be retried on failure
		!scenarioRetryEnabled(step)
	if (retriesEnabled) {
		const retryConfig = getRetryConfig(step, scenario, feature)
		stepLogger.debug(formatRetryConfig(retryConfig))
		tries = retryConfig.tries
		initialDelay = retryConfig.initialDelay
		delayFactor = retryConfig.delayFactor
	}
	let delay = initialDelay

	const startTs = Date.now()
	let numTry = 0
	try {
		for (const stepRunner of stepRunners) {
			numTry = 0
			if (typeof stepRunner !== 'function') {
				stepLogger.error({
					message: `All step runners must be a function, encountered ${JSON.stringify(
						stepRunner,
					)}`,
				})
				return {
					logs: stepLogger.getLogs(),
					ok: false,
					duration: 0,
					executed: step,
					tries: 0,
				}
			}

			const maxTries = Math.max(1, tries)
			for (let i = 0; i < maxTries; i++) {
				try {
					numTry++
					if (numTry > 1) stepLogger.progress(`Retrying ... (${numTry})`)
					const maybeRun = await stepRunner({
						step: replacedStep,
						context,
						feature,
						scenario,
						log: {
							step: stepLogger,
							scenario: scenarioLogger,
							feature: featureLogger,
						},
						previousResults,
						previousResult: previousResults[previousResults.length - 1]?.[1],
					})
					if (maybeRun === noMatch) break
					return {
						logs: stepLogger.getLogs(),
						ok: true,
						result: maybeRun?.result,
						printable: maybeRun?.printable,
						duration: Date.now() - startTs,
						executed: replacedStep,
						tries: numTry,
					}
				} catch (err) {
					if (!retriesEnabled) throw err
					if (i + 1 === maxTries) throw err // Retries exhausted
					// it did not not-match, but threw an error
					await new Promise((resolve) => setTimeout(resolve, delay))
					delay = delay * delayFactor
				}
			}
		}
	} catch (err) {
		stepLogger.error({
			message: (err as Error).message,
		})
		return {
			logs: stepLogger.getLogs(),
			ok: false,
			duration: Date.now() - startTs,
			executed: replacedStep,
			tries: numTry,
		}
	}
	stepLogger.error({
		message: `No runner defined for step: ${replacedStep.title}`,
	})
	return {
		ok: false,
		logs: stepLogger.getLogs(),
		duration: 0,
		executed: replacedStep,
		tries: 0,
	}
}

export const scenarioRetryEnabled = (step: Step): boolean =>
	step.comment?.tags?.['retryScenario'] !== undefined
