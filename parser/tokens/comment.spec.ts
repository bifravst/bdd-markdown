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

	it('should parse tags', () =>
		assert.deepEqual(
			comment(
				tokenStream(
					'<!-- This is a comment which has some tags: @tag1, @tag2. -->',
				),
			),
			{
				text: 'This is a comment which has some tags: @tag1, @tag2.',
				tags: {
					tag1: true,
					tag2: true,
				},
			},
		))

	it('should parse tags with properties', () =>
		assert.deepEqual(
			comment(
				tokenStream(
					'<!-- This @retry:tries=3,initialDelay=100,delayFactor=1.5 applies only to the next step. -->',
				),
			),
			{
				text: 'This @retry:tries=3,initialDelay=100,delayFactor=1.5 applies only to the next step.',
				tags: {
					retry: {
						tries: '3',
						initialDelay: '100',
						delayFactor: '1.5',
					},
				},
			},
		))

	it('should parse multi-line comments', () =>
		assert.deepEqual(
			comment(
				tokenStream(
					[
						'<!--',
						'Comment line 1. @tag1',
						'Comment line 2. @tag2',
						'Comment line 3. @tag3',
						'-->',
						'',
						'Second line',
					].join(os.EOL),
				),
			),
			{
				text: [
					'Comment line 1. @tag1',
					'Comment line 2. @tag2',
					'Comment line 3. @tag3',
				].join(os.EOL),
				tags: {
					tag1: true,
					tag2: true,
					tag3: true,
				},
			},
		))
})
