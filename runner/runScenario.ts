import type { Feature, Scenario, Step } from '../parser/grammar.js'
import { getRetryConfig } from './getRetryConfig.js'
import {
	logger,
	type LogEntry,
	type LogObserver,
	type Logger,
} from './logger.js'
import type { FeatureExecution, ScenarioExecution } from './runFeature.js'
import {
	runStep,
	scenarioRetryEnabled,
	type StepResult,
	type StepRunner,
} from './runStep.js'

export type ScenarioResult = {
	ok: boolean
	skipped: boolean
	results: [Step, StepResult][]
	duration: number
	logs: LogEntry[]
	tries: number
}

export const runScenario = async <Context extends Record<string, any>>(args: {
	stepRunners: StepRunner<Context>[]
	feature: FeatureExecution
	scenario: ScenarioExecution
	context: Context
	featureLogger: Logger<Feature>
	getRelativeTs: () => number
	logObserver?: LogObserver
}): Promise<Omit<ScenarioResult, 'skipped'>> => {
	const scenarioLogger = logger({
		getRelativeTs: args.getRelativeTs,
		context: args.scenario,
		...args.logObserver,
	})
	let result: Omit<ScenarioResult, 'skipped'>
	let failedStep: Step | undefined
	let numTry = 1
	do {
		if (numTry > 1) scenarioLogger.progress(`Retrying ... (${numTry})`)
		result = {
			tries: numTry,
			...(await runScenarioOnce({ ...args, scenarioLogger, numTry })),
		}
		failedStep = getFailedStep(result)
	} while (
		scenarioFailed(result) &&
		failedStep !== undefined &&
		scenarioRetryEnabled(failedStep) &&
		// Retry as often as the retry config of the step defines
		++numTry <= getRetryConfig(failedStep, args.scenario, args.feature).tries
	)
	return result
}

const scenarioFailed = (result: Omit<ScenarioResult, 'skipped'>): boolean =>
	result.ok !== true

const getFailedStep = (
	result: Omit<ScenarioResult, 'skipped'>,
): Step | undefined =>
	result.ok === false
		? result.results.find(([, result]) => result.ok === false)?.[0]
		: undefined

const runScenarioOnce = async <Context extends Record<string, any>>({
	stepRunners,
	feature,
	scenario,
	context,
	getRelativeTs,
	featureLogger,
	scenarioLogger,
	logObserver,
	numTry,
}: {
	stepRunners: StepRunner<Context>[]
	feature: FeatureExecution
	scenario: ScenarioExecution
	context: Context
	featureLogger: Logger<Feature>
	scenarioLogger: ReturnType<typeof logger<Scenario>>
	getRelativeTs: () => number
	logObserver?: LogObserver
	numTry: number
}): Promise<Omit<ScenarioResult, 'skipped' | 'tries'>> => {
	const startTs = Date.now()
	const stepResults: [Step, StepResult][] = []
	let aborted = false
	for (const step of scenario.steps) {
		if (aborted) {
			stepResults.push([
				step,
				{
					logs: [],
					ok: false,
					skipped: true,
					duration: 0,
					executed: step,
					tries: 0,
				},
			])
			continue
		}

		const retryConfig = getRetryConfig(step, scenario, feature)
		if (numTry > 1 && retryConfig.delayExecution !== undefined) {
			await new Promise((resolve) =>
				setTimeout(resolve, retryConfig.delayExecution),
			)
		}

		const stepRunResult = await runStep({
			stepRunners,
			feature,
			scenario,
			step,
			context,
			previousResults: stepResults.map(([step, stepResult]) => [
				step,
				stepResult.result,
			]),
			getRelativeTs,
			featureLogger,
			scenarioLogger,
			logObserver,
			numTry,
		})
		stepResults.push([
			step,
			{
				...stepRunResult,
				skipped: false,
			},
		])
		if (!stepRunResult.ok) aborted = true
	}

	return {
		ok: stepResults.reduce(
			(allOk, [, result]) => (result.ok ? allOk : false),
			true,
		),
		results: stepResults,
		duration: Date.now() - startTs,
		logs: scenarioLogger.getLogs(),
	}
}
