import assert from 'assert/strict'
import { describe, it } from 'node:test'
import {
	Keyword,
	type Feature,
	type PartialRetryConfig,
	type RetryConfig,
	type Scenario,
} from '../parser/grammar.js'
import { parseTags } from '../parser/tokens/parseTags.js'
import { defaultRetryConfig } from './getRetryConfig.js'
import { getScenarioRetryConfig } from './getScenarioRetryConfig.js'

const commentTests: [comment: string, expected: RetryConfig][] = [
	// Full config
	[
		'This @retryScenario:tries=3,initialDelay=100,delayFactor=1.5 applies only to the next scenario.',
		{
			tries: 3,
			initialDelay: 100,
			delayFactor: 1.5,
		},
	],
	// Partial
	[
		'This @retryScenario:tries=42 applies only to the next scenario.',
		{
			tries: 42,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
	[
		'This @retryScenario:delayFactor=0.5 applies only to the next scenario.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: 0.5,
		},
	],
	[
		'This @retryScenario:initialDelay=666 applies only to the next scenario.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: 666,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
	// All defaults
	[
		'This @retryScenario applies only to the next scenario.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
	[
		'This applies only to the next scenario.',
		{
			tries: defaultRetryConfig.tries,
			initialDelay: defaultRetryConfig.initialDelay,
			delayFactor: defaultRetryConfig.delayFactor,
		},
	],
]

describe('getScenarioRetryConfig()', () => {
	describe('parse retry configuration from step comments', () => {
		for (const [comment, expected] of commentTests) {
			it(`should return the retry configuration ${JSON.stringify(
				expected,
			)} from a Soon step with the comment: ${comment}`, () => {
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					steps: [],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					line: 1,
				}
				assert.deepEqual(getScenarioRetryConfig(scenario, feature), expected)
			})
		}
	})

	describe('parse retry configuration from scenario comments', () => {
		for (const [comment, expected] of commentTests) {
			it(`should return the retry configuration ${JSON.stringify(
				expected,
			)} from a scenario with the comment: ${comment}`, () => {
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					comment: {
						text: comment,
						tags: parseTags(comment),
					},
					steps: [],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					line: 1,
				}
				assert.deepEqual(getScenarioRetryConfig(scenario, feature), expected)
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

		for (const [config, expected] of commentTests) {
			it(`should return the retry configuration ${JSON.stringify(
				expected,
			)} from a feature with the front matter: ${JSON.stringify(
				config,
			)}`, () => {
				const scenario: Scenario = {
					keyword: Keyword.Scenario,
					line: 1,
					title: 'a scenario',
					steps: [],
				}
				const feature: Feature = {
					keyword: Keyword.Feature,
					scenarios: [scenario],
					frontMatter: { retryScenario: config },
					line: 1,
				}
				assert.deepEqual(getScenarioRetryConfig(scenario, feature), expected)
			})
		}
	})

	it('scenario should overwrite feature', () => {
		const scenarioComment =
			'This @retryScenario:initialDelay=666 applies only to the next scenario.'
		const scenario: Scenario = {
			keyword: Keyword.Scenario,
			line: 1,
			title: 'a scenario',
			steps: [],
			comment: {
				text: scenarioComment,
				tags: parseTags(scenarioComment),
			},
		}
		const featureFrontMatter = {
			retryScenario: {
				delayFactor: 27.5,
			},
		}
		const feature: Feature = {
			keyword: Keyword.Feature,
			scenarios: [scenario],
			frontMatter: featureFrontMatter,
			line: 1,
		}
		assert.deepEqual(getScenarioRetryConfig(scenario, feature), {
			tries: 5,
			initialDelay: 666,
			delayFactor: 27.5,
		})
	})
})
