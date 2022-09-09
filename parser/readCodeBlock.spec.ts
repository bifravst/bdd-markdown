import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData'
import { readCodeBlock } from './readCodeBlock'

const l = testData(import.meta.url)

describe('readCodeBlock()', () => {
	it('should parse a one-line code block', () =>
		assert.deepEqual(readCodeBlock(l('generic')), {
			code: '{ "foo": "bar" }',
		}))
	it('should parse a one-line code block with language specifier', () =>
		assert.deepEqual(readCodeBlock(l('json')), {
			language: 'json',
			code: '{ "foo": "bar" }',
		}))
	it('should parse multi-line code blocks', () =>
		assert.deepEqual(readCodeBlock(l('json-multiline')), {
			language: 'json',
			code: JSON.stringify(
				{
					dev: {
						v: {
							modV: 'mfw_nrf9160_1.3.1',
							brdV: 'nrf9160dk_nrf9160',
							appV: '${appVersion}-upgraded',
						},
					},
				},
				null,
				2,
			),
		}))
})
