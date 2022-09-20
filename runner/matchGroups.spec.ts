import { Type } from '@sinclair/typebox'
import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { MatchError, matchGroups } from './matchGroups.js'

const rx =
	/^I set the initial starting point to `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/

const schema = Type.Object(
	{
		x: Type.Number(),
		y: Type.Number(),
	},
	{ additionalProperties: false },
)

describe('regexGroupMatcher()', () => {
	it('should return null if input does not match', () =>
		assert.equal(matchGroups(schema)(rx, 'I have a Mars Rover'), null))

	it('should return the match if input does match', () =>
		assert.deepEqual(
			matchGroups(schema, {
				x: (s) => parseInt(s, 10),
				y: (s) => parseInt(s, 10),
			})(rx, 'I set the initial starting point to `-17,42`'),
			{
				x: -17,
				y: 42,
			},
		))

	it('should allow to partially define converters', () =>
		assert.deepEqual(
			matchGroups(
				Type.Object(
					{
						x: Type.Number(),
						y: Type.String(),
					},
					{ additionalProperties: false },
				),
				{
					x: (s) => parseInt(s, 10),
				},
			)(rx, 'I set the initial starting point to `-17,42`'),
			{
				x: -17,
				y: '42',
			},
		))

	it('should throw an error if the input matches, but validation fails', () =>
		assert.throws(
			() =>
				matchGroups(
					Type.Object(
						{
							// x must be positive
							x: Type.Number({ minimum: 0 }),
							y: Type.Number(),
						},
						{ additionalProperties: false },
					),
					{
						x: (s) => parseInt(s, 10),
						y: (s) => parseInt(s, 10),
					},
				)(rx, 'I set the initial starting point to `-17,42`'),
			MatchError,
		))
})
