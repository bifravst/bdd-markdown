import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { inputTable } from './inputTable.js'

describe('inputTable()', () => {
	it('should generate a table', async () => {
		assert.deepEqual(
			inputTable({
				direction: 'N',
				x: '0',
				y: '-1',
			}),
			[
				`| direction | x   | y   |`,
				`| --------- | --- | --- |`,
				`| N         | 0   | -1  |`,
			],
		)
	})
})
