import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { StepKeyword } from '../parser/grammar.js'
import { MissingCodeBlockError, codeBlockOrThrow } from './codeBlockOrThrow.js'

describe('codeBlockOrThrow()', () => {
	it('should throw an Exception if a code block is not defined', () =>
		assert.throws(
			() =>
				codeBlockOrThrow({
					keyword: StepKeyword.Given,
					line: 1,
					title: 'a step without a code block',
				}),
			MissingCodeBlockError,
			'Expected code block to be defined for step "Given a step without a code block" in line 1!',
		))

	it('should return the code block', () =>
		assert.deepEqual(
			codeBlockOrThrow({
				keyword: StepKeyword.Given,
				line: 1,
				title: 'a step with a code block',
				codeBlock: {
					code: 'Some code',
				},
			}),
			{
				code: 'Some code',
			},
		))
})
