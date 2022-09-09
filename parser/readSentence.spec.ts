import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { readSentence } from './readSentence'
import { tokenStream } from './tokenStream'

describe('readSentence()', () => {
	it('should read a sentence', () =>
		assert.equal(
			readSentence(tokenStream('This is a short description.')),
			'This is a short description.',
		))

	it('should stop at EOL', () =>
		assert.equal(
			readSentence(
				tokenStream(
					['This is a short description.', 'Second line'].join(os.EOL),
				),
			),
			'This is a short description.',
		))

	it('should read until EOL', () => {
		const s = tokenStream('Foo: This is a short description.')
		s.next() // F
		s.next() // o
		s.next() // o
		s.next() // :
		assert.equal(readSentence(s), 'This is a short description.')
	})

	it('should not read headings', () =>
		assert.equal(readSentence(tokenStream('# This is a heading')), null))
})
