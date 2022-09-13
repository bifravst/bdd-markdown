import { Feature, Scenario, Step } from '@bdd-markdown/parser/grammar'
import { getUnreplacedPlaceholders } from './getUnreplacedPlaceholders'
import { replaceFromContext } from './replaceFromContext'
import { ScenarioExecution } from './runFeature'
import { Logger, StepLog, stepLogger } from './stepLogger'

export type StepResult = {
	ok: boolean
	skipped: boolean
	result?: any
	/**
	 * The printable version of the result, if present, will be used instead of the result.
	 */
	printable?: string
	logs: StepLog[]
	duration: number
}

export const noMatch = { matched: false }
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
	log: Logger
	previousResult?: [Step, any]
	previousResults: [Step, any][]
}
export type StepRunner<Context extends Record<string, any>> = (
	args: StepRunnerArgs<Context>,
) => Promise<StepRunResult>

export const runStep = async <Context extends Record<string, any>>(
	stepRunners: StepRunner<Context>[],
	feature: Feature,
	scenario: Scenario,
	step: Step,
	context: Context,
	previousResults: [Step, any][],
	getRelativeTs: () => number,
): Promise<Omit<StepResult, 'skipped'>> => {
	const logs = stepLogger({ getRelativeTs })

	const replacedStep = replaceFromContext(context)(step)

	const unreplaced = getUnreplacedPlaceholders(replacedStep)
	if (unreplaced.length > 0) {
		logs.error({
			message: `Step has unreplaced placeholders: ${unreplaced.join(', ')}`,
			detail: unreplaced,
		})
		return {
			ok: false,
			logs: logs.getLogs(),
			duration: 0,
		}
	}

	const startTs = Date.now()
	try {
		for (const stepRunner of stepRunners) {
			if (typeof stepRunner !== 'function') {
				logs.error({
					message: `All step runners must be a function, encountered ${JSON.stringify(
						stepRunner,
					)}`,
				})
				return {
					logs: logs.getLogs(),
					ok: false,
					duration: 0,
				}
			}
			const maybeRun = await stepRunner({
				step: replacedStep,
				context,
				feature,
				scenario,
				log: logs,
				previousResults,
				previousResult: previousResults[previousResults.length - 1]?.[1],
			})
			if (maybeRun.matched === false) continue
			return {
				logs: logs.getLogs(),
				ok: true,
				result: (maybeRun as StepMatched).result,
				printable: (maybeRun as StepMatched).printable,
				duration: Date.now() - startTs,
			}
		}
	} catch (err) {
		logs.error({
			message: (err as Error).message,
		})
		return {
			logs: logs.getLogs(),
			ok: false,
			duration: Date.now() - startTs,
		}
	}
	logs.error({
		message: `No runner defined for step: ${replacedStep.title}`,
	})
	return {
		ok: false,
		logs: logs.getLogs(),
		duration: 0,
	}
}
