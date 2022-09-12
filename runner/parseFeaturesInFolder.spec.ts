import assert from 'assert/strict'
import { describe, it } from 'node:test'
import path from 'path'
import { parseFeaturesInFolder } from './parseFeaturesInFolder'

describe('parseFeaturesInFolder()', () => {
	it('should parse the files in a folder as features', async () => {
		const features = await parseFeaturesInFolder(
			path.join(process.cwd(), 'runner', 'test-data', 'parseFeaturesInFolder'),
		)
		assert.equal(features.length, 2)
		const highlander = features.find(({ file }) => file.name === 'A.feature')
		assert.equal(highlander?.feature.title, 'A')
	})
})
