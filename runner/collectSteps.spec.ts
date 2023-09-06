import { describe, it } from 'node:test'
import { feature } from '../parser/feature.js'
import { testFile } from '../parser/test-data/testData.js'
import type { Step } from '../parser/grammar.js'
import type { FeatureFile } from './parseFeaturesInFolder.js'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert'

const l = testFile(import.meta.url, 'runner')

describe('collectSteps()', () => {
	it('should collect all the steps for a feature file', () => {
		const { stream, file } = l('Example')
		const f: FeatureFile = {
			file,
			feature: feature(stream),
		}
		const runFn: RunnerV2 = () => undefined
		const steps = collectSteps(
			[f],
			[
				{
					matches: () => true,
					run: runFn,
				},
			],
		)

		assert.equal(Object.values(steps)[0], runFn)
	})
})

const collectSteps = (suite: FeatureFile[], stepRunners: StepRunnerV2[]) => {
	const stepRunnerMatches: Record<string, RunnerV2> = {}
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
						`No runner matched step!`,
						`${step.keyword} ${step.title}`,
						`in ${file.name}:${step.line}`,
					].join(os.EOL),
				)
			}

			if (runners.length > 1) {
				throw new Error(
					[
						`More than one runner matched step!`,
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

type RunnerV2 = () => void

type StepRunnerV2 = {
	matches: (step: Step) => boolean
	run: RunnerV2
}

const stepId = (step: Step, feature: FeatureFile) =>
	`${[feature.file.dir, path.sep, feature.file.name, feature.file.ext].join(
		'',
	)}:${step.line}`
