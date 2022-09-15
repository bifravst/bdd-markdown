import {
	Feature,
	Scenario,
	Step,
	StepKeyword,
} from '@nordicsemiconductor/bdd-markdown/parser/grammar'
import { formatRetryConfig, getRetryConfig } from './getRetryConfig.js'
import { getUnreplacedPlaceholders } from './getUnreplacedPlaceholders.js'
import { LogEntry, logger, Logger } from './logger.js'
import { replaceFromContext } from './replaceFromContext.js'
import { ScenarioExecution } from './runFeature.js'

export type StepResult = {
	ok: boolean
	skipped: boolean
	result?: any
	/**
	 * The printable version of the result, if present, will be used instead of the result.
	 */
	printable?: string
	logs: LogEntry[]
	duration: number
}

export const noMatch = { matched: false }
export const isMatch = { matched: true }
export type StepMatched = {
	matched: true
	result?: any
	/**
	 * The printable version of the result, if present, will be used instead of the result.
	 */
	printable?: string
}
export type StepRunResult = typeof noMatch | StepMatched
export type StepRunnerArgs<Context extends Record<string, any>> = {
	step: Step
	scenario: ScenarioExecution
	feature: Feature
	context: Context
	log: {
		step: Logger
		scenario: Logger
		feature: Logger
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
}: {
	stepRunners: StepRunner<Context>[]
	feature: Feature
	scenario: Scenario
	step: Step
	context: Context
	previousResults: [Step, any][]
	getRelativeTs: () => number
	featureLogger: Logger
	scenarioLogger: Logger
}): Promise<Omit<StepResult, 'skipped'>> => {
	const stepLogger = logger({ getRelativeTs })

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
		}
	}

	// Retry configuration
	let tries = 1
	let initialDelay = 0
	let delayFactor = 0
	const retriesEnabled = step.keyword === StepKeyword.Soon
	if (retriesEnabled) {
		const retryConfig = getRetryConfig(step)
		stepLogger.debug(formatRetryConfig(retryConfig))
		tries = retryConfig.tries
		initialDelay = retryConfig.initialDelay
		delayFactor = retryConfig.delayFactor
	}
	let delay = initialDelay

	const startTs = Date.now()
	try {
		for (const stepRunner of stepRunners) {
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
				}
			}

			for (let i = 0; i < Math.max(1, tries); i++) {
				try {
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
					if (maybeRun.matched === false) break
					return {
						logs: stepLogger.getLogs(),
						ok: true,
						result: (maybeRun as StepMatched).result,
						printable: (maybeRun as StepMatched).printable,
						duration: Date.now() - startTs,
					}
				} catch (err) {
					if (!retriesEnabled) throw err
					// TODO: test retries
					// it did not not-match, but threw an error
					await new Promise((resolve) => setTimeout(resolve, delay))
					delay = delay * delayFactor
					stepLogger.progress(`Retrying ... (${i + 2})`)
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
		}
	}
	stepLogger.error({
		message: `No runner defined for step: ${replacedStep.title}`,
	})
	return {
		ok: false,
		logs: stepLogger.getLogs(),
		duration: 0,
	}
}
