import { type Static, type TObject } from '@sinclair/typebox'
import { validateWithJSONSchema } from './validateWithJSONSchema.js'
import type { StepRunner, StepRunnerArgs } from './runSuite.js'

export class MatchError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'MatchError'
	}
}
const convert = (
	groups: Record<string, string>,
	converters: Record<string, (v: string) => string>,
): Record<string, unknown> =>
	Object.entries(groups).reduce(
		(converted, [k, v]) => ({
			...converted,
			[k]: converters[k]?.(v) ?? v,
		}),
		{},
	)
/**
 * Helper function to match, convert and validate an input string.
 *
 * Returns the matched and validate groups, or null in case the RegExp did not match.
 */

export const matchGroups =
	<Schema extends TObject>(
		/**
		 * The regular expression to match the input against.
		 * Must define capture groups.
		 */
		regExp: RegExp,
		/**
		 * The schema to validate the output against.
		 */
		schema: Schema,
		/**
		 * Optional converters to apply to the capture groups.
		 */
		converters?: {
			[P in keyof Static<typeof schema>]?: (v: string) => unknown
		},
	) =>
	(
		/**
		 * The input string.
		 */
		input: string,
	): null | Static<typeof schema> => {
		const matches = regExp.exec(input)
		if (matches === null) return null // No matches
		if (matches.groups === undefined)
			throw new MatchError(
				`RegExp ${regExp.toString()} matched "${input} but does not contain capture groups."`,
			)
		const converted =
			converters !== undefined
				? convert(
						matches.groups,
						converters as Record<string, (v: string) => string>,
				  )
				: matches.groups
		const valid = validateWithJSONSchema(schema)(converted)
		if ('errors' in valid)
			throw new MatchError(
				`Result '${JSON.stringify(
					converted,
				)}' matched from '${input}' is not valid: ${valid.errors
					.map(({ instancePath, message }) => `${instancePath}: ${message}`)
					.join(', ')}!`,
			)
		return valid.value
	}

export const regExpMatcher =
	(matcher: ReturnType<typeof matchGroups>) =>
	(title: string): boolean =>
		matcher(title) !== null

export const groupMatcher = <
	Schema extends TObject,
	Context extends Record<string, any> = Record<string, any>,
>(
	matcher: {
		/**
		 * The regular expression to match the input against.
		 * Must define capture groups.
		 */
		regExp: RegExp
		/**
		 * The schema to validate the output against.
		 */
		schema: Schema
		/**
		 * The runner, called when the regExp matches
		 */
		/**
		 * Optional converters to apply to the capture groups.
		 */
		converters?: {
			[P in keyof Static<typeof matcher.schema>]?: (v: string) => unknown
		}
	},
	onMatch: (
		args: StepRunnerArgs<Context> & { match: Static<typeof matcher.schema> },
	) => Promise<void>,
): StepRunner<Context> => ({
	match: (title) =>
		regExpMatcher(
			matchGroups(matcher.regExp, matcher.schema, matcher.converters),
		)(title),
	run: async (args) => {
		const {
			step: { title },
		} = args
		const match = matchGroups(
			matcher.regExp,
			matcher.schema,
			matcher.converters,
		)(title)
		if (match === null) return
		await onMatch({ ...args, match })
	},
})
