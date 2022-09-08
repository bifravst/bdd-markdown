import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream'
import { Feature, Keyword, Scenario } from './grammar'
import { readKeywordDefinition } from './readKeywordDefinition'

const feature = [
	`# Example feature`,
	``,
	`This is a description for the feature, which can span multiple lines. This`,
	`paragraph is intentionally very long so we hit the prettier auto-format wrapping`,
	`the long line.`,
	``,
	`And single line-breaks should be allowed in the description.`,
]

const parsedFeature: Omit<Feature, 'scenarios'> = {
	keyword: Keyword.Feature,
	shortDescription: 'Example feature',
	description: [
		'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
		'And single line-breaks should be allowed in the description.',
	],
}

const scenario = [
	`## The first scenario`,
	``,
	`This is a description for the scenario, which can span multiple lines. This`,
	`paragraph is intentionally very long so we hit the prettier auto-format wrapping`,
	`the long line.`,
	``,
	`And single line-breaks should be allowed in the description.`,
]

const parsedScenario: Scenario = {
	keyword: Keyword.Scenario,
	shortDescription: 'The first scenario',
	description: [
		'This is a description for the scenario, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
		'And single line-breaks should be allowed in the description.',
	],
}

describe('readKeywordDefinition()', () => {
	it('should parse a definition', () =>
		assert.deepEqual(
			readKeywordDefinition(tokenStream([...feature].join(os.EOL))),
			parsedFeature,
		))

	it('should not read the next keyword', () => {
		const s = tokenStream([...feature, ...scenario].join(os.EOL))
		assert.deepEqual(readKeywordDefinition(s), parsedFeature)
		assert.deepEqual(readKeywordDefinition(s), parsedScenario)
	})
})
