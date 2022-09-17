import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { orderFeatures } from './orderFeatures.js'
import { parseFeaturesInFolder } from './parseFeaturesInFolder.js'

describe('orderFeatures()', () => {
	it('should order the features according to their dependencies and whether they should run first or last', async () => {
		const features = await parseFeaturesInFolder(
			path.join(
				process.cwd(),
				'runner',
				'test-data',
				'orderFeatures',
				'required-order',
			),
		)
		const executionOrder = orderFeatures(features).map(
			({ feature }) => feature.title,
		)
		assert.deepEqual(executionOrder, [
			'Runs first',
			'First feature',
			'Second Feature',
			'Third Feature',
			'Last feature',
		])
	})

	it('should throw an error if an dependency does not exist', async () => {
		const features = await parseFeaturesInFolder(
			path.join(
				process.cwd(),
				'runner',
				'test-data',
				'orderFeatures',
				'invalid-dependency',
			),
		)
		assert.throws(
			() => orderFeatures(features),
			/Feature "Second Feature" depends on unknown feature "First feature"!/,
		)
	})

	it('should skip dependent features', async () => {
		const features = await parseFeaturesInFolder(
			path.join(process.cwd(), 'runner', 'test-data', 'orderFeatures', 'skip'),
		)
		const executionOrder = orderFeatures(features)
			.filter(({ skip }) => skip !== true)
			.map(({ feature }) => feature.title)
		assert.deepEqual(executionOrder, ['Run this feature'])
	})

	it('should skip dependent features', async () => {
		const features = await parseFeaturesInFolder(
			path.join(process.cwd(), 'runner', 'test-data', 'orderFeatures', 'only'),
		)
		const executionOrder = orderFeatures(features)
			.filter(({ skip }) => skip !== true)
			.map(({ feature }) => feature.title)
		assert.deepEqual(executionOrder, ['Run this feature'])
	})

	it('dependencies override order', async () => {
		const features = await parseFeaturesInFolder(
			path.join(
				process.cwd(),
				'runner',
				'test-data',
				'orderFeatures',
				'last-with-dependency',
			),
		)
		const executionOrder = orderFeatures(features).map(
			({ feature }) => feature.title,
		)
		assert.deepEqual(executionOrder, ['Last', 'First'])
	})
})
