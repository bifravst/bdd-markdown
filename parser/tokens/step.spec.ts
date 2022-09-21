import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream.js'
import { step } from './step.js'

describe('step()', () => {
	it('should parse step definitions (Given, When, Then, Soon)', () => {
		assert.deepEqual(
			step(
				tokenStream('Given the Maker has started a game with the word "silky"'),
			),
			{
				keyword: 'Given',
				title: 'the Maker has started a game with the word "silky"',
				line: 1,
			},
		)

		assert.deepEqual(
			step(tokenStream("When the Breaker joins the Maker's game")),
			{
				keyword: 'When',
				title: "the Breaker joins the Maker's game",
				line: 1,
			},
		)

		assert.deepEqual(
			step(tokenStream('Then the Breaker must guess a word with 5 characters')),
			{
				keyword: 'Then',
				title: 'the Breaker must guess a word with 5 characters',
				line: 1,
			},
		)

		assert.deepEqual(
			step(tokenStream('Soon the Breaker must guess a word with 5 characters')),
			{
				keyword: 'Soon',
				title: 'the Breaker must guess a word with 5 characters',
				line: 1,
			},
		)

		assert.deepEqual(
			step(tokenStream('And the Breaker must guess a word within 60 seconds')),
			{
				keyword: 'And',
				title: 'the Breaker must guess a word within 60 seconds',
				line: 1,
			},
		)
	})

	it('should parse wrapped step definitions', () =>
		assert.deepEqual(
			step(
				tokenStream(
					[
						'And I enqueue this mock HTTP API response with status code `202` for a `POST`',
						'request to `chunks.memfault.com/api/v0/chunks/${deviceId}`',
						'',
						'And this is the next step',
					].join(os.EOL),
				),
			),
			{
				keyword: 'And',
				title:
					'I enqueue this mock HTTP API response with status code `202` for a `POST` request to `chunks.memfault.com/api/v0/chunks/${deviceId}`',
				line: 1,
			},
		))
})
