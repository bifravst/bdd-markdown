import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream.js'
import { line } from './line.js'

describe('line()', () => {
	it('should read one line', () =>
		assert.deepEqual(line(tokenStream('line 1')), 'line 1'))
	it('should read one line from a two line stream', () => {
		const multiLine = tokenStream(['line 1', 'line 2'].join(os.EOL))
		assert.deepEqual(line(multiLine), 'line 1')
		assert.deepEqual(line(multiLine), 'line 2')
	})
	it('should read blank lines', () => {
		const s = tokenStream(`${os.EOL}Hello${os.EOL}${os.EOL}You${os.EOL}`)
		assert.deepEqual(line(s), null)
		assert.deepEqual(line(s), 'Hello')
		assert.deepEqual(line(s), null)
		assert.deepEqual(line(s), 'You')
		assert.equal(s.isEoF(), true)
	})
})
