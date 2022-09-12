import Parser from 'tap-parser'
import { TAP, TAPComplete, TAPFailure } from './grammar'

export const complete = (
	log: string,
): { complete: TAPComplete; durationMs: number } => {
	const tap = Parser.parse(log) as TAP
	const complete = tap
		.filter(([name]) => name === 'complete')
		.map(([, result]) => result)
		.pop()

	if (complete === undefined)
		throw new Error(`Could not find complete event in ${log}`)
	return {
		complete: complete as TAPComplete,
		durationMs:
			(tap.find(([name]) => name === 'assert')?.[1] as TAPFailure | undefined)
				?.diag?.duration_ms ?? 0,
	}
}

export const summarize = (
	completes: { complete: TAPComplete; durationMs: number }[],
): {
	count: number
	pass: number
	fail: number
	durationMs: number
} =>
	completes.reduce(
		(summary, { complete, durationMs }) => ({
			count: summary.count + complete.count,
			pass: summary.pass + complete.pass,
			fail: summary.fail + complete.fail,
			durationMs: summary.durationMs + durationMs,
		}),
		{
			count: 0,
			pass: 0,
			fail: 0,
			durationMs: 0,
		},
	)
