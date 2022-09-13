import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
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
		const featureResult = await runFeature(
			[async () => ({ matched: true })],
			await loadExampleFeature(),
			{},
		)

		assert.equal(featureResult.ok, true)
		assert.equal('duration' in featureResult, true)
	})

	it('should skip subsequent scenarios if a scenario failed', async () => {
		const featureResult = await runFeature<{ foo?: string }>(
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
			await loadExampleFeature(),
			{},
		)

		assert.equal(featureResult.ok, false)
		assert.equal(featureResult.results[0][1].skipped, false)
		assert.equal(featureResult.results[0][1].ok, false)
		assert.equal(featureResult.results[1][1].skipped, true)
		assert.equal(featureResult.results[1][1].ok, false)
	})

	it('should expand Scenario Outlines', async () => {
		const featureResult = await runFeature(
			[async () => ({ matched: true })],
			await loadOutlineExample(),
			{},
		)

		assert.equal(featureResult.ok, true)
		const createdScenarios = featureResult.results.map(
			([{ title, example, steps }]) => ({
				title,
				example,
				replacedStep: steps.find((s) =>
					s.title.includes('I set the initial direction'),
				)?.title,
			}),
		)
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
})
