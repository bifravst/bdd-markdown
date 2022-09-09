import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { readLine } from './readLine'
import { tokenStream } from './tokenStream'

describe('readLine()', () => {
	it('should read one line', () =>
		assert.deepEqual(readLine(tokenStream('line 1')), 'line 1'))
	it('should read one line from a two line stream', () => {
		const multiLine = tokenStream(['line 1', 'line 2'].join(os.EOL))
		assert.deepEqual(readLine(multiLine), 'line 1')
		assert.deepEqual(readLine(multiLine), 'line 2')
	})
})
