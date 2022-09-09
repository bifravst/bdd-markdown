import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData'
import { Feature } from './grammar'
import { parseFeature } from './parseFeature'

describe('parseFeature()', () => {
	it('should parse a sample feature file', () => {
		const tree = parseFeature(testData(import.meta.url)('Example'))

		assert.deepEqual(tree, {
			keyword: 'Feature',
			shortDescription: 'Example feature',
			description: [
				'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
				'And line-breaks should be allowed in the description.',
			],
			scenarios: [
				{
					keyword: 'Scenario',
					shortDescription: 'The first scenario',
					description: [
						'This is a description for the scenario, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
						'And line-breaks should be allowed in the description.',
					],
					comment:
						'Comments on separate lines are supported. They will be associated with the following keyword.',
					steps: [
						{
							keyword: 'Given',
							title: 'a calculator',
							comment:
								'Comments can also precede steps and they will be associated with them.',
						},
						{
							keyword: 'When',
							title: 'I add `4`',
							values: ['4'],
							comment:
								'The parser will extract all values in backticks and provide them in a list.',
						},
						{
							keyword: 'And',
							title: 'I add `5`',
							values: ['5'],
						},
						{
							keyword: 'Then',
							title: 'the result is `9`',
							values: ['9'],
						},
					],
				},
			],
		} as Feature)
	})
})
