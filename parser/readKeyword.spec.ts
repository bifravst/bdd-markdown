import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData'
import { Keyword } from './grammar'
import { readKeyword } from './readKeyword'
import { skipWhiteSpace } from './skipWhiteSpace'

const l = testData(import.meta.url)

describe('readKeyword()', () => {
	it('should parse a feature heading without the keyword', () =>
		assert.deepEqual(
			readKeyword(l('feature-without-keyword'), [Keyword.Feature], 1),
			{
				keyword: 'Feature',
				description: 'User registration',
			},
		))
	it('should parse a feature heading with the keyword', () =>
		assert.deepEqual(
			readKeyword(l('feature-with-keyword'), [Keyword.Feature], 1),
			{
				keyword: 'Feature',
				description: 'User registration',
			},
		))

	it('should parse a scenario heading with the keyword', () =>
		assert.deepEqual(
			readKeyword(l('scenario-with-keyword'), [Keyword.Scenario], 2),
			{
				keyword: 'Scenario',
				description: 'Fill registration form',
			},
		))

	it('should parse a scenario heading without the keyword', () =>
		assert.deepEqual(
			readKeyword(l('scenario-without-keyword'), [Keyword.Scenario], 2),
			{
				keyword: 'Scenario',
				description: 'Fill registration form',
			},
		))

	it('should not allow feature keyword on level 2 heading', () =>
		assert.throws(
			() => readKeyword(l('feature-wrong-level'), [Keyword.Feature], 1),
			/The Feature keyword must be a level 1 heading./,
		))

	it('should not allow other keywords on level 1 heading', () =>
		assert.throws(
			() => readKeyword(l('scenario-wrong-level'), [Keyword.Scenario], 2),
			/The Scenario keyword must be a level 2 heading./,
		))

	it('should parse keywords without description', () =>
		assert.deepEqual(readKeyword(l('background'), [Keyword.Background], 2), {
			keyword: 'Background',
		}))

	it('should parse other keywords with description', () =>
		assert.deepEqual(readKeyword(l('rule'), [Keyword.Rule], 2), {
			keyword: 'Rule',
			description: 'Email must be syntactically correct',
		}))

	it('should parse features without keyword that use a keyword in the description', () =>
		assert.deepEqual(
			readKeyword(
				l('feature-without-keyword-but-keyword'),
				[Keyword.Feature],
				1,
			),
			{
				keyword: 'Feature',
				description: 'Example feature',
			},
		))

	it('should parse a feature with scenario outline', () => {
		const f = l('scenario-outline')

		assert.deepEqual(readKeyword(f, [Keyword.Feature], 1), {
			keyword: 'Feature',
		})

		skipWhiteSpace(f)

		assert.deepEqual(readKeyword(f, [Keyword.ScenarioOutline], 2), {
			keyword: 'Scenario Outline',
			description: 'eating',
		})

		skipWhiteSpace(f)

		assert.deepEqual(readKeyword(f, [Keyword.Example], 3), {
			keyword: 'Example',
		})

		skipWhiteSpace(f)

		assert.deepEqual(readKeyword(f, [Keyword.ScenarioOutline], 2), {
			keyword: 'Scenario Outline',
		})

		skipWhiteSpace(f)

		assert.deepEqual(readKeyword(f, [Keyword.Example], 3), {
			keyword: 'Example',
		})
	})
})
