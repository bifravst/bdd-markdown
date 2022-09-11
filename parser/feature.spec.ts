import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { feature } from './feature'
import { Feature } from './grammar'
import { testData } from './test-data/testData'

const l = testData(import.meta.url)

describe('feature()', () => {
	it('should parse a sample feature file', () => {
		const tree = feature(l('Example'))

		assert.deepEqual(tree, {
			keyword: 'Feature',
			title: 'Example feature',
			line: 12,
			description: [
				'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
				'And line-breaks should be allowed in the description.',
			],
			frontMatter: {
				info: 'front-matter should be supported for feature-level settings',
				tags: ['first'],
				contexts: [
					{
						nw: 'ltem',
						'nw-modem': 'LTE-M',
					},
					{
						nw: 'nbiot',
						'nw-modem': 'NB-IoT',
					},
				],
			},
			scenarios: [
				{
					keyword: 'Scenario',
					title: 'The first scenario',
					line: 22,
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
							line: 32,
							comment:
								'Comments can also precede steps and they will be associated with them.',
						},
						{
							keyword: 'When',
							title: 'I add `4`',
							values: ['4'],
							line: 36,
							comment:
								'The parser will extract all values in backticks and provide them in a list.',
						},
						{
							keyword: 'And',
							title: 'I add `5`',
							line: 38,
							values: ['5'],
						},
						{
							keyword: 'Then',
							title: 'the result is `9`',
							line: 40,
							values: ['9'],
						},
					],
				},
				{
					keyword: 'Scenario',
					title: 'Verify that a webhook request was sent using the REST client',
					line: 42,
					steps: [
						{
							keyword: 'When',
							title: 'I POST to `${webhookReceiver}/hook` with this JSON',
							line: 44,
							codeBlock: {
								language: 'json',
								code: '{ "foo": "bar" }',
							},
							values: ['${webhookReceiver}/hook'],
						},
						{
							keyword: 'Then',
							title: 'the response status code should be `202`',
							line: 52,
							values: ['202'],
							comment: 'This is the response from API Gateway',
						},
					],
				},
				{
					keyword: 'Scenario Outline',
					line: 54,
					title: 'eating',
					steps: [
						{
							keyword: 'Given',
							title: 'there are `${start}` cucumbers',
							line: 56,
							values: ['${start}'],
						},
						{
							keyword: 'When',
							title: 'I eat `${eat}` cucumbers',
							line: 58,
							values: ['${eat}'],
						},
						{
							keyword: 'Then',
							title: 'I should have `${left}` cucumbers',
							line: 60,
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

	it('should parse a file with rules', () => {
		const tree = feature(l('Highlander'))
		assert.deepEqual(tree, {
			keyword: 'Feature',
			title: 'Highlander',
			line: 3,
			comment: 'see https://cucumber.io/docs/gherkin/reference/#rule',
			rules: [
				{
					keyword: 'Rule',
					title: 'There can be only One',
					line: 5,
					scenarios: [
						{
							keyword: 'Example',
							title: 'Only One -- More than one alive',
							line: 7,
							steps: [
								{ keyword: 'Given', title: 'there are 3 ninjas', line: 9 },
								{
									keyword: 'And',
									title: 'there are more than one ninja alive',
									line: 11,
								},
								{
									keyword: 'When',
									title: '2 ninjas meet, they will fight',
									line: 13,
								},
								{
									keyword: 'Then',
									title: 'one ninja dies (but not me)',
									line: 15,
								},
								{
									keyword: 'And',
									title: 'there is one ninja less alive',
									line: 17,
								},
							],
						},
						{
							keyword: 'Example',
							title: 'Only One -- One alive',
							line: 19,
							steps: [
								{
									keyword: 'Given',
									title: 'there is only 1 ninja alive',
									line: 21,
								},
								{
									keyword: 'Then',
									title: 'he (or she) will live forever ;-)',
									line: 23,
								},
							],
						},
					],
				},
				{
					keyword: 'Rule',
					title: 'There can be Two (in some cases)',
					line: 25,
					scenarios: [
						{
							keyword: 'Example',
							title: 'Two -- Dead and Reborn as Phoenix',
							line: 27,
							steps: [
								{
									keyword: 'Then',
									title: 'the story continues',
									line: 29,
								},
							],
						},
					],
				},
			],
		})
	})

	it('should complain about a feature with no scenarios', () =>
		assert.throws(
			() => feature(l('NoScenario')),
			/Features must define at least one scenario./,
		))
})
