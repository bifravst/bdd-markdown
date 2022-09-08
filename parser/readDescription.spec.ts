import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData'
import { readDescription } from './readDescription'

const l = testData(import.meta.url)

describe('readDescription()', () => {
	it('should parse a description', () =>
		assert.deepEqual(readDescription(l('short')), [
			'This is a short description.',
		]))
	it('should parse multi-line descriptions', () =>
		assert.deepEqual(readDescription(l('multiline')), [
			'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
			'And line-breaks should be allowed in the description.',
		]))

	describe('should not parse other instructions', () => {
		it('should not parse the next headline', () =>
			assert.deepEqual(readDescription(l('withOther')), ['Some description']))
	})
})
