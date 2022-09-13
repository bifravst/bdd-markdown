import assert from 'assert/strict'
import { steps } from 'examples/mars-rover/steps'
import { describe, it } from 'node:test'
import path from 'path'
import { runFolder } from './runFolder'

describe('runFolder()', () => {
	it('should run the feature files in a folder', async () => {
		const runner = await runFolder(
			path.join(process.cwd(), 'examples', 'mars-rover'),
		)
		runner.addStepRunners(...steps)
		const result = await runner.run()
		assert.equal(result.ok, true)
		assert.deepEqual(result.summary.failed, 0)
		assert.deepEqual(result.summary.passed, 1)
		assert.deepEqual(result.summary.total, 1)
		assert.equal('duration' in result.summary, true)
	})
})
