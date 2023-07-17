import assert from 'assert/strict'
import { randomUUID } from 'node:crypto'
import { describe, it } from 'node:test'
import path from 'path'
import { codeBlockOrThrow } from './codeBlockOrThrow.js'
import {
	loadFeatureFile,
	parseFeaturesInFolder,
} from './parseFeaturesInFolder.js'
import { noMatch, type StepRunner } from './runStep.js'
import { runSuite } from './runSuite.js'

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

		runner.addStepRunners(async () => undefined)

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
		runner.addStepRunners(async () => {
			throw new Error(`Fail!`)
		})

		const result = await runner.run()
		assert.equal(result.ok, false)
		assert.equal(result.name, 'Example')
		assert.deepEqual(result.summary.failed, 1)
		assert.deepEqual(result.summary.passed, 0)
		assert.deepEqual(result.summary.skipped, 1)
		assert.deepEqual(result.summary.total, 2)
	})

	it('should fail if the suite has not features', async () => {
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

			runner.addStepRunners(async () => undefined)

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

			runner.addStepRunners(async () => undefined)

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
			...(<StepRunner<Record<string, any>>[]>[
				async ({ step: { title }, context }) => {
					const match =
						/^I store a random string in `(?<storageName>[^`]+)`$/.exec(title)
					if (match === null) return noMatch
					context[match.groups?.storageName ?? ''] = randomUUID()
					return
				},
				async ({ step: { title } }) => {
					const match = /^`(?<value>[^`]+)` should not be empty$/.exec(title)
					if (match === null) return noMatch
					assert.equal((match.groups?.value ?? '').length, 36)
					return
				},
				async ({ step }) => {
					const match = /^it should be replaced in this JSON$/.exec(step.title)
					if (match === null) return noMatch
					assert.equal(
						JSON.parse(codeBlockOrThrow(step).code).aStringParameter.length,
						36,
					)
					return
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
				...(<StepRunner<Record<string, any>>[]>[
					async ({ step: { title }, feature: { variant } }) => {
						titles.push(title)
						variants.push(variant)
						return
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
			assert.equal(titles[2], 'network is `nbiot` and modem is `NB-IoT`')
			assert.deepEqual(variants[2], {
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
		})
	})
})
