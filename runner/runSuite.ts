import { type ParsedPath } from 'path'
import { type LogObserver } from './logger.js'
import { orderFeatures } from './orderFeatures.js'
import { type FeatureFile } from './parseFeaturesInFolder.js'
import { runFeature, type FeatureResult } from './runFeature.js'
import { type StepRunner } from './runStep.js'

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
	name: string
}
export type Runner<Context extends Record<string, any>> = {
	run: (context?: Context) => Promise<SuiteResult>
	addStepRunners: (...stepRunners: StepRunner<Context>[]) => Runner<Context>
}

export const runSuite = <Context extends Record<string, any>>(
	featureFiles: FeatureFile[],
	name: string,
	logObserver?: LogObserver,
): Runner<Context> => {
	const stepRunners: StepRunner<Context>[] = []

	const runner: Runner<Context> = {
		addStepRunners: (...runners: StepRunner<Context>[]) => {
			stepRunners.push(...runners)
			return runner
		},
		run: async (context?: Context) => {
			if (featureFiles.length === 0)
				return {
					ok: false,
					results: [],
					summary: {
						duration: 0,
						failed: 0,
						passed: 0,
						skipped: 0,
						total: 0,
					},
					name,
				}

			const c: Context = context ?? ({} as Context)

			const featureResults: [ParsedPath, FeatureResult][] = []
			const featureNameResultMap: Record<string, boolean> = {}

			for (const { file, feature, skip } of orderFeatures(featureFiles)) {
				// Have dependency failed?
				const failedDependencies = (feature.frontMatter?.needs ?? []).filter(
					(dependencyName) => featureNameResultMap[dependencyName] === false,
				)

				let allOk = true

				for (const variant of feature.frontMatter?.variants ?? [{}]) {
					const result =
						failedDependencies.length > 0
							? {
									ok: false,
									skipped: true,
									results: [],
									duration: 0,
									logs: [],
							  }
							: skip === true
							? {
									ok: true,
									skipped: true,
									results: [],
									duration: 0,
									logs: [],
							  }
							: await runFeature({
									stepRunners,
									feature: { ...feature, variant },
									context: c,
									logObserver,
							  })
					featureResults.push([file, result])
					if (result.ok !== true) allOk = false
				}
				featureNameResultMap[feature.title ?? file.name] = allOk
			}

			return {
				ok: featureResults.reduce(
					(allOk, [, result]) => (result.ok ? allOk : false),
					true,
				),
				results: featureResults,
				summary: summarize(featureResults.map(([, f]) => f)),
				name,
			}
		},
	}

	return runner
}

const summarize = (results: FeatureResult[]): Summary => {
	const passed = results.filter(
		({ ok, skipped }) => ok === true && skipped === false,
	).length
	const failed = results.filter(
		({ ok, skipped }) => ok === false && skipped === false,
	).length
	const skipped = results.filter(({ skipped }) => skipped === true).length
	const duration = results.reduce((total, result) => total + result.duration, 0)
	return {
		total: results.length,
		passed,
		failed,
		duration,
		skipped,
	}
}
