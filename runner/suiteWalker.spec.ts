import { describe, it, mock } from 'node:test'
import { suiteWalker } from './suiteWalker.js'
import path from 'node:path'
import { parseFeaturesInFolder } from './parseFeaturesInFolder.js'
import assert from 'node:assert'

describe('suiteWalker()', () => {
	it('should walk a suite', async () => {
		const onFeatureMock = mock.fn()
		const onScenarioMock = mock.fn()
		const onStepMock = mock.fn()
		await suiteWalker(
			await parseFeaturesInFolder(
				path.join(
					process.cwd(),
					'runner',
					'test-data',
					'suiteWalker',
					'example',
				),
			),
		)
			.onFeature(onFeatureMock)
			.onScenario(onScenarioMock)
			.onStep(onStepMock)
			.walk()

		assert.equal(onFeatureMock.mock.callCount(), 4)
		assert.equal(onScenarioMock.mock.callCount(), 8)
		assert.equal(onStepMock.mock.callCount(), 13)
		assert.deepEqual(
			onStepMock.mock.calls.map(({ arguments: args }) => args[0].step.title),
			[
				'this is the first step',
				'this is the second step',
				'this is also a step',
				'network is `ltem` and modem is `LTE-M`',
				'network is `ltem` and modem is `LTE-M`',
				'network is `nbiot` and modem is `NB-IoT`',
				'network is `nbiot` and modem is `NB-IoT`',
				'there are `12` cucumbers',
				'I eat `5` cucumbers',
				'I should have `7` cucumbers',
				'there are `20` cucumbers',
				'I eat `5` cucumbers',
				'I should have `15` cucumbers',
			],
		)
	})

	it('should ignore unreplaced placeholders in code-blocks', async () =>
		assert.doesNotReject(async () =>
			suiteWalker(
				await parseFeaturesInFolder(
					path.join(
						process.cwd(),
						'runner',
						'test-data',
						'suiteWalker',
						'variants',
					),
				),
			).walk(),
		))
})
