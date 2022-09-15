import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { parseFeaturesInFolder } from '../runner/parseFeaturesInFolder.js'
import { orderFeatures } from './orderFeatures.js'

describe('orderFeatures()', () => {
	it('should order the features according to their dependencies and whether they should run first or last', async () => {
		const features = await parseFeaturesInFolder(
			path.join(process.cwd(), 'order', 'test-data', 'required-order'),
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
			path.join(process.cwd(), 'order', 'test-data', 'invalid-dependency'),
		)
		assert.throws(
			() => orderFeatures(features),
			/Feature "Second Feature" depends on unknown feature "First feature"!/,
		)
	})

	/** 
	it('should skip dependent features', async () => {
		const features = await parseFeaturesInFolder(
			path.join(process.cwd(), 'order', 'test-data', 'skip'),
		)
		const executionOrder = orderFeatures(features).map(
			({ feature }) => feature.title,
		)
		assert.deepEqual(executionOrder, ['Run this feature'])
	})
	*/
})
