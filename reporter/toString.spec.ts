import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toString } from './toString.js'

describe('toString()', () => {
	it('should return strings as is', () => assert.equal(toString('foo'), 'foo'))

	describe('should stringify other values', () => {
		it('like numbers', () => assert.equal(toString(1), '1'))
		it('or objects', () =>
			assert.equal(toString({ foo: 'bar' }), '{"foo":"bar"}'))
	})

	it('should return `undefined` for undefined', () =>
		assert.equal(toString(undefined), 'undefined'))

	it('should return ??? for others', () => {
		const ref: any = {}
		ref.self = ref // Circular reference
		assert.equal(toString(ref), '???')
	})
})
