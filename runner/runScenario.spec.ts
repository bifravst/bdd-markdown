import assert from 'assert/strict'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore FIXME: remove once https://github.com/DefinitelyTyped/DefinitelyTyped/pull/62274 is merged
import { beforeEach, describe, it } from 'node:test'
import path from 'path'
import { Scenario } from '../parser/grammar.js'
import { logger, LogLevel } from './logger.js'
import { loadFeatureFile } from './parseFeaturesInFolder.js'
import { runScenario } from './runScenario.js'
import { noMatch } from './runStep.js'

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
	let runScenarioArgs: Parameters<typeof runScenario>[0]
	beforeEach(async () => {
		const feature = await f()
		const getRelativeTs = () => 42
		runScenarioArgs = {
			stepRunners: [],
			feature,
			scenario: feature.scenarios[0] as Scenario,
			context: {},
			getRelativeTs: getRelativeTs,
			featureLogger: logger({ getRelativeTs }),
		}
	})

	it('should run a scenario', async () => {
		const scenarioResult = await runScenario({
			...runScenarioArgs,
			stepRunners: [async () => ({ matched: true })],
		})

		assert.equal(scenarioResult.ok, true)
		assert.equal('duration' in scenarioResult, true)
	})

	it('should pass the result from the previous step', async () => {
		const prev: any[] = []
		const scenarioResult = await runScenario({
			...runScenarioArgs,
			stepRunners: [
				async ({ previousResult }) => {
					prev.push(previousResult)
					return { matched: true, result: 17 }
				},
			],
		})

		assert.equal(prev[0], undefined)
		assert.equal(prev[1], 17)
		assert.equal(scenarioResult.ok, true)
	})

	it('should preserve the context between steps', async () => {
		let c: Record<string, any> = {}
		const scenarioResult = await runScenario<{ foo?: string }>({
			...runScenarioArgs,
			stepRunners: [
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
		})

		assert.equal(scenarioResult.ok, true)
		assert.deepEqual(c, { foo: 'bar' })
	})

	it('should skip subsequent steps if a step failed', async () => {
		const scenarioResult = await runScenario<{ foo?: string }>({
			...runScenarioArgs,
			stepRunners: [
				async ({ step: { title } }) => {
					if (!/^I am run$/.test(title)) return noMatch
					throw new Error(`Some error!`)
				},
				async ({ step: { title } }) => {
					if (!/^I am also run$/.test(title)) return noMatch
					return { matched: true }
				},
			],
		})

		assert.equal(scenarioResult.ok, false)
		assert.equal(scenarioResult.results[0][1].skipped, false)
		assert.equal(scenarioResult.results[0][1].ok, false)
		assert.equal(scenarioResult.results[1][1].skipped, true)
		assert.equal(scenarioResult.results[1][1].ok, false)
	})

	it('should return the logs from step runners logging to the scenario', async () => {
		const feature = (
			await loadFeatureFile(
				path.join(
					process.cwd(),
					'runner',
					'test-data',
					'runFeature',
					'OneStep.feature.md',
				),
			)
		).feature
		const getRelativeTs = () => 42

		const scenarioResult = await runScenario({
			stepRunners: [
				async ({
					log: {
						scenario: { debug, error, info, progress },
					},
				}) => {
					debug(`A debug message`, `with two parts`)
					error({ message: `Some error` })
					info(`An info`)
					progress(`Doing something`, `the thing`)
					return { matched: true }
				},
			],
			feature,
			scenario: feature.scenarios[0] as Scenario,
			context: {},
			getRelativeTs: getRelativeTs,
			featureLogger: logger({ getRelativeTs }),
		})

		assert.equal(scenarioResult.ok, true)
		assert.deepEqual(scenarioResult.logs, [
			{
				level: LogLevel.DEBUG,
				ts: 42,
				message: [`A debug message`, `with two parts`],
			},
			{
				level: LogLevel.ERROR,
				ts: 42,
				message: [`Some error`],
			},
			{
				level: LogLevel.INFO,
				ts: 42,
				message: [`An info`],
			},
			{
				level: LogLevel.PROGRESS,
				ts: 42,
				message: [`Doing something`, `the thing`],
			},
		])
	})
})
