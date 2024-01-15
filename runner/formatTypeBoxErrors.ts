import { type ValueError } from '@sinclair/typebox/compiler'

export const formatTypeBoxErrors = (errors: ValueError[]): string =>
	errors
		.map(({ path, message }) => `${path.length === 0 ? '/' : path}: ${message}`)
		.join(', ')
