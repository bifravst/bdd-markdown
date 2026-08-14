import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { StepKeyword } from '../parser/grammar.ts'
import { replaceFromContext } from './replaceFromContext.ts'

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

	it('should replace nested placeholders', async () => {
		const replaced = await replaceFromContext(
			{
				keyword: StepKeyword.Given,
				title:
					'the `Authorization` header of the next request is `${cognitoUser.idToken}`',
				line: 1,
			},
			{
				cognitoUser: {
					idToken: 'eyJraWQiOiJndmxxx',
				},
			},
		)
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Given,
			title:
				'the `Authorization` header of the next request is `eyJraWQiOiJndmxxx`',
			line: 1,
		})
	})
})
