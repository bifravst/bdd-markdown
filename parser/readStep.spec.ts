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
				keyword: 'Given',
				title: 'the Maker has started a game with the word "silky"',
			},
		)

		assert.deepEqual(
			readStep(tokenStream("When the Breaker joins the Maker's game")),
			{
				keyword: 'When',
				title: "the Breaker joins the Maker's game",
			},
		)

		assert.deepEqual(
			readStep(
				tokenStream('Then the Breaker must guess a word with 5 characters'),
			),
			{
				keyword: 'Then',
				title: 'the Breaker must guess a word with 5 characters',
			},
		)

		assert.deepEqual(
			readStep(
				tokenStream('And the Breaker must guess a word within 60 seconds'),
			),
			{
				keyword: 'And',
				title: 'the Breaker must guess a word within 60 seconds',
			},
		)
	})

	it('should parse values in step definitions', () =>
		assert.deepEqual(readStep(tokenStream('When I add `4` and `5` together')), {
			keyword: 'When',
			title: 'I add `4` and `5` together',
			values: ['4', '5'],
		}))
})
