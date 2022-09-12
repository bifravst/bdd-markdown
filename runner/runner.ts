import { Feature, Keyword, Row, Scenario, Step } from 'parser/grammar'
import { ParsedPath } from 'path'
import { parseFeaturesInFolder } from './parseFeaturesInFolder'

export type RunResult = {
	ok: boolean
	results: [ParsedPath, FeatureResult][]
}

type FeatureResult = {
	ok: boolean
	results: [Scenario, ScenarioResult][]
}
type ScenarioResult = {
	ok: boolean
	results: [Step, StepResult][]
}

type StepResult = {
	ok: boolean
	result?: any
	logs: StepLog[]
}

type Runner<Context extends Record<string, any>> = {
	run: () => Promise<RunResult>
	addStepRunner: (stepRunner: StepRunner<Context>) => Runner<Context>
}

type Logger = {
	debug: (...args: string[]) => void
	info: (...args: string[]) => void
	error: (error: ErrorInfo) => void
	progress: (...args: string[]) => void
}

enum LogLevel {
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

type StepRunner<Context extends Record<string, any>> = {
	runs: (title: Step['title']) => boolean
	run: (args: {
		step: Step
		scenario: Scenario
		feature: Feature
		context: Context
		logs: Logger
		previousResult?: any
	}) => Promise<RunResult>
}

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
	const scenarioResults: [Scenario, ScenarioResult][] = []

	for (const scenario of feature.scenarios) {
		if (scenario.keyword === Keyword.ScenarioOutline) {
			for (const row of scenario.examples) {
				const scenarioFromExample: Scenario = {
					...scenario,
					keyword: Keyword.Scenario,
					steps: scenario.steps.map(replaceFromExamples(row)),
				}
				scenarioResults.push([
					scenarioFromExample,
					await runScenario(
						stepRunners,
						feature,
						scenarioFromExample,
						// Re-use the same context
						context,
					),
				])
			}
		} else {
			scenarioResults.push([
				scenario as Scenario,
				await runScenario(
					stepRunners,
					feature,
					scenario as Scenario,
					// Re-use the same context
					context,
				),
			])
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

	for (const step of scenario.steps) {
		const stepRunResult = await runStep(
			stepRunners,
			feature,
			scenario,
			step,
			// Re-use the same context
			context,
		)
		stepResults.push([step, stepRunResult])
	}

	return {
		ok: stepResults.reduce(
			(allOk, [, result]) => (result.ok ? allOk : false),
			true,
		),
		results: stepResults,
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
): Promise<{ ok: boolean; logs: StepLog[]; result?: any }> => {
	const logs = stepLogger()
	const stepRunner = stepRunners.find((r) => r.runs(step.title))
	if (stepRunner === undefined) {
		logs.error({
			message: `No runner defined for step: ${step.title}`,
		})
		return {
			ok: false,
			logs: logs.getLogs(),
		}
	}

	const stepResult = await stepRunner.run({
		step,
		context,
		feature,
		scenario,
		logs,
	})

	return {
		...stepResult,
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
