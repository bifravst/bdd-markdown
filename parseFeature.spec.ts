import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { parseFeature } from './parseFeature'

describe('parseFeature()', () => {
	it('should parse a sample feature file', () => {
		const tree = parseFeature(
			readFileSync(path.join(process.cwd(), 'features', 'Example.md'), 'utf-8'),
		)

		assert.deepEqual(tree, {
			keyword: 'Feature',
			shortDescription: 'Example feature',
			description: [
				'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
				'And line-breaks should be allowed in the description.',
			],
			scenarios: [
				{
					keyword: 'Scenario',
					shortDescription: 'The first scenario',
					description: [
						'This is a description for the scenario, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
						'And line-breaks should be allowed in the description.',
					],
				},
			],
		})
	})
})
