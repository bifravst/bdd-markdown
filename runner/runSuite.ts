import { ParsedPath } from 'path'
import { FeatureFile } from './parseFeaturesInFolder'
import { FeatureResult, runFeature } from './runFeature'
import { StepRunner } from './runStep'

type Summary = {
	total: number
	passed: number
	failed: number
	duration: number
}
export type SuiteResult = {
	ok: boolean
	results: [ParsedPath, FeatureResult][]
	summary: Summary
}
export type Runner<Context extends Record<string, any>> = {
	run: (context?: Context) => Promise<SuiteResult>
	addStepRunners: (...stepRunners: StepRunner<Context>[]) => Runner<Context>
}
export const runSuite = <Context extends Record<string, any>>(
	featureFiles: FeatureFile[],
): Runner<Context> => {
	const stepRunners: StepRunner<Context>[] = []

	const runner: Runner<Context> = {
		addStepRunners: (...runners: StepRunner<Context>[]) => {
			stepRunners.push(...runners)
			return runner
		},
		run: async (context?: Context) => {
			const featureResults: [ParsedPath, FeatureResult][] = []

			for (const { file, feature } of featureFiles) {
				featureResults.push([
					file,
					await runFeature(
						stepRunners,
						feature,
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
				summary: summarize(featureResults.map(([, f]) => f)),
			}
		},
	}

	return runner
}

const summarize = (results: FeatureResult[]): Summary => {
	const passed = results.filter(({ ok }) => ok === true).length
	const failed = results.filter(({ ok }) => ok !== true).length
	const duration = results.reduce((total, result) => total + result.duration, 0)
	return {
		total: results.length,
		passed,
		failed,
		duration,
	}
}
