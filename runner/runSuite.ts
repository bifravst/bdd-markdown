import { ParsedPath } from 'path'
import { orderFeatures } from './orderFeatures.js'
import { FeatureFile } from './parseFeaturesInFolder.js'
import { FeatureResult, runFeature } from './runFeature.js'
import { StepRunner } from './runStep.js'

type Summary = {
	total: number
	passed: number
	skipped: number
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
			const featureNameResultMap: Record<string, boolean> = {}

			for (const { file, feature } of orderFeatures(featureFiles)) {
				// Have dependency failed?
				const failedDependencies = (feature.frontMatter?.needs ?? []).filter(
					(dependencyName) => featureNameResultMap[dependencyName] === false,
				)

				const result =
					failedDependencies.length > 0
						? {
								ok: false,
								skipped: true,
								results: [],
								duration: 0,
								logs: [],
						  }
						: await runFeature({
								stepRunners,
								feature,
								// Create a new context per feature
								context: JSON.parse(JSON.stringify(context ?? {})),
						  })
				featureResults.push([file, result])
				featureNameResultMap[feature.title ?? file.name] = result.ok
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
	const failed = results.filter(
		({ ok, skipped }) => ok === false && skipped === false,
	).length
	const skipped = results.filter(({ skipped }) => skipped === false).length
	const duration = results.reduce((total, result) => total + result.duration, 0)
	return {
		total: results.length,
		passed,
		failed,
		duration,
		skipped,
	}
}
