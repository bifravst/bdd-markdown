import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { tokenStream } from '../tokenStream'
import { step } from './step'

describe('step()', () => {
	it('should parse step definitions', () => {
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
			step(tokenStream('And the Breaker must guess a word within 60 seconds')),
			{
				keyword: 'And',
				title: 'the Breaker must guess a word within 60 seconds',
				line: 1,
			},
		)
	})

	it('should parse values in step definitions', () =>
		assert.deepEqual(step(tokenStream('When I add `4` and `5` together')), {
			keyword: 'When',
			title: 'I add `4` and `5` together',
			line: 1,
			values: ['4', '5'],
		}))
})
