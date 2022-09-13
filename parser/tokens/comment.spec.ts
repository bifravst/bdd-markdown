import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream.js'
import { comment } from './comment.js'

describe('comment()', () => {
	it('should read a sentence', () =>
		assert.equal(
			comment(tokenStream('<!-- This is a comment. -->')),
			'This is a comment.',
		))

	it('should stop at EOL', () =>
		assert.equal(
			comment(
				tokenStream(
					['<!-- This is a comment. -->', 'Second line'].join(os.EOL),
				),
			),
			'This is a comment.',
		))
})
