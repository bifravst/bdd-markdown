import chalk from 'chalk'
import os from 'os'
import Parser from 'tap-parser'
import { TAP, TAPChild, TAPFailure, TAPPlan } from './grammar'

const formatAssert = (failure: TAPFailure) => {
	console.error()
	console.error(`  ${chalk.red(failure.fullname)}: ${failure.name}`)
	console.error()
	if (failure.diag.error !== undefined) {
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
}

const formatFailures = (children: TAPChild[]) => {
	children
		.filter(([name]) => name === 'assert')
		.filter(([, failure]) => (failure as TAPFailure).ok === false)
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
