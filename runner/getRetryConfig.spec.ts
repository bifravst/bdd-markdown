import {
	Feature,
	Keyword,
	Scenario,
	Step,
	StepKeyword,
} from '@nordicsemiconductor/bdd-markdown/parser'
import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { parseTags } from '../parser/tokens/parseTags.js'
import {
	defaultRetryConfig,
	getRetryConfig,
	PartialRetryConfig,
	RetryConfig,
} from './getRetryConfig.js'

const commentTests: [comment: string, expected: RetryConfig][] = [
	// Full config
	[
		'This @retry:tries=3,initialDelay=100,delayFactor=1.5 applies only to the next step.',
		{
			tries: 3,
			initialDelay: 100,
			delayFactor: 1.5,
		},
	],
	// Partial
	[
		'This @retry:tries=42 applies only to the next step.',
		{
			tries: 42,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
	[
		'This @retry:delayFactor=0.5 applies only to the next step.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: 0.5,
		},
	],
	[
		'This @retry:initialDelay=666 applies only to the next step.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: 666,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
	// All defaults
	[
		'This @retry applies only to the next step.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
	[
		'This applies only to the next step.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
]

const invalidCommentsTests: string[] = [
	// Wrong value type
	'This @retry:tries=3.5',
	'This @retry:tries=A',
	// Unknown property
	'This @retry:foo=1.5',
	// Invalid value
	'This @retry:tries=0',
]

describe('getRetryConfig()', () => {
	describe('parse retry configuration from step comments', () => {
		for (const [comment, expected] of commentTests) {
			it(`should return the retry configuration ${JSON.stringify(
				expected,
			)} from a Soon step with the comment: ${comment}`, () => {
				const step: Step = {
					keyword: StepKeyword.Soon,
					line: 1,
					title: 'a retry-able step',
					comment: {
						text: comment,
						tags: parseTags(comment),
					},
				}
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					steps: [step],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					line: 1,
				}
				assert.deepEqual(getRetryConfig(step, scenario, feature), expected)
			})
		}

		for (const comment of invalidCommentsTests) {
			it(`should throw an error for the retry configuration in the comment: ${comment}`, () => {
				const step: Step = {
					keyword: StepKeyword.Soon,
					line: 1,
					title: 'a retry-able step',
					comment: {
						text: comment,
						tags: parseTags(comment),
					},
				}
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					steps: [step],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					line: 1,
				}
				assert.throws(
					() => getRetryConfig(step, scenario, feature),
					/Invalid retry configuration provided/,
				)
			})
		}
	})

	describe('parse retry configuration from scenario comments', () => {
		for (const [comment, expected] of commentTests) {
			it(`should return the retry configuration ${JSON.stringify(
				expected,
			)} from a scenario with the comment: ${comment}`, () => {
				const step: Step = {
					keyword: StepKeyword.Soon,
					line: 1,
					title: 'a retry-able step',
				}
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					comment: {
						text: comment,
						tags: parseTags(comment),
					},
					steps: [step],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					line: 1,
				}
				assert.deepEqual(getRetryConfig(step, scenario, feature), expected)
			})
		}

		for (const comment of invalidCommentsTests) {
			it(`should throw an error for the retry configuration in the comment: ${comment}`, () => {
				const step: Step = {
					keyword: StepKeyword.Soon,
					line: 1,
					title: 'a retry-able step',
				}
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					comment: {
						text: comment,
						tags: parseTags(comment),
					},
					steps: [step],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					line: 1,
				}
				assert.throws(
					() => getRetryConfig(step, scenario, feature),
					/Invalid retry configuration provided/,
				)
			})
		}
	})

	describe('parse retry configuration from feature front matter', () => {
		const commentTests: [
			config: PartialRetryConfig | undefined,
			expected: RetryConfig,
		][] = [
			// Full config
			[
				{
					tries: 3,
					initialDelay: 100,
					delayFactor: 1.5,
				},
				{
					tries: 3,
					initialDelay: 100,
					delayFactor: 1.5,
				},
			],
			// Partial
			[
				{
					tries: 42,
				},
				{
					tries: 42,
					initialDelay: defaultRetryConfig.initialDelay,
					delayFactor: defaultRetryConfig.delayFactor,
				},
			],
			[
				{
					delayFactor: 0.5,
				},
				{
					tries: defaultRetryConfig.tries,
					initialDelay: defaultRetryConfig.initialDelay,
					delayFactor: 0.5,
				},
			],
			[
				{
					initialDelay: 666,
				},
				{
					tries: defaultRetryConfig.tries,
					initialDelay: 666,
					delayFactor: defaultRetryConfig.delayFactor,
				},
			],
			// All defaults
			[
				{},
				{
					tries: defaultRetryConfig.tries,
					initialDelay: defaultRetryConfig.initialDelay,
					delayFactor: defaultRetryConfig.delayFactor,
				},
			],
			[
				undefined,
				{
					tries: defaultRetryConfig.tries,
					initialDelay: defaultRetryConfig.initialDelay,
					delayFactor: defaultRetryConfig.delayFactor,
				},
			],
		]

		const invalidCommentsTests: any[] = [
			// Wrong value type
			{
				tries: 3.5,
			},
			{ tries: 'A' },
			// Unknown property
			{ foo: 1.5 },
			// Invalid value
			{ tries: 0 },
		]

		for (const [config, expected] of commentTests) {
			it(`should return the retry configuration ${JSON.stringify(
				expected,
			)} from a feature with the front matter: ${JSON.stringify(
				config,
			)}`, () => {
				const step: Step = {
					keyword: StepKeyword.Soon,
					line: 1,
					title: 'a retry-able step',
				}
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					steps: [step],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					frontMatter: { retry: config },
					line: 1,
				}
				assert.deepEqual(getRetryConfig(step, scenario, feature), expected)
			})
		}

		for (const config of invalidCommentsTests) {
			it(`should throw an error for the retry configuration in the comment: ${JSON.stringify(
				config,
			)}`, () => {
				const step: Step = {
					keyword: StepKeyword.Soon,
					line: 1,
					title: 'a retry-able step',
				}
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					steps: [step],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					frontMatter: { retry: config },
					line: 1,
				}
				assert.throws(
					() => getRetryConfig(step, scenario, feature),
					/Invalid retry configuration provided/,
				)
			})
		}
	})

	it('step should overwrite scenario should overwrite feature', () => {
		const stepComment = 'This @retry:tries=42 applies only to the next step.'
		const step: Step = {
			keyword: StepKeyword.Soon,
			line: 1,
			title: 'a retry-able step',
			comment: {
				text: stepComment,
				tags: parseTags(stepComment),
			},
		}
		const scenarioComment =
			'This @retry:initialDelay=666 applies only to the next scenario.'
		const scenario: Scenario = {
			keyword: Keyword.Scenario,
			line: 1,
			title: 'a scenario',
			steps: [step],
			comment: {
				text: scenarioComment,
				tags: parseTags(scenarioComment),
			},
		}
		const featureFrontMatter = {
			retry: {
				delayFactor: 27.5,
			},
		}
		const feature: Feature = {
			keyword: Keyword.Feature,
			scenarios: [scenario],
			frontMatter: featureFrontMatter,
			line: 1,
		}
		assert.deepEqual(getRetryConfig(step, scenario, feature), {
			tries: 42,
			initialDelay: 666,
			delayFactor: 27.5,
		})
	})
})
