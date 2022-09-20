import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { steps } from '../examples/mars-rover/steps.js'
import { runFolder } from './runFolder.js'

describe('runFolder()', () => {
	it('should run the feature files in a folder', async () => {
		const runner = await runFolder({
			folder: path.join(process.cwd(), 'examples', 'mars-rover'),
			name: 'Mars Rover',
		})
		runner.addStepRunners(...steps)
		const result = await runner.run()
		assert.equal(result.ok, true)
		assert.equal(result.name, 'Mars Rover')
		assert.deepEqual(result.summary.failed, 0)
		assert.deepEqual(result.summary.passed, 1)
		assert.deepEqual(result.summary.total, 1)
		assert.equal('duration' in result.summary, true)
	})
})
