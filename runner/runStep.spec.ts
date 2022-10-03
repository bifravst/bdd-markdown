import assert from 'assert/strict'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore FIXME: remove once https://github.com/DefinitelyTyped/DefinitelyTyped/pull/62274 is merged
import { beforeEach, describe, it } from 'node:test'
import path from 'path'
import { Feature, Keyword, Scenario, StepKeyword } from '../parser/grammar.js'
import { comment } from '../parser/tokens/comment.js'
import { tokenStream } from '../parser/tokenStream.js'
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
		const scenario = feature.scenarios[0] as Scenario
		runStepArgs = {
			stepRunners: [],
			feature,
			scenario,
			step: feature.scenarios[0].steps[0],
			context: {},
			previousResults: [],
			getRelativeTs: getRelativeTs,
			featureLogger: logger({ getRelativeTs, context: feature }),
			scenarioLogger: logger({
				getRelativeTs,
				context: scenario,
			}),
		}
	})

	it('should run a step', async () => {
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [async () => undefined],
		})

		assert.equal(stepResult.ok, true)
		assert.equal('duration' in stepResult, true)
	})

	it('should return the result of a step', async () => {
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [async () => ({ result: 17 })],
		})

		assert.equal(stepResult.ok, true)
		assert.equal(stepResult.result, 17)
	})

	it('should return a printable variant of the step result', async () => {
		const stepResult = await runStep({
			...runStepArgs,
			stepRunners: [async () => ({ result: 17, printable: '17' })],
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
			stepRunners: [async () => undefined],
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

	it('should retry a step', async () => {
		const getRelativeTs = () => 42
		const feature: Feature = {
			keyword: Keyword.Feature,
			line: 1,
			scenarios: [],
		}
		const scenario: Scenario = {
			keyword: Keyword.Scenario,
			line: 1,
			steps: [],
		}

		const stepResult = await runStep({
			feature,
			scenario,
			step: {
				keyword: StepKeyword.Soon,
				line: 1,
				title: 'I have the result',
				comment:
					comment(
						tokenStream('<!-- @retry:tries=5,initialDelay=1,delayFactor=1 -->'),
					) ?? undefined,
			},
			context: {},
			stepRunners: [
				async () => {
					throw new Error(`Always fails!`)
				},
			],
			getRelativeTs: () => 42,
			featureLogger: logger({ getRelativeTs, context: feature }),
			scenarioLogger: logger({
				getRelativeTs,
				context: scenario,
			}),
			previousResults: [],
		})

		assert.equal(stepResult.ok, false)
		assert.equal(stepResult.tries, 5)
		assert.deepEqual(stepResult.logs.pop(), {
			message: ['Always fails!'],
			level: 'error',
			ts: 42,
		})
	})
})
