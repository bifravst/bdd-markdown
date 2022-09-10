import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream'
import { line } from './line'

describe('line()', () => {
	it('should read one line', () =>
		assert.deepEqual(line(tokenStream('line 1')), 'line 1'))
	it('should read one line from a two line stream', () => {
		const multiLine = tokenStream(['line 1', 'line 2'].join(os.EOL))
		assert.deepEqual(line(multiLine), 'line 1')
		assert.deepEqual(line(multiLine), 'line 2')
	})
})
