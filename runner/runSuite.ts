import path, { type ParsedPath } from 'path'
import {
	logger,
	type LogEntry,
	type LogObserver,
	type Logger,
} from './logger.js'
import { type FeatureFile } from './parseFeaturesInFolder.js'
import {
	suiteWalker,
	type ScenarioWithExamples,
	type FeatureVariant,
} from './suiteWalker.js'
import os from 'node:os'
import type { Step } from '../parser/grammar.js'

export type StepRunnerArgs<Context extends Record<string, any>> = {
	feature: FeatureVariant
	scenario: ScenarioWithExamples
	step: Step
	context: Context
	log: Logger
}
export type StepRunnerFn<Context extends Record<string, any>> = (
	args: StepRunnerArgs<Context>,
) => Promise<void>
export type StepRunner<
	Context extends Record<string, any> = Record<string, any>,
> = {
	match: (title: string) => boolean
	run: StepRunnerFn<Context>
}

type Summary = {
	total: number
	passed: number
	skipped: number
	failed: number
	duration: number
}
export type SuiteResult = {
	startTime: number
	duration: number
	ok: boolean
	results: [ParsedPath, FeatureResult][]
	summary: Summary
	name: string
}
export type Runner<Context extends Record<string, any> = Record<string, any>> =
	{
		run: (context?: Context) => Promise<SuiteResult>
		addStepRunners: (...stepRunners: StepRunner<Context>[]) => Runner<Context>
	}

export const runSuite = <Context extends Record<string, any>>(
	suite: FeatureFile[],
	name: string,
	logObserver?: LogObserver,
): Runner<Context> => {
	const startTime = Date.now()
	const stepRunners: StepRunner<Context>[] = []

	const runner: Runner<Context> = {
		addStepRunners: (...runners: StepRunner<Context>[]) => {
			stepRunners.push(...runners)
			return runner
		},
		run: async (context?: Context) => {
			// Collect step runners
			const matchedStepRunners: Record<string, StepRunnerFn<Context>> = {}
			await suiteWalker(suite)
				.onStep(({ file, step }) => {
					const matches = stepRunners.filter(({ match }) => match(step.title))
					const key = `${path.format(file)}:${step.line}`
					if (matches.length > 1)
						throw new Error(
							[`Multiple runners matched for step: "${step.title}"!`, key].join(
								os.EOL,
							),
						)
					if (matches[0] === undefined)
						throw new Error(
							[`No runner matched for step: "${step.title}"!`, key].join(
								os.EOL,
							),
						)
					matchedStepRunners[key] = matches[0].run
				})
				.walk()

			// Run suite
			const c: Context = context ?? ({} as Context)
			const featureResults: [ParsedPath, FeatureResult][] = []
			const featureNameResultMap: Record<string, boolean> = {}
			let stepResults: [Step, StepResult][] = []
			let scenarioResults: [ScenarioWithExamples, ScenarioResult][] = []
			let scenarioStart: number
			let featureStart: number
			let skipFeature: boolean = false
			let skipScenario: boolean = false
			let skipRemainingSteps: boolean = false
			await suiteWalker(suite, c)
				.onFeature(({ feature, skip }) => {
					scenarioResults = []
					skipScenario = false
					skipRemainingSteps = false
					featureStart = Date.now()
					skipFeature = skip
					// Have dependency failed?
					if (
						(feature.frontMatter?.needs ?? []).find(
							(dependencyName) =>
								featureNameResultMap[dependencyName] === false,
						) !== undefined
					)
						skipFeature = true
				})
				.onFeatureEnd(({ file, feature }) => {
					const ok =
						scenarioResults.find(([, { ok }]) => ok === false) === undefined
					featureResults.push([
						file,
						{
							duration: Date.now() - featureStart,
							ok,
							skipped: skipFeature,
							results: scenarioResults,
						},
					])
					featureNameResultMap[feature.title ?? file.name] = ok
				})
				.onScenario(() => {
					stepResults = []
					scenarioStart = Date.now()
					// Skip scenarios if previous has failed
					skipScenario =
						scenarioResults.find(([, { ok }]) => ok === false) !== undefined
				})
				.onScenarioEnd(({ scenario }) => {
					if (skipScenario) {
						scenarioResults.push([
							scenario,
							{
								duration: 0,
								ok: false,
								results: [],
								skipped: true,
								tries: 0,
							},
						])
						return
					}
					scenarioResults.push([
						scenario,
						{
							duration: Date.now() - scenarioStart,
							ok: stepResults.find(([, { ok }]) => ok === false) === undefined,
							results: stepResults,
							skipped: false,
							tries: 1,
						},
					])
				})
				.onStep(async ({ step, file, feature, scenario }) => {
					const key = `${path.format(file)}:${step.line}`
					const runner = matchedStepRunners[key]
					if (runner === undefined)
						throw new Error(
							[`No runner matched for step: "${step.title}"!`, key].join(
								os.EOL,
							),
						)

					if (skipFeature || skipScenario || skipRemainingSteps) {
						stepResults.push([
							step,
							{
								duration: 0,
								logs: [],
								ok: true,
								skipped: true,
							},
						])
						return
					}

					const stepLogger = logger({ ...logObserver, step })

					const start = Date.now()
					try {
						await runner({
							context: c,
							feature,
							scenario,
							step,
							log: stepLogger,
						})
						stepResults.push([
							step,
							{
								duration: Date.now() - start,
								logs: stepLogger.getLogs(),
								ok: true,
								skipped: false,
							},
						])
					} catch (error) {
						stepLogger.error({
							message: (error as Error).message,
							detail: error,
						})
						stepResults.push([
							step,
							{
								duration: Date.now() - start,
								logs: stepLogger.getLogs(),
								ok: false,
								skipped: false,
							},
						])
						skipRemainingSteps = true
					}
				})
				.walk()

			return {
				startTime,
				duration: Date.now() - startTime,
				ok:
					featureResults.length > 0 &&
					featureResults.reduce(
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

export type FeatureResult = {
	ok: boolean
	skipped: boolean
	results: [ScenarioWithExamples, ScenarioResult][]
	duration: number
}

export type ScenarioResult = {
	ok: boolean
	skipped: boolean
	results: [Step, StepResult][]
	duration: number
	tries: number
}

export type StepResult = {
	ok: boolean
	skipped: boolean
	logs: LogEntry[]
	duration: number
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
