import type { Static, TSchema } from '@sinclair/typebox'
import Ajv, { type ErrorObject } from 'ajv'

export const validateWithJSONSchema = <T extends TSchema>(
	schema: T,
): ((
	value: unknown,
) =>
	| { value: Static<typeof schema> }
	| { errors: ErrorObject[]; input: unknown }) => {
	const ajv = new Ajv()
	// see @https://github.com/sinclairzx81/typebox/issues/51
	ajv.addKeyword('kind')
	ajv.addKeyword('modifier')
	const v = ajv.compile(schema)
	return (value: unknown) => {
		const valid = v(value)
		if (valid !== true) {
			return {
				errors: v.errors as ErrorObject[],
				input: value,
			}
		}
		return { value: value as Static<typeof schema> }
	}
}
