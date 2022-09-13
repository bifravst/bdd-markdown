import assert from 'assert/strict'
import { describe, it as test } from 'node:test'
import os from 'os'
import { EndOfStreamError } from './errors/EndOfStreamError.js'
import { tokenStream } from './tokenStream.js'

describe('tokenStream()', () => {
	test('defaults with non-empty string', () => {
		const stream = tokenStream('some data')
		assert.equal(stream.isEoF(), false)
		assert.equal(stream.isEoL(), false)
		assert.equal(stream.index(), 0)
		assert.equal(stream.char(), 's')
		assert.equal(stream.peekNext(), 'o')
		assert.equal(stream.next(), 'o')
		assert.equal(stream.source(), 'some data')
	})
	test('defaults with empty string', () => {
		const emptyStream = tokenStream('')
		assert.equal(emptyStream.isEoF(), true)
		assert.equal(emptyStream.isEoL(), true)
		assert.equal(emptyStream.index(), 0)
		assert.equal(emptyStream.char(), os.EOL)
		assert.equal(emptyStream.peekNext(), os.EOL)
		assert.equal(emptyStream.source(), '')
		assert.throws(() => emptyStream.next(), EndOfStreamError)
	})

	test('multi-line', () => {
		const multiLineStream = tokenStream(['a', 'b'].join(os.EOL))
		assert.equal(multiLineStream.next(), os.EOL)
		assert.equal(multiLineStream.isEoL(), true)
		assert.equal(multiLineStream.isEoF(), false)
		assert.equal(multiLineStream.next(), 'b')
		assert.equal(multiLineStream.next(), os.EOL)
		assert.equal(multiLineStream.isEoL(), true)
		assert.equal(multiLineStream.isEoF(), true)
	})

	test('isEoF()', () => {
		const s = tokenStream('ab')
		s.next() // b
		assert.equal(s.isEoF(), false)
		assert.equal(s.isEoL(), false)
		s.next() // EOL
		assert.equal(s.isEoF(), true)
		assert.equal(s.isEoL(), true)
		assert.throws(() => s.next(), EndOfStreamError)
	})
})
