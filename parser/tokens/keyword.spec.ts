import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { Keyword } from '../grammar'
import { testData } from '../test-data/testData'
import { keyword } from './keyword'
import { whiteSpace } from './whiteSpace'

const l = testData(import.meta.url)

describe('keyword()', () => {
	it('should parse a feature heading without the keyword', () =>
		assert.deepEqual(
			keyword(l('feature-without-keyword'), [Keyword.Feature], 1),
			{
				keyword: 'Feature',
				description: 'User registration',
				lineNumber: 1,
			},
		))
	it('should parse a feature heading with the keyword', () =>
		assert.deepEqual(keyword(l('feature-with-keyword'), [Keyword.Feature], 1), {
			keyword: 'Feature',
			description: 'User registration',
			lineNumber: 1,
		}))

	it('should parse a scenario heading with the keyword', () =>
		assert.deepEqual(
			keyword(l('scenario-with-keyword'), [Keyword.Scenario], 2),
			{
				keyword: 'Scenario',
				description: 'Fill registration form',
				lineNumber: 1,
			},
		))

	it('should parse a scenario heading without the keyword', () =>
		assert.deepEqual(
			keyword(l('scenario-without-keyword'), [Keyword.Scenario], 2),
			{
				keyword: 'Scenario',
				description: 'Fill registration form',
				lineNumber: 1,
			},
		))

	it('should not find feature keyword on level 2 heading', () =>
		assert.equal(keyword(l('feature-wrong-level'), [Keyword.Feature], 1), null))

	it('should not find other keywords on level 1 heading', () =>
		assert.equal(
			keyword(l('scenario-wrong-level'), [Keyword.Scenario], 2),
			null,
		))

	it('should parse keywords without description', () =>
		assert.deepEqual(keyword(l('background'), [Keyword.Background], 2), {
			keyword: 'Background',
			lineNumber: 1,
		}))

	it('should parse other keywords with description', () =>
		assert.deepEqual(keyword(l('rule'), [Keyword.Rule], 2), {
			keyword: 'Rule',
			description: 'Email must be syntactically correct',
			lineNumber: 1,
		}))

	it('should parse features without keyword that use a keyword in the description', () =>
		assert.deepEqual(
			keyword(l('feature-without-keyword-but-keyword'), [Keyword.Feature], 1),
			{
				keyword: 'Feature',
				description: 'Example feature',
				lineNumber: 1,
			},
		))

	it('should parse a feature with scenario outline', () => {
		const f = l('scenario-outline')

		assert.deepEqual(keyword(f, [Keyword.Feature], 1), {
			keyword: 'Feature',
			lineNumber: 1,
		})

		whiteSpace(f)

		assert.deepEqual(keyword(f, [Keyword.ScenarioOutline], 2), {
			keyword: 'Scenario Outline',
			description: 'eating',
			lineNumber: 3,
		})

		whiteSpace(f)

		assert.deepEqual(keyword(f, [Keyword.Example], 3), {
			keyword: 'Example',
			lineNumber: 5,
		})

		whiteSpace(f)

		assert.deepEqual(keyword(f, [Keyword.ScenarioOutline], 2), {
			keyword: 'Scenario Outline',
			lineNumber: 7,
		})

		whiteSpace(f)

		assert.deepEqual(keyword(f, [Keyword.Example], 3), {
			keyword: 'Example',
			lineNumber: 9,
		})
	})
})
