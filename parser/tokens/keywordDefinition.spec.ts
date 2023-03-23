import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { Keyword, type Feature, type Scenario } from '../grammar.js'
import { testData } from '../test-data/testData.js'
import { keywordDefinition } from './keywordDefinition.js'

const l = testData(import.meta.url)
const feature = l('feature')
const featureWithScenario = l('featureWithScenario')

const parsedFeature: Omit<Feature, 'scenarios' | 'rules'> = {
	keyword: Keyword.Feature,
	title: 'Example feature',
	line: 1,
	description: [
		'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
		'And line-breaks should be allowed in the description.',
	],
}

const parsedScenario: Partial<Scenario> = {
	keyword: Keyword.Scenario,
	title: 'The first scenario',
	line: 9,
	description: [
		'This is a description for the scenario, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
		'And line-breaks should be allowed in the description.',
	],
}

describe('keywordDefinition()', () => {
	it('should parse a definition', () =>
		assert.deepEqual(
			keywordDefinition(feature, [Keyword.Feature], 1),
			parsedFeature,
		))

	it('should not read the next keyword', () => {
		assert.deepEqual(
			keywordDefinition(featureWithScenario, [Keyword.Feature], 1),
			parsedFeature,
		)
		assert.deepEqual(
			keywordDefinition(featureWithScenario, [Keyword.Scenario], 2),
			parsedScenario,
		)
	})
})
