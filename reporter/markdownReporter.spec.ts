import assert from 'assert/strict'
import { readFile } from 'fs/promises'
import { describe, it } from 'node:test'
import path from 'path'
import { markdownReporter } from './markdownReporter.js'

describe('markdownReporter()', () => {
	it('should format the Mars Rover run', async () => {
		const resultFile = path.join(
			process.cwd(),
			'reporter',
			'test-data',
			'mars-rover.json',
		)

		const reportFile = path.join(
			process.cwd(),
			'reporter',
			'test-data',
			'mars-rover.md',
		)

		assert.equal(
			markdownReporter(JSON.parse(await readFile(resultFile, 'utf-8'))).trim(),
			(await readFile(reportFile, 'utf-8')).trim(),
		)
	})

	it('should format the Firmware run', async () => {
		const resultFile = path.join(
			process.cwd(),
			'reporter',
			'test-data',
			'firmware.json',
		)

		const reportFile = path.join(
			process.cwd(),
			'reporter',
			'test-data',
			'firmware.md',
		)
		assert.equal(
			markdownReporter(JSON.parse(await readFile(resultFile, 'utf-8'))).trim(),
			(await readFile(reportFile, 'utf-8')).trim(),
		)
	})
})
