import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { testData } from '../test-data/testData'
import { tokenStream } from '../tokenStream'
import { Feature, Keyword, Scenario } from './grammar'
import { readKeywordDefinition } from './readKeywordDefinition'

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

const parsedScenario: Scenario = {
	keyword: Keyword.Scenario,
	shortDescription: 'The first scenario',
	description: [
		'This is a description for the scenario, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
		'And line-breaks should be allowed in the description.',
	],
}

describe('readKeywordDefinition()', () => {
	it('should parse a definition', () =>
		assert.deepEqual(readKeywordDefinition(feature), parsedFeature))

	it('should not read the next keyword', () => {
		const s = tokenStream([feature.source(), scenario.source()].join(os.EOL))
		assert.deepEqual(readKeywordDefinition(s), parsedFeature)
		assert.deepEqual(readKeywordDefinition(s), parsedScenario)
	})
})
