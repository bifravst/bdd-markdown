import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData'
import { readFeatureKeyword, readSecondLevelKeyword } from './readKeyword'

const l = testData(import.meta.url)

describe('readKeyword()', () => {
	it('should parse a feature heading without the keyword', () =>
		assert.deepEqual(readFeatureKeyword(l('feature-without-keyword')), {
			keyword: 'Feature',
			description: 'User registration',
		}))

	it('should parse a feature heading with the keyword', () =>
		assert.deepEqual(readFeatureKeyword(l('feature-with-keyword')), {
			keyword: 'Feature',
			description: 'User registration',
		}))

	it('should parse a scenario heading with the keyword', () =>
		assert.deepEqual(readSecondLevelKeyword(l('scenario-with-keyword')), {
			keyword: 'Scenario',
			description: 'Fill registration form',
		}))

	it('should parse a scenario heading without the keyword', () =>
		assert.deepEqual(readSecondLevelKeyword(l('scenario-without-keyword')), {
			keyword: 'Scenario',
			description: 'Fill registration form',
		}))

	it('should not allow feature keyword on level 2 heading', () =>
		assert.throws(
			() => readFeatureKeyword(l('feature-wrong-level')),
			/The Feature keyword must be a level 1 heading./,
		))

	it('should not allow other keywords on level 1 heading', () =>
		assert.throws(
			() => readSecondLevelKeyword(l('scenario-wrong-level')),
			/The Scenario keyword must be a level 2 heading./,
		))

	it('should parse keywords without description', () =>
		assert.deepEqual(readSecondLevelKeyword(l('background')), {
			keyword: 'Background',
		}))

	it('should parse other keywords with description', () =>
		assert.deepEqual(readSecondLevelKeyword(l('rule')), {
			keyword: 'Rule',
			description: 'Email must be syntactically correct',
		}))

	it('should parse features without keyword that use a keyword in the description', () =>
		assert.deepEqual(
			readFeatureKeyword(l('feature-without-keyword-but-keyword')),
			{
				keyword: 'Feature',
				description: 'Example feature',
			},
		))
})
