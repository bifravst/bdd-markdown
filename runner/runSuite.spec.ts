import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import {
	loadFeatureFile,
	parseFeaturesInFolder,
} from './parseFeaturesInFolder.js'
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
})
