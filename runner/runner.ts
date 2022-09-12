import { Feature, Keyword, Row, Scenario, Step } from 'parser/grammar'
import { ParsedPath } from 'path'
import { parseFeaturesInFolder } from './parseFeaturesInFolder'

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
}
type ScenarioResult = {
	ok: boolean
	skipped: boolean
	results: [Step, StepResult][]
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
}

type Runner<Context extends Record<string, any>> = {
	run: () => Promise<RunResult>
	addStepRunner: (stepRunner: StepRunner<Context>) => Runner<Context>
}

type Logger = {
	debug: (...args: any[]) => void
	info: (...args: string[]) => void
	error: (error: ErrorInfo) => void
	progress: (...args: string[]) => void
}

export enum LogLevel {
	DEBUG = 'debug',
	INFO = 'info',
	ERROR = 'error',
	PROGRESS = 'progress',
}

type StepLog = {
	level: LogLevel
	message: string[]
	ts: Date
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
type StepRunner<Context extends Record<string, any>> = (args: {
	step: Step
	scenario: ScenarioExecution
	feature: Feature
	context: Context
	logs: Logger
	previousResult?: [Step, any]
	previousResults: [Step, any][]
}) => Promise<typeof noMatch | StepMatched>

export const runner = <Context extends Record<string, any>>(
	folderWithFeatures: string,
	context?: Context,
): Runner<Context> => {
	const stepRunners: StepRunner<Context>[] = []

	const runner: Runner<Context> = {
		addStepRunner: (stepRunner: StepRunner<Context>) => {
			stepRunners.push(stepRunner)
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
	}
}

const runScenario = async <Context extends Record<string, any>>(
	stepRunners: StepRunner<Context>[],
	feature: Feature,
	scenario: Scenario,
	context: Context,
): Promise<ScenarioResult> => {
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
	}
}

const replaceFromExamples =
	(row: Row) =>
	(step: Step): Step => ({
		...step,
		title: replacePlaceholders(step.title, row),
		codeBlock:
			step.codeBlock === undefined
				? undefined
				: {
						...step.codeBlock,
						code: replacePlaceholders(step.codeBlock.code, row),
				  },
	})

const replacePlaceholders = (s: string, row: Row): string =>
	Object.entries(row).reduce(
		(replaced, [k, v]) => (replaced = replaced.replace(`\${${k}}`, v)),
		s,
	)

const runStep = async <Context extends Record<string, any>>(
	stepRunners: StepRunner<Context>[],
	feature: Feature,
	scenario: Scenario,
	step: Step,
	context: Context,
	previousResults: [Step, any][],
): Promise<{
	ok: boolean
	logs: StepLog[]
	result?: any
	printable?: string
}> => {
	const logs = stepLogger()

	try {
		for (const stepRunner of stepRunners) {
			const maybeRun = await stepRunner({
				step,
				context,
				feature,
				scenario,
				logs,
				previousResults,
				previousResult: previousResults[previousResults.length - 1]?.[1],
			})
			if (maybeRun.matched === false) continue
			return {
				logs: logs.getLogs(),
				ok: true,
				result: (maybeRun as StepMatched).result,
				printable: (maybeRun as StepMatched).printable,
			}
		}
	} catch (err) {
		logs.error({
			message: (err as Error).message,
		})
		return {
			logs: logs.getLogs(),
			ok: false,
		}
	}
	logs.error({
		message: `No runner defined for step: ${step.title}`,
	})
	return {
		ok: false,
		logs: logs.getLogs(),
	}
}

type ErrorInfo = {
	message: string
}

const stepLogger = (): Logger & { getLogs: () => StepLog[] } => {
	const logs: StepLog[] = []
	return {
		debug: (...message) =>
			logs.push({
				message,
				level: LogLevel.DEBUG,
				ts: new Date(),
			}),
		progress: (...message) =>
			logs.push({
				message,
				level: LogLevel.PROGRESS,
				ts: new Date(),
			}),
		info: (...message) =>
			logs.push({
				message,
				level: LogLevel.INFO,
				ts: new Date(),
			}),
		error: (error) =>
			logs.push({
				message: [error.message],
				level: LogLevel.ERROR,
				ts: new Date(),
			}),
		getLogs: () => logs,
	}
}
