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

	it('should parse a table with blank values', () =>
		assert.deepEqual(table(l('with-blanks')), [
			{
				start: '20',
				eat: '5',
				left: null,
			},
			{
				start: '20',
				eat: null,
				left: '15',
			},
			{
				start: null,
				eat: '5',
				left: '15',
			},
			{
				start: null,
				eat: null,
				left: null,
			},
		]))

	it('should not allow blank table headers', () =>
		assert.throws(
			() => table(l('error-blank-header')),
			/Table header must be all strings./,
		))
})
