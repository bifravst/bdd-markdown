import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { feature } from './feature.js'
import type { CodeBlock, Comment, Feature } from './grammar.js'
import { testData } from './test-data/testData.js'

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
				variants: [
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
					comment: {
						text: 'Comments on separate lines are supported. They will be associated with the following keyword.',
					},
					steps: [
						{
							keyword: 'Given',
							title: 'a calculator',
							line: 32,
							comment: {
								text: 'Comments can also precede steps and they will be associated with them.',
							},
						},
						{
							keyword: 'When',
							title: 'I add `4`',
							line: 34,
						},
						{
							keyword: 'When',
							title: 'I add `5`',
							line: 36,
						},
						{
							keyword: 'Then',
							title: 'the result is `9`',
							line: 38,
						},
					],
				},
				{
					keyword: 'Scenario',
					title: 'Verify that a webhook request was sent using the REST client',
					line: 40,
					steps: [
						{
							keyword: 'When',
							title: 'I POST to `${webhookReceiver}/hook` with this JSON',
							line: 42,
							codeBlock: {
								language: 'json',
								code: '{ "foo": "bar" }',
							},
						},
						{
							keyword: 'Then',
							title: 'the response status code should be `202`',
							line: 50,
							comment: {
								text: 'This is the response from API Gateway',
							},
						},
					],
				},
				{
					keyword: 'Scenario Outline',
					line: 52,
					title: 'eating',
					steps: [
						{
							keyword: 'Given',
							title: 'there are `${start}` cucumbers',
							line: 54,
						},
						{
							keyword: 'When',
							title: 'I eat `${eat}` cucumbers',
							line: 56,
						},
						{
							keyword: 'Then',
							title: 'I should have `${left}` cucumbers',
							line: 58,
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
				{
					comment: {
						text: 'this comment belongs to the next scenario',
					},
					keyword: 'Scenario',
					line: 69,
					steps: [
						{
							keyword: 'Given',
							line: 71,
							title: 'this is the last scenario',
						},
					],
					title: 'Another Scenario',
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
			comment: {
				text: 'see https://cucumber.io/docs/gherkin/reference/#rule',
			},
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
									keyword: 'Given',
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
									keyword: 'Then',
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

	it('should parse a code block on the last step', () => {
		const parsed = feature(l('CodeBlockOnLastStep'))
		const expectedCodeBlock: CodeBlock = {
			code: [`{`, `  "foo": "bar"`, `}`].join(os.EOL),
			language: 'json',
		}
		const expectedComment: Comment = {
			text: 'The next step should have a comment, too',
		}
		const lastScenario = parsed.scenarios[parsed.scenarios.length - 1]
		const lastStep = lastScenario?.steps[lastScenario.steps.length - 1]

		assert.deepEqual(lastStep?.codeBlock, expectedCodeBlock)
		assert.deepEqual(lastStep?.comment, expectedComment)
	})

	it('should parse features with wrapped steps', () => {
		const parsed = feature(l('WrappedLines'))

		assert.equal(
			parsed.scenarios[0]?.steps[0]?.title,
			'I enqueue this mock HTTP API response with status code `202` for a `POST` request to `chunks.memfault.com/api/v0/chunks/${deviceId}`',
		)
	})

	it('should parse features with steps that have notes', () => {
		const parsed = feature(l('StepDescription'))

		const [step1, step2, step3] = parsed.scenarios[0]?.steps ?? []

		assert.deepEqual(step1?.description, [
			'Provide a bit more explanation to a specific step',
		])
		assert.deepEqual(step2?.comment, {
			text: 'comments still work and get applied to the following step',
		})
		assert.deepEqual(step2?.description, ['Another note'])
		assert.deepEqual(step3?.description, [
			'**Note**   It can also be used to render [these fancy note boxes](https://github.com/community/community/discussions/16925#discussion-4085374) on GitHub.',
		])
	})

	it('should parse commands for scenarios', () => {
		const parsed = feature(l('CommentsNotParsed'))

		assert.deepEqual(parsed.scenarios[1]?.comment, {
			text: 'Comments on the last step should be parsed for the next scenario. @retryScenario',
			tags: {
				retryScenario: true,
			},
		})
	})

	it('should parse two consecutive code blocks for scenarios', () => {
		const parsed = feature(l('CodeBlocksWithBlankLines'))

		assert.equal(parsed.scenarios[0]?.steps.length, 2)
	})
})
