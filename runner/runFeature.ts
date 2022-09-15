import {
	Feature,
	Keyword,
	Row,
	Scenario,
} from '@nordicsemiconductor/bdd-markdown/parser/grammar'
import { LogEntry, logger } from './logger.js'
import { replaceFromExamples } from './replaceFromExamples.js'
import { runScenario, ScenarioResult } from './runScenario.js'
import { StepRunner } from './runStep.js'

export type ScenarioExecution = Scenario & {
	example?: Row
}

export type FeatureResult = {
	ok: boolean
	results: [ScenarioExecution, ScenarioResult][]
	duration: number
	logs: LogEntry[]
}

export const runFeature = async <Context extends Record<string, any>>({
	stepRunners,
	feature,
	context,
	getRelativeTs,
}: {
	stepRunners: StepRunner<Context>[]
	feature: Feature
	context: Context
	getRelativeTs?: () => number
}): Promise<FeatureResult> => {
	const scenarioResults: [ScenarioExecution, ScenarioResult][] = []
	const startTs = Date.now()
	const relTs = getRelativeTs ?? (() => Date.now() - startTs)
	const featureLogger = logger({ getRelativeTs: relTs })

	let aborted = false
	for (const scenario of feature.scenarios) {
		if (scenario.keyword === Keyword.ScenarioOutline) {
			for (const row of scenario.examples) {
				const { examples: _, ...scenarioRest } = scenario
				const scenarioFromExample: ScenarioExecution = {
					...scenarioRest,
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
							logs: [],
						},
					])
					continue
				}
				const result = await runScenario({
					stepRunners,
					feature,
					scenario: scenarioFromExample,
					// Re-use the same context
					context,
					getRelativeTs: relTs,
					featureLogger,
				})
				scenarioResults.push([
					scenarioFromExample,
					{
						...result,
						skipped: false,
					},
				])
				if (!result.ok) aborted = true
			}
		} else {
			if (aborted) {
				scenarioResults.push([
					scenario,
					{
						ok: false,
						skipped: true,
						results: [],
						duration: 0,
						logs: [],
					},
				])
				continue
			}
			const result = await runScenario({
				stepRunners,
				feature,
				scenario,
				// Re-use the same context
				context,
				getRelativeTs: relTs,
				featureLogger,
			})
			scenarioResults.push([
				scenario as ScenarioExecution,
				{
					...result,
					skipped: false,
				},
			])
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
		logs: featureLogger.getLogs(),
	}
}
