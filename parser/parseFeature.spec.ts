import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../test-data/testData'
import { Feature } from './grammar'
import { parseFeature } from './parseFeature'

const l = testData(import.meta.url)

describe('parseFeature()', () => {
	it('should parse a sample feature file', () => {
		const tree = parseFeature(l('Example'))

		assert.deepEqual(tree, {
			keyword: 'Feature',
			title: 'Example feature',
			description: [
				'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
				'And line-breaks should be allowed in the description.',
			],
			scenarios: [
				{
					keyword: 'Scenario',
					title: 'The first scenario',
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
				{
					keyword: 'Scenario',
					title: 'Verify that a webhook request was sent using the REST client',
					steps: [
						{
							keyword: 'When',
							title: 'I POST to `${webhookReceiver}/hook` with this JSON',
							codeBlock: {
								language: 'json',
								code: '{ "foo": "bar" }',
							},
							values: ['${webhookReceiver}/hook'],
						},
						{
							keyword: 'Then',
							title: 'the response status code should be `202`',
							values: ['202'],
							comment: 'This is the response from API Gateway',
						},
					],
				},
				{
					keyword: 'Scenario Outline',
					title: 'eating',
					steps: [
						{
							keyword: 'Given',
							title: 'there are `${start}` cucumbers',
							values: ['${start}'],
						},
						{
							keyword: 'When',
							title: 'I eat `${eat}` cucumbers',
							values: ['${eat}'],
						},
						{
							keyword: 'Then',
							title: 'I should have `${left}` cucumbers',
							values: ['${left}'],
						},
					],
					examples: [
						{
							start: '12',
							eat: '5',
							left: '7',
						},
						{
							start: '20',
							eat: '5',
							left: '15',
						},
					],
				},
			],
		} as Feature)
	})

	/*
	it('should parse a file with rules', () => {
		const tree = parseFeature(l('Highlander'))
	})
	*/
})
