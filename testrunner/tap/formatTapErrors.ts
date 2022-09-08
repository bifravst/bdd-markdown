import chalk from 'chalk'
import os from 'os'
import Parser from 'tap-parser'

enum TAPType {
	comment = 'comment',
	assert = 'assert',
	plan = 'plan',
	complete = 'complete',
	version = 'version',
	child = 'child',
}

type TAPPlan = {
	start: number
	end: number
	skipAll: boolean
	skipReason: string
	comment: string
}
type TAPFailure = {
	ok: boolean
	id: number
	name: string
	diag: {
		duration_ms: number
		failureType: string
		error: string
		code: string
		stack: string
	}
	fullname: string
}

type TAPComplete = {
	ok: boolean
	count: number
	pass: number
	fail: number
	bailout: boolean
	todo: number
	skip: number
	plan: TAPPlan
	failures: TAPFailure
	time: number
}

type TAPChild =
	| [TAPType.assert, TAPFailure]
	| [TAPType.comment, string]
	| [TAPType.complete, TAPComplete]

type TAP = (
	| [TAPType.version, number]
	| [TAPType.plan, TAPPlan]
	| [TAPType.assert, TAPFailure]
	| [TAPType.comment, string]
	| [TAPType.complete, TAPComplete]
	| [TAPType.child, TAPChild[]]
)[]

const formatAssert = (failure: TAPFailure) => {
	console.error()
	console.error(`  ${chalk.red(failure.fullname)}: ${failure.name}`)
	console.error()
	console.error(
		chalk.white(
			failure.diag.error
				.split(os.EOL)
				.map((s) =>
					/\+\s+\w+\s+-\s+\w/.test(s)
						? s
								.replace(/\+\s+\w+/, (text) => chalk.red(text))
								.replace(/-\s+\w+/, (text) => chalk.green(text))
						: s,
				)
				.map((s) => (s.startsWith('+') ? chalk.red(s) : s))
				.map((s) => (s.startsWith('-') ? chalk.green(s) : s))
				.map((s) => `    ${s}`)
				.join(os.EOL),
		),
	)
	console.error()
}

const formatFailures = (children: TAPChild[]) => {
	children
		.filter(([name]) => name === 'assert')
		.map(([, failure]) => formatAssert(failure as TAPFailure))
}

const formatPlan = (plan: TAPPlan) => {
	if (plan.start !== plan.end && plan.comment !== undefined)
		console.error(`  ${chalk.red(plan.comment)}`)
}

export const formatTapErrors = (log: string): void => {
	const tap = Parser.parse(log) as TAP
	tap
		.filter(([name]) => name === 'child')
		.map(([, child]) => formatFailures(child as TAPChild[]))

	tap
		.filter(([name]) => name === 'plan')
		.map(([, plan]) => formatPlan(plan as TAPPlan))
}
