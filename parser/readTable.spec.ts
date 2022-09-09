import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData'
import { readTable } from './readTable'

const l = testData(import.meta.url)

describe('readTable()', () => {
	it('should parse a table', () =>
		assert.deepEqual(readTable(l('simple')), [
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
