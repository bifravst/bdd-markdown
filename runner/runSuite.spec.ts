import assert from 'assert/strict'
import { randomUUID } from 'node:crypto'
import { describe, it } from 'node:test'
import path from 'path'
import { codeBlockOrThrow } from './codeBlockOrThrow.js'
import {
	loadFeatureFile,
	parseFeaturesInFolder,
} from './parseFeaturesInFolder.js'
import { runSuite, type StepRunner } from './runSuite.js'
import { regExpMatchedStep } from './regExpMatchedStep.js'
import { Type } from '@sinclair/typebox'

describe('runSuite()', () => {
	it('should run a simple test suite', async () => {
		const simpleFeature = await loadFeatureFile(
			path.join(
				process.cwd(),
				'runner',
				'test-data',
				'runSuite',
				'Example.feature.md',
			),
		)
		const runner = runSuite([simpleFeature], 'Example')

		runner.addStepRunners({
			match: () => true,
			run: async () => undefined,
		})

		const result = await runner.run()

		assert.equal(result.ok, true)
		assert.equal(result.name, 'Example')
		assert.deepEqual(result.summary.failed, 0)
		assert.deepEqual(result.summary.passed, 1)
		assert.deepEqual(result.summary.total, 1)
		assert.equal('duration' in result.summary, true)
	})

	it('should mark features as skipped, if they depend on a feature that failed', async () => {
		const runner = runSuite(
			await parseFeaturesInFolder(
				path.join(
					process.cwd(),
					'runner',
					'test-data',
					'runSuite',
					'skip-if-dependency-failed',
				),
			),
			'Example',
		)
		runner.addStepRunners({
			match: () => true,
			run: async () => {
				throw new Error(`Fail!`)
			},
		})

		const result = await runner.run()
		assert.equal(result.ok, false)
		assert.equal(result.name, 'Example')
		assert.deepEqual(result.summary.failed, 1)
		assert.deepEqual(result.summary.passed, 0)
		assert.deepEqual(result.summary.skipped, 1)
		assert.deepEqual(result.summary.total, 2)
	})

	it('should fail if the suite has no features', async () => {
		const runner = runSuite(
			await parseFeaturesInFolder(
				path.join(
					process.cwd(),
					'runner',
					'test-data',
					'runSuite',
					'no-features',
				),
			),
			'Example',
		)

		const result = await runner.run()
		assert.equal(result.ok, false)
	})

	describe('run: only', () => {
		it('if a feature is marked with `run: only` all other features should not be run', async () => {
			const runner = runSuite(
				await parseFeaturesInFolder(
					path.join(process.cwd(), 'runner', 'test-data', 'runSuite', 'only'),
				),
				'Example',
			)

			runner.addStepRunners({
				match: () => true,
				run: async () => undefined,
			})

			const result = await runner.run()
			assert.equal(result.ok, true)
			assert.deepEqual(result.summary.failed, 0)
			assert.deepEqual(result.summary.passed, 1)
			assert.deepEqual(result.summary.skipped, 1)
			assert.deepEqual(result.summary.total, 2)
		})

		it('dependencies should be run', async () => {
			const runner = runSuite(
				await parseFeaturesInFolder(
					path.join(
						process.cwd(),
						'runner',
						'test-data',
						'runSuite',
						'only-with-dependencies',
					),
				),
				'Example',
			)

			runner.addStepRunners({
				match: () => true,
				run: async () => undefined,
			})

			const result = await runner.run()

			assert.equal(result.ok, true)
			assert.deepEqual(result.summary.failed, 0)
			assert.deepEqual(result.summary.passed, 2)
			assert.deepEqual(result.summary.skipped, 1)
			assert.deepEqual(result.summary.total, 3)
		})
	})

	it('should share context', async () => {
		const runner = runSuite(
			await parseFeaturesInFolder(
				path.join(
					process.cwd(),
					'runner',
					'test-data',
					'runSuite',
					'shareContextBetweenFeatures',
				),
			),
			'Example',
		)

		runner.addStepRunners(
			...(<StepRunner[]>[
				regExpMatchedStep(
					{
						regExp: /^I store a random string in `(?<storageName>[^`]+)`$/,
						schema: Type.Object({
							storageName: Type.String(),
						}),
					},
					async ({ match: { storageName }, context }) => {
						context[storageName ?? ''] = randomUUID()
					},
				),
				regExpMatchedStep(
					{
						regExp: /^`(?<value>[^`]+)` should not be empty$/,
						schema: Type.Object({
							value: Type.String(),
						}),
					},
					async ({ match: { value } }) => {
						assert.equal(value.length, 36)
					},
				),
				{
					match: (title) => /^it should be replaced in this JSON$/.test(title),
					run: async ({ step }) => {
						assert.equal(
							JSON.parse(codeBlockOrThrow(step).code).aStringParameter.length,
							36,
						)
					},
				},
			]),
		)

		const result = await runner.run()

		assert.equal(result.ok, true)
		assert.deepEqual(result.summary.failed, 0)
		assert.deepEqual(result.summary.passed, 2)
		assert.deepEqual(result.summary.skipped, 0)
		assert.deepEqual(result.summary.total, 2)
	})

	describe('variants', () => {
		it('should run features for every variant', async () => {
			const runner = runSuite(
				await parseFeaturesInFolder(
					path.join(
						process.cwd(),
						'runner',
						'test-data',
						'runSuite',
						'variants',
					),
				),
				'Variants example',
			)

			const titles: string[] = []
			const variants: Record<string, string>[] = []

			runner.addStepRunners(
				...(<StepRunner[]>[
					{
						match: () => true,
						run: async ({ step: { title }, feature: { variant } }) => {
							titles.push(title)
							variants.push(variant)
							return
						},
					},
				]),
			)

			const result = await runner.run()

			assert.equal(result.ok, true)
			assert.deepEqual(result.summary.failed, 0)
			assert.deepEqual(result.summary.passed, 2)
			assert.deepEqual(result.summary.skipped, 0)
			assert.deepEqual(result.summary.total, 2)

			// ${variant.nw}
			assert.equal(titles[0], 'network is `ltem` and modem is `LTE-M`')
			assert.deepEqual(variants[0], {
				nw: 'ltem',
				modem: 'LTE-M',
			})
			assert.equal(titles[3], 'network is `nbiot` and modem is `NB-IoT`')
			assert.deepEqual(variants[3], {
				nw: 'nbiot',
				modem: 'NB-IoT',
			})
			// <variant.nw>
			assert.equal(titles[1], 'network is `ltem` and modem is `LTE-M`')
			assert.deepEqual(variants[1], {
				nw: 'ltem',
				modem: 'LTE-M',
			})
			assert.equal(titles[3], 'network is `nbiot` and modem is `NB-IoT`')
			assert.deepEqual(variants[3], {
				nw: 'nbiot',
				modem: 'NB-IoT',
			})
			// Embedded placeholders
			assert.equal(
				titles[2],
				'the placeholder `ltem` is embedded in another placeholder: `some-device/pgps/get`',
			)
			assert.deepEqual(variants[2], {
				nw: 'ltem',
				modem: 'LTE-M',
			})
		})
	})
})
