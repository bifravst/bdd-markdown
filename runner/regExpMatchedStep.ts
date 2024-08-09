import { type Static, type TObject } from '@sinclair/typebox'
import { matchGroups } from './matchGroups.js'
import type { StepRunner, StepRunnerArgs } from './runSuite.js'

export const regExpMatcher =
	(matcher: ReturnType<typeof matchGroups>) =>
	(title: string): boolean =>
		matcher(title) !== null

export const regExpMatchedStep = <
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
