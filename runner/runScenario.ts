import type { Feature, Scenario, Step } from '../parser/grammar.js'
import {
	logger,
	type LogEntry,
	type LogObserver,
	type Logger,
} from './logger.js'
import { runStep, type StepResult, type StepRunner } from './runStep.js'

export type ScenarioResult = {
	ok: boolean
	skipped: boolean
	results: [Step, StepResult][]
	duration: number
	logs: LogEntry[]
}

export const runScenario = async <Context extends Record<string, any>>({
	stepRunners,
	feature,
	scenario,
	context,
	getRelativeTs,
	featureLogger,
	logObserver,
}: {
	stepRunners: StepRunner<Context>[]
	feature: Feature
	scenario: Scenario
	context: Context
	featureLogger: Logger<Feature>
	getRelativeTs: () => number
	logObserver?: LogObserver
}): Promise<Omit<ScenarioResult, 'skipped'>> => {
	const startTs = Date.now()
	const scenarioLogger = logger({
		getRelativeTs,
		context: scenario,
		...logObserver,
	})
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
