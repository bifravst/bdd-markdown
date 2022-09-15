import { Type } from '@sinclair/typebox'
import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { validateWithJSONSchema } from './validateWithJSONSchema.js'

const typedInputSchema = Type.Object(
	{
		n: Type.Number({
			minimum: 1,
		}),
	},
	{ additionalProperties: false },
)

describe('validateWithJSONSchema()', () => {
	describe('it should validate', () => {
		const v = validateWithJSONSchema(typedInputSchema)
		it('valid input', () => {
			const isValid = v({ n: 42 })
			assert.deepEqual('value' in isValid, true)
			assert.deepEqual((isValid as any).value.n, 42)
		})
		it('invalid input', () => {
			const isInvalid = v({ n: -42 })
			assert.deepEqual('errors' in isInvalid, true)
		})
	})
})
