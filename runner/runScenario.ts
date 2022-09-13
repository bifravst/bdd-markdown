import { Feature, Scenario, Step } from '@bdd-markdown/parser/grammar'
import { runStep, StepResult, StepRunner } from './runStep'

export type ScenarioResult = {
	ok: boolean
	skipped: boolean
	results: [Step, StepResult][]
	duration: number
}

export const runScenario = async <Context extends Record<string, any>>(
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
