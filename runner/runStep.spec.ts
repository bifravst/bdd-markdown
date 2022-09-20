import assert from 'assert/strict'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore FIXME: remove once https://github.com/DefinitelyTyped/DefinitelyTyped/pull/62274 is merged
import { beforeEach, describe, it } from 'node:test'
import path from 'path'
import { Scenario } from '../parser/grammar.js'
import { logger, LogLevel } from './logger.js'
import { loadFeatureFile } from './parseFeaturesInFolder.js'
import { runStep } from './runStep.js'

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
	let runStepArgs: Parameters<typeof runStep>[0]
	beforeEach(async () => {
		const feature = await f()
		const getRelativeTs = () => 42
		runStepArgs = {
			stepRunners: [],
			feature,
			scenario: feature.scenarios[0] as Scenario,
			step: feature.scenarios[0].steps[0],
			context: {},
			previousResults: [],
			getRelativeTs: getRelativeTs,
			featureLogger: logger({ getRelativeTs }),
			scenarioLogger: logger({ getRelativeTs }),
		}
	})

	it('should run a step', async () => {
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [async () => ({ matched: true })],
		})

		assert.equal(stepResult.ok, true)
		assert.equal('duration' in stepResult, true)
	})

	it('should return the result of a step', async () => {
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [async () => ({ matched: true, result: 17 })],
		})

		assert.equal(stepResult.ok, true)
		assert.equal(stepResult.result, 17)
	})

	it('should return a printable variant of the step result', async () => {
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [
				async () => ({ matched: true, result: 17, printable: '17' }),
			],
		})

		assert.equal(stepResult.ok, true)
		assert.equal(stepResult.printable, '17')
	})

	it('should fail if there are no matching steps', async () => {
		const stepResult = await runStep({ ...runStepArgs, stepRunners: [] })

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
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [
				async ({
					log: {
						step: { debug, error, info, progress },
					},
				}) => {
					debug(`A debug message`, `with two parts`)
					error({ message: `Some error` })
					info(`An info`)
					progress(`Doing something`, `the thing`)
					return { matched: true }
				},
			],
		})

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

	it('should complain about unreplaced placeholders', async () => {
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [async () => ({ matched: true })],
			step: {
				...runStepArgs.feature.scenarios[0].steps[0],
				title: 'I echo ${unreplaced}',
			},
		})

		assert.equal(stepResult.ok, false)
		assert.deepEqual(stepResult.logs, [
			{
				level: LogLevel.ERROR,
				ts: 42,
				message: ['Step has unreplaced placeholders: ${unreplaced}'],
			},
		])
	})

	it('should complain replaced placeholders with data from context', async () => {
		let replacedTitle = ''
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [
				async ({ step: { title } }) => {
					replacedTitle = title
					return { matched: true }
				},
			],
			step: {
				...runStepArgs.feature.scenarios[0].steps[0],
				title: 'I echo ${foo}',
			},
			context: {
				foo: 'bar',
			},
		})

		assert.equal(stepResult.ok, true)
		assert.equal(replacedTitle, 'I echo bar')
	})
})
