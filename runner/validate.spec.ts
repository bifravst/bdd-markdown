import { Type } from '@sinclair/typebox'
import { validate } from './validate.js'
import { describe, test as it } from 'node:test'
import assert from 'node:assert/strict'

void describe('validate', () => {
	void it('Should check input is valid', async () => {
		const maybeValid = validate(Type.Number())(42)
		if ('value' in maybeValid) {
			assert.equal(maybeValid.value, 42)
		} else {
			throw new Error(`It should be valid!`)
		}
	})
	void it("Should check as 'invalid' values less than 0", () => {
		const maybeValid = validate(Type.Number({ minimum: 0 }))(-42)
		assert.equal('errors' in maybeValid, true)
	})
})
