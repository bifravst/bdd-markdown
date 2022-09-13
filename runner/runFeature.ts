import { Feature, Keyword, Row, Scenario } from '@bdd-markdown/parser/grammar'
import { replaceFromExamples } from './replaceFromExamples'
import { runScenario, ScenarioResult } from './runScenario'
import { StepRunner } from './runStep'

export type ScenarioExecution = Scenario & {
	example?: Row
}

export type FeatureResult = {
	ok: boolean
	results: [ScenarioExecution, ScenarioResult][]
	duration: number
}

export const runFeature = async <Context extends Record<string, any>>(
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
	}
}
