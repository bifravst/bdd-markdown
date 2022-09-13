import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData.js'
import { table } from './table.js'

const l = testData(import.meta.url)

describe('table()', () => {
	it('should parse a table', () =>
		assert.deepEqual(table(l('simple')), [
			{
				start: '12',
				eat: '5',
				left: '7',
			},
			{
				start: '20',
				eat: '5',
				left: '15',
			},
		]))
})
