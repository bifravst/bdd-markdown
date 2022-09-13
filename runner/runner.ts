import { Feature, Keyword, Row, Scenario, Step } from 'parser/grammar'
import { ParsedPath } from 'path'
import { parseFeaturesInFolder } from './parseFeaturesInFolder'
import { replaceFromExamples } from './replaceFromExamples'
import { Logger, StepLog, stepLogger } from './stepLogger'

export type RunResult = {
	ok: boolean
	results: [ParsedPath, FeatureResult][]
}

type ScenarioExecution = Scenario & {
	example?: Row
}

type FeatureResult = {
	ok: boolean
	results: [ScenarioExecution, ScenarioResult][]
	duration: number
}
type ScenarioResult = {
	ok: boolean
	skipped: boolean
	results: [Step, StepResult][]
	duration: number
}

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

type Runner<Context extends Record<string, any>> = {
	run: () => Promise<RunResult>
	addStepRunners: (...stepRunners: StepRunner<Context>[]) => Runner<Context>
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

export const runner = <Context extends Record<string, any>>(
	folderWithFeatures: string,
	context?: Context,
): Runner<Context> => {
	const stepRunners: StepRunner<Context>[] = []

	const runner: Runner<Context> = {
		addStepRunners: (...runners: StepRunner<Context>[]) => {
			stepRunners.push(...runners)
			return runner
		},
		run: async () => {
			const featuresFromFiles = await parseFeaturesInFolder(folderWithFeatures)

			const featureResults: [ParsedPath, FeatureResult][] = []

			for (const feature of featuresFromFiles) {
				featureResults.push([
					feature.file,
					await runFeature(
						stepRunners,
						feature.feature,
						// Create a new context per feature
						JSON.parse(JSON.stringify(context ?? {})),
					),
				])
			}

			return {
				ok: featureResults.reduce(
					(allOk, [, result]) => (result.ok ? allOk : false),
					true,
				),
				results: featureResults,
			}
		},
	}

	return runner
}

const runFeature = async <Context extends Record<string, any>>(
	stepRunners: StepRunner<Context>[],
	feature: Feature,
	context: Context,
): Promise<FeatureResult> => {
	const scenarioResults: [ScenarioExecution, ScenarioResult][] = []
	const startTs = Date.now()
	const getRelativeTs = () => Date.now() - startTs

	let aborted = false
	for (const scenario of feature.scenarios) {
		if (scenario.keyword === Keyword.ScenarioOutline) {
			for (const row of scenario.examples) {
				const scenarioFromExample: ScenarioExecution = {
					...scenario,
					keyword: Keyword.Scenario,
					steps: scenario.steps.map(replaceFromExamples(row)),
					example: row,
				}
				if (aborted) {
					scenarioResults.push([
						scenarioFromExample,
						{
							ok: false,
							skipped: true,
							results: [],
							duration: 0,
						},
					])
					continue
				}
				const result = await runScenario(
					stepRunners,
					feature,
					scenarioFromExample,
					// Re-use the same context
					context,
					getRelativeTs,
				)
				scenarioResults.push([scenarioFromExample, result])
				if (!result.ok) aborted = true
			}
		} else {
			if (aborted) {
				scenarioResults.push([
					scenario as Scenario,
					{
						ok: false,
						skipped: true,
						results: [],
						duration: 0,
					},
				])
				continue
			}
			const result = await runScenario(
				stepRunners,
				feature,
				scenario as Scenario,
				// Re-use the same context
				context,
				getRelativeTs,
			)
			scenarioResults.push([scenario as ScenarioExecution, result])
			if (!result.ok) aborted = true
		}
	}

	return {
		ok: scenarioResults.reduce(
			(allOk, [, result]) => (result.ok ? allOk : false),
			true,
		),
		results: scenarioResults,
		duration: Date.now() - startTs,
	}
}

const runScenario = async <Context extends Record<string, any>>(
	stepRunners: StepRunner<Context>[],
	feature: Feature,
	scenario: Scenario,
	context: Context,
	getRelativeTs: () => number,
): Promise<ScenarioResult> => {
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
				},
			])
			continue
		}

		const stepRunResult = await runStep(
			stepRunners,
			feature,
			scenario,
			step,
			// Re-use the same context
			context,
			stepResults.map(([step, stepResult]) => [step, stepResult.result]),
			getRelativeTs,
		)
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
		skipped: false,
		duration: Date.now() - startTs,
	}
}

const runStep = async <Context extends Record<string, any>>(
	stepRunners: StepRunner<Context>[],
	feature: Feature,
	scenario: Scenario,
	step: Step,
	context: Context,
	previousResults: [Step, any][],
	getRelativeTs: () => number,
): Promise<Omit<StepResult, 'skipped'>> => {
	const logs = stepLogger({ getRelativeTs })

	const startTs = Date.now()
	try {
		for (const stepRunner of stepRunners) {
			const maybeRun = await stepRunner({
				step,
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
		message: `No runner defined for step: ${step.title}`,
	})
	return {
		ok: false,
		logs: logs.getLogs(),
		duration: 0,
	}
}
