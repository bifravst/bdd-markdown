import { Type } from '@sinclair/typebox'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatTypeBoxErrors } from './formatTypeBoxErrors.ts'
import { validate } from './validate.ts'

void describe('formatTypeBoxErrors()', async () =>
	void it('should format TypeBox errors', () => {
		const validateInput = validate(
			Type.Object({
				email: Type.RegExp(/.+@.+/),
			}),
		)
		assert.equal(
			formatTypeBoxErrors(
				(
					validateInput({
						email: 'f',
					}) as any
				).errors,
			),
			`/email: Expected string to match regular expression`,
		)
	}))
