import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { readComments } from './readComments'
import { tokenStream } from './tokenStream'

describe('readComments()', () => {
	it('should read a sentence', () =>
		assert.equal(
			readComments(tokenStream('<!-- This is a comment. -->')),
			'This is a comment.',
		))

	it('should stop at EOL', () =>
		assert.equal(
			readComments(
				tokenStream(
					['<!-- This is a comment. -->', 'Second line'].join(os.EOL),
				),
			),
			'This is a comment.',
		))
})
