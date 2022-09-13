import { Scenario } from '@bdd-markdown/parser'
import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { loadFeatureFile } from './parseFeaturesInFolder'
import { runScenario } from './runScenario'
import { noMatch } from './runStep'

const f = async () =>
	(
		await loadFeatureFile(
			path.join(
				process.cwd(),
				'runner',
				'test-data',
				'runSuite',
				'Example.feature.md',
			),
		)
	).feature

describe('runScenario()', () => {
	it('should run a scenario', async () => {
		const feature = await f()
		const scenarioResult = await runScenario(
			[async () => ({ matched: true })],
			feature,
			feature.scenarios[0] as Scenario,
			{},
			() => 42,
		)

		assert.equal(scenarioResult.ok, true)
		assert.equal('duration' in scenarioResult, true)
	})

	it('should pass the result from the previous step', async () => {
		const feature = await f()
		const prev: any[] = []
		const scenarioResult = await runScenario(
			[
				async ({ previousResult }) => {
					prev.push(previousResult)
					return { matched: true, result: 17 }
				},
			],
			feature,
			feature.scenarios[0] as Scenario,
			{},
			() => 42,
		)

		assert.equal(prev[0], undefined)
		assert.equal(prev[1], 17)
		assert.equal(scenarioResult.ok, true)
	})

	it('should preserve the context between steps', async () => {
		const feature = await f()
		let c: Record<string, any> = {}
		const scenarioResult = await runScenario<{ foo?: string }>(
			[
				async ({ step: { title }, context }) => {
					if (!/^I am run$/.test(title)) return noMatch
					// Set a property on the context
					context.foo = 'bar'
					return { matched: true }
				},
				async ({ step: { title }, context }) => {
					if (!/^I am also run$/.test(title)) return noMatch
					// store context for testing
					c = context
					return { matched: true }
				},
			],
			feature,
			feature.scenarios[0] as Scenario,
			{},
			() => 42,
		)

		assert.equal(scenarioResult.ok, true)
		assert.deepEqual(c, { foo: 'bar' })
	})

	it('should skip subsequent steps if a step failed', async () => {
		const feature = await f()
		const scenarioResult = await runScenario<{ foo?: string }>(
			[
				async ({ step: { title }, context }) => {
					if (!/^I am run$/.test(title)) return noMatch
					throw new Error(`Some error!`)
				},
				async ({ step: { title }, context }) => {
					if (!/^I am also run$/.test(title)) return noMatch
					return { matched: true }
				},
			],
			feature,
			feature.scenarios[0] as Scenario,
			{},
			() => 42,
		)

		assert.equal(scenarioResult.ok, false)
		assert.equal(scenarioResult.results[0][1].skipped, false)
		assert.equal(scenarioResult.results[0][1].ok, false)
		assert.equal(scenarioResult.results[1][1].skipped, true)
		assert.equal(scenarioResult.results[1][1].ok, false)
	})
})
