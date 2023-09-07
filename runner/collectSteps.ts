import type { Step } from '../parser/grammar.js'
import type { FeatureFile } from './parseFeaturesInFolder.js'
import os from 'node:os'
import path from 'node:path'

/**
 * Collect the step runners for all steps in the suite.
 */
export const collectSteps = (
	suite: FeatureFile[],
	stepRunners: StepRunnerV2[],
): Record<string, StepRunnerFn> => {
	const stepRunnerMatches: Record<string, StepRunnerFn> = {}
	for (const featureFile of suite) {
		const { feature, file } = featureFile
		const stepsToMatch: Step[] = []

		if (feature.background !== undefined) {
			stepsToMatch.push(...feature.background.steps)
		}

		if (feature.rules !== undefined) {
			stepsToMatch.push(
				...feature.rules.flatMap(({ scenarios }) =>
					scenarios.flatMap(({ steps }) => steps),
				),
			)
		}

		stepsToMatch.push(...feature.scenarios.flatMap(({ steps }) => steps))

		for (const step of stepsToMatch) {
			const runners = stepRunners.filter(({ matches }) => matches(step))

			if (runners.length === 0) {
				throw new Error(
					[
						`No runner matched the step!`,
						`${step.keyword} ${step.title}`,
						`in ${file.name}:${step.line}`,
					].join(os.EOL),
				)
			}

			if (runners.length > 1) {
				throw new Error(
					[
						`More than one runner matched the step!`,
						`${step.keyword} ${step.title}`,
						`in ${file.name}:${step.line}`,
					].join(os.EOL),
				)
			}

			stepRunnerMatches[stepId(step, featureFile)] = (
				runners[0] as StepRunnerV2
			).run
		}
	}
	return stepRunnerMatches
}
export type StepRunnerFn = () => Promise<unknown>
type StepRunnerV2 = {
	matches: (step: Step) => boolean
	run: StepRunnerFn
}
const stepId = (step: Step, feature: FeatureFile) =>
	`${[feature.file.dir, path.sep, feature.file.name, feature.file.ext].join(
		'',
	)}:${step.line}`
