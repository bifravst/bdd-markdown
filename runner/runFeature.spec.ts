import assert from 'assert/strict'
import { randomUUID } from 'crypto'
import { describe, it } from 'node:test'
import path from 'path'
import { codeBlockOrThrow } from './codeBlockOrThrow.js'
import { LogLevel } from './logger.js'
import { loadFeatureFile } from './parseFeaturesInFolder.js'
import { runFeature } from './runFeature.js'
import { noMatch } from './runStep.js'

const loadExampleFeature = async () =>
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

const loadOutlineExample = async () =>
	(
		await loadFeatureFile(
			path.join(
				process.cwd(),
				'examples',
				'mars-rover',
				'MarsRover.feature.md',
			),
		)
	).feature

describe('runFeature()', () => {
	it('should run a feature', async () => {
		const featureResult = await runFeature({
			stepRunners: [async () => undefined],
			feature: await loadExampleFeature(),
			context: {},
		})

		assert.equal(featureResult.ok, true)
		assert.equal('duration' in featureResult, true)
	})

	it('should skip subsequent scenarios if a scenario failed', async () => {
		const featureResult = await runFeature<{ foo?: string }>({
			stepRunners: [
				async ({ step: { title } }) => {
					if (!/^I am run$/.test(title)) return noMatch
					throw new Error(`Some error!`)
				},
				async ({ step: { title } }) => {
					if (!/^I am also run$/.test(title)) return noMatch
					return
				},
			],
			feature: await loadExampleFeature(),
			context: {},
		})

		assert.equal(featureResult.ok, false)
		assert.equal(featureResult.results[0]?.[1].skipped, false)
		assert.equal(featureResult.results[0]?.[1].ok, false)
		assert.equal(featureResult.results[1]?.[1].skipped, true)
		assert.equal(featureResult.results[1]?.[1].ok, false)
	})

	it('should expand Scenario Outlines', async () => {
		const featureResult = await runFeature({
			stepRunners: [async () => undefined],
			feature: await loadOutlineExample(),
			context: {},
		})

		assert.equal(featureResult.ok, true)

		const createdScenarios = featureResult.results
			.filter(([{ title }]) => title?.includes('Move the rover forward'))
			.map(([{ title, example, steps }]) => ({
				title,
				example,
				replacedStep: steps.find((s) =>
					s.title.includes('I set the initial direction'),
				)?.title,
			}))
		assert.deepEqual(createdScenarios, [
			{
				title: 'Move the rover forward',
				example: {
					direction: 'N',
					x: '0',
					y: '-1',
				},
				replacedStep: 'I set the initial direction to `N`',
			},
			{
				title: 'Move the rover forward',
				example: {
					direction: 'S',
					x: '0',
					y: '1',
				},
				replacedStep: 'I set the initial direction to `S`',
			},
			{
				title: 'Move the rover forward',
				example: {
					direction: 'E',
					x: '1',
					y: '0',
				},
				replacedStep: 'I set the initial direction to `E`',
			},
			{
				title: 'Move the rover forward',
				example: {
					direction: 'W',
					x: '-1',
					y: '0',
				},
				replacedStep: 'I set the initial direction to `W`',
			},
		])
	})

	it('should return the logs from step runners logging to the feature', async () => {
		const featureResult = await runFeature({
			stepRunners: [
				async ({
					log: {
						feature: { debug, error, info, progress },
					},
				}) => {
					debug(`A debug message`, `with two parts`)
					error({ message: `Some error` })
					info(`An info`)
					progress(`Doing something`, `the thing`)
				},
			],
			feature: (
				await loadFeatureFile(
					path.join(
						process.cwd(),
						'runner',
						'test-data',
						'runFeature',
						'OneStep.feature.md',
					),
				)
			).feature,
			context: {},
			getRelativeTs: () => 42,
		})

		assert.equal(featureResult.ok, true)
		assert.deepEqual(featureResult.logs, [
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

	describe('observe logs', () => {
		it('should allow to pass a log observer', async () => {
			const observedLogs: any[] = []
			const featureResult = await runFeature({
				stepRunners: [
					async ({
						log: {
							feature: { debug, error, info, progress },
						},
					}) => {
						debug(`A debug message`, `with two parts`)
						error({ message: `Some error` })
						info(`An info`)
						progress(`Doing something`, `the thing`)
					},
				],
				feature: (
					await loadFeatureFile(
						path.join(
							process.cwd(),
							'runner',
							'test-data',
							'runFeature',
							'OneStep.feature.md',
						),
					)
				).feature,
				context: {},
				getRelativeTs: () => 42,
				logObserver: {
					onDebug: (_, ...args) => observedLogs.push([LogLevel.DEBUG, ...args]),
					onError: (_, error) => observedLogs.push([LogLevel.ERROR, error]),
					onInfo: (_, ...args) => observedLogs.push([LogLevel.INFO, ...args]),
					onProgress: (_, ...args) =>
						observedLogs.push([LogLevel.PROGRESS, ...args]),
				},
			})

			assert.equal(featureResult.ok, true)
			assert.deepEqual(observedLogs, [
				[LogLevel.DEBUG, `A debug message`, `with two parts`],
				[LogLevel.ERROR, { message: `Some error` }],
				[LogLevel.INFO, `An info`],
				[LogLevel.PROGRESS, `Doing something`, `the thing`],
			])
		})
	})

	it('should pass updated context between scenarios', async () => {
		const context: Record<string, any> = {}
		const featureResult = await runFeature({
			stepRunners: [
				async ({ step: { title }, context }) => {
					const match =
						/^I store a random string in `(?<storageName>[^`]+)`$/.exec(title)
					if (match === null) return noMatch
					context[match.groups?.storageName ?? ''] = randomUUID()
					return
				},
				async ({ step: { title } }) => {
					const match = /^`(?<value>[^`]+)` should not be empty$/.exec(title)
					if (match === null) return noMatch
					assert.equal((match.groups?.value ?? '').length, 36)
					return
				},
				async ({ step }) => {
					const match = /^it should be replaced in this JSON$/.exec(step.title)
					if (match === null) return noMatch
					assert.equal(
						JSON.parse(codeBlockOrThrow(step).code).aStringParameter.length,
						36,
					)
					return
				},
			],
			feature: (
				await loadFeatureFile(
					path.join(
						process.cwd(),
						'runner',
						'test-data',
						'runFeature',
						'UpdateContext.feature.md',
					),
				)
			).feature,
			context,
		})

		assert.equal(featureResult.ok, true)
		assert.match(context.randomString, /[a-f0-9-]{36}/)
	})

	it('should retry a scenario if a step has @retryScenario enabled', async () => {
		const feature = (
			await loadFeatureFile(
				path.join(
					process.cwd(),
					'runner',
					'test-data',
					'runFeature',
					'RetryScenario.feature.md',
				),
			)
		).feature

		const numTries: Record<string, number> = {}

		await runFeature({
			stepRunners: [
				async ({ step }) => {
					numTries[step.title] = (numTries[step.title] ?? 0) + 1
					if (
						step.title === 'I have failed the first time' &&
						numTries[step.title] === 1
					) {
						throw new Error(`Fail!`)
					}
				},
			],
			feature,
			context: {},
		})

		assert.equal(numTries['this step will also be retried'], 2)
		assert.equal(numTries['I have failed the first time'], 2)
	})
})
