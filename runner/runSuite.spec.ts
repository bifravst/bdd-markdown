import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { loadFeatureFile } from './parseFeaturesInFolder'
import { runSuite } from './runSuite'

describe('runSuite()', () => {
	it('should run a simple test suite', async () => {
		const simpleFeature = await loadFeatureFile(
			path.join(
				process.cwd(),
				'runner',
				'test-data',
				'runSuite',
				'simple',
				'Example.feature.md',
			),
		)
		const runner = runSuite([simpleFeature])

		runner.addStepRunners(async () => ({ matched: true }))

		const result = await runner.run()

		assert.equal(result.ok, true)
		assert.deepEqual(result.summary.failed, 0)
		assert.deepEqual(result.summary.passed, 1)
		assert.deepEqual(result.summary.total, 1)
		assert.equal('duration' in result.summary, true)
	})
})
