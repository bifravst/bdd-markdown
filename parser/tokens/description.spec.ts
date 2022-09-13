import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData.js'
import { description } from './description.js'

const l = testData(import.meta.url)

describe('description()', () => {
	it('should parse a description', () =>
		assert.deepEqual(description(l('short')), ['This is a short description.']))
	it('should parse multi-line descriptions', () =>
		assert.deepEqual(description(l('multiline')), [
			'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
			'And line-breaks should be allowed in the description.',
		]))

	describe('should not parse other instructions', () => {
		it('should not parse the next heading', () =>
			assert.deepEqual(description(l('withOther')), ['Some description']))
	})
})
