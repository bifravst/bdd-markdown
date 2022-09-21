import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream.js'
import { sentence } from './sentence.js'
import { space } from './whiteSpace.js'

describe('sentence()', () => {
	it('should read a sentence', () =>
		assert.equal(
			sentence(tokenStream('This is a short description.')),
			'This is a short description.',
		))

	it('should stop at EOL', () =>
		assert.equal(
			sentence(
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
		space(s)
		assert.equal(sentence(s), 'This is a short description.')
	})
})
