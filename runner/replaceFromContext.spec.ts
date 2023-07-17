import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { StepKeyword } from '../parser/grammar.js'
import { replaceFromContext } from './replaceFromContext.js'

describe('replaceFromContext()', () => {
	it('should replace nested variant placeholders', async () => {
		const replaced = await replaceFromContext(
			{
				keyword: StepKeyword.Then,
				title: 'result should be `${<variant.name>Property}`',
				line: 1,
			},
			{
				variant: {
					name: 'example',
				},
				exampleProperty: 42,
			},
		)
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Then,
			title: 'result should be `42`',
			line: 1,
		})
	})
})
