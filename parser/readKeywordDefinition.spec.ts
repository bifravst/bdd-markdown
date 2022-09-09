import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { testData } from '../test-data/testData'
import { Feature, Keyword, Scenario } from './grammar'
import {
	readFeatureKeywordDefinition,
	readSecondLevelKeywordDefinition,
} from './readKeywordDefinition'
import { tokenStream } from './tokenStream'

const l = testData(import.meta.url)
const feature = l('feature')
const scenario = l('scenario')

const parsedFeature: Omit<Feature, 'scenarios'> = {
	keyword: Keyword.Feature,
	shortDescription: 'Example feature',
	description: [
		'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
		'And line-breaks should be allowed in the description.',
	],
}

const parsedScenario: Partial<Scenario> = {
	keyword: Keyword.Scenario,
	shortDescription: 'The first scenario',
	description: [
		'This is a description for the scenario, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
		'And line-breaks should be allowed in the description.',
	],
}

describe('readKeywordDefinition()', () => {
	it('should parse a definition', () =>
		assert.deepEqual(readFeatureKeywordDefinition(feature), parsedFeature))

	it('should not read the next keyword', () => {
		const s = tokenStream([feature.source(), scenario.source()].join(os.EOL))
		assert.deepEqual(readFeatureKeywordDefinition(s), parsedFeature)
		assert.deepEqual(readSecondLevelKeywordDefinition(s), parsedScenario)
	})
})
