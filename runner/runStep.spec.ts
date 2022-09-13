import { Scenario } from '@bdd-markdown/parser'
import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { loadFeatureFile } from './parseFeaturesInFolder'
import { runStep } from './runStep'
import { LogLevel } from './stepLogger'

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

describe('runStep()', () => {
	it('should run a step', async () => {
		const feature = await f()
		const stepResult = await runStep(
			[async () => ({ matched: true })],
			feature,
			feature.scenarios[0] as Scenario,
			feature.scenarios[0].steps[0],
			{},
			[],
			() => 42,
		)

		assert.equal(stepResult.ok, true)
		assert.equal('duration' in stepResult, true)
	})

	it('should return the result of a step', async () => {
		const feature = await f()
		const stepResult = await runStep(
			[async () => ({ matched: true, result: 17 })],
			feature,
			feature.scenarios[0] as Scenario,
			feature.scenarios[0].steps[0],
			{},
			[],
			() => 42,
		)

		assert.equal(stepResult.ok, true)
		assert.equal(stepResult.result, 17)
	})

	it('should return a printable variant of the step result', async () => {
		const feature = await f()
		const stepResult = await runStep(
			[async () => ({ matched: true, result: 17, printable: '17' })],
			feature,
			feature.scenarios[0] as Scenario,
			feature.scenarios[0].steps[0],
			{},
			[],
			() => 42,
		)

		assert.equal(stepResult.ok, true)
		assert.equal(stepResult.printable, '17')
	})

	it('should fail if there are no matching steps', async () => {
		const feature = await f()
		const stepResult = await runStep(
			[],
			feature,
			feature.scenarios[0] as Scenario,
			feature.scenarios[0].steps[0],
			{},
			[],
			() => 42,
		)

		assert.equal(stepResult.ok, false)
		assert.deepEqual(stepResult.logs, [
			{
				level: LogLevel.ERROR,
				message: ['No runner defined for step: I am run'],
				ts: 42,
			},
		])
	})

	it('should return the logs from the step runner', async () => {
		const feature = await f()
		const stepResult = await runStep(
			[
				async ({ log: { debug, error, info, progress } }) => {
					debug(`A debug message`, `with two parts`)
					error({ message: `Some error` })
					info(`An info`)
					progress(`Doing something`, `the thing`)
					return { matched: true }
				},
			],
			feature,
			feature.scenarios[0] as Scenario,
			feature.scenarios[0].steps[0],
			{},
			[],
			() => 42,
		)

		assert.equal(stepResult.ok, true)
		assert.deepEqual(stepResult.logs, [
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
