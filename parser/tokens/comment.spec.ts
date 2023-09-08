import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream.js'
import { comment } from './comment.js'

describe('comment()', () => {
	it('should read a sentence', () =>
		assert.deepEqual(comment(tokenStream('<!-- This is a comment. -->')), {
			text: 'This is a comment.',
		}))

	it('should stop at EOL', () =>
		assert.deepEqual(
			comment(
				tokenStream(
					['<!-- This is a comment. -->', 'Second line'].join(os.EOL),
				),
			),
			{ text: 'This is a comment.' },
		))

	it('should parse multi-line comments', () =>
		assert.deepEqual(
			comment(
				tokenStream(
					[
						'<!--',
						'Comment line 1.',
						'Comment line 2.',
						'Comment line 3.',
						'-->',
						'',
						'Second line',
					].join(os.EOL),
				),
			),
			{
				text: ['Comment line 1.', 'Comment line 2.', 'Comment line 3.'].join(
					os.EOL,
				),
			},
		))
})
