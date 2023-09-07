import { describe, it } from 'node:test'
import { feature } from '../parser/feature.js'
import { testFile } from '../parser/test-data/testData.js'
import type { FeatureFile } from './parseFeaturesInFolder.js'
import assert from 'node:assert'
import { type StepRunnerFn, collectSteps } from './collectSteps.js'

const l = testFile(import.meta.url, 'runner')

describe('collectSteps()', () => {
	const { stream, file } = l('Example')
	const f: FeatureFile = {
		file,
		feature: feature(stream),
	}

	it('should collect all the steps for a feature file', () => {
		const runFn1: StepRunnerFn = async () => Promise.resolve()
		const runFn2: StepRunnerFn = async () => Promise.resolve()
		const steps = collectSteps(
			[f],
			[
				{
					matches: (step) => /^I add 1 and 1$/.test(step.title),
					run: runFn1,
				},
				{
					matches: (step) => /^I subtract 2 from 3$/.test(step.title),
					run: runFn2,
				},
			],
		)

		assert.equal(Object.values(steps)[0], runFn1)
		assert.equal(Object.values(steps)[1], runFn2)
	})

	it('should throw an error if multiple runners matched', () => {
		assert.throws(
			() =>
				collectSteps(
					[f],
					[
						{
							matches: () => true,
							run: async () => Promise.resolve(),
						},
						{
							matches: () => true,
							run: async () => Promise.resolve(),
						},
					],
				),
			/More than one runner matched the step!/,
		)
	})

	it('should throw an error if not all steps matched with a runner', () => {
		assert.throws(
			() =>
				collectSteps(
					[f],
					[
						{
							matches: () => false,
							run: async () => Promise.resolve(),
						},
					],
				),
			/No runner matched the step!/,
		)
	})
})
