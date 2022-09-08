import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { tokenStream } from '../tokenStream'
import { readStep } from './readStep'

describe('readStep()', () => {
	it('should parse step definitions', () => {
		assert.deepEqual(
			readStep(
				tokenStream('Given the Maker has started a game with the word "silky"'),
			),
			{
				step: 'Given',
				title: 'the Maker has started a game with the word "silky"',
			},
		)

		assert.deepEqual(
			readStep(tokenStream("When the Breaker joins the Maker's game")),
			{
				step: 'When',
				title: "the Breaker joins the Maker's game",
			},
		)

		assert.deepEqual(
			readStep(
				tokenStream('Then the Breaker must guess a word with 5 characters'),
			),
			{
				step: 'Then',
				title: 'the Breaker must guess a word with 5 characters',
			},
		)
	})
})
