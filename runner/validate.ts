import type { Static, TSchema } from '@sinclair/typebox'
import { TypeCompiler, type ValueError } from '@sinclair/typebox/compiler'

/**
 * Validate the value against the given TypeBox schema
 */
export const validate = <T extends TSchema>(
	schema: T,
): ((value: unknown) =>
	| { value: Static<typeof schema> }
	| {
			errors: ValueError[]
	  }) => {
	const C = TypeCompiler.Compile(schema)
	return (value: unknown) => {
		const firstError = C.Errors(value).First()
		if (firstError !== undefined) {
			return {
				errors: [...C.Errors(value)],
			}
		}
		return { value: value as Static<typeof schema> }
	}
}
