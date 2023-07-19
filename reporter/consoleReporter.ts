import chalk from 'chalk'
import os from 'os'
import { LogLevel, type LogEntry } from '../runner/logger.js'
import type { StepResult } from '../runner/runStep.js'
import type { SuiteResult } from '../runner/runSuite.js'
import { toString } from './toString.js'

const errorMark = chalk.bgRedBright.bold(' EE ')
const passMark = chalk.bgGreenBright.bold.rgb(0, 0, 0)(' OK ')

export const consoleReporter = (
	result: SuiteResult,
	print: (...args: string[]) => void,
	options?: RunResultFormatterOptions & PrintLogsOptions,
): void => {
	print('')
	formatRunResult(result, print, options)
	print('')
	summarizeRunResult(result, print)
}

const summarizeRunResult = (
	result: SuiteResult,
	print: (...args: string[]) => void,
) => {
	const numPass = result.results.filter(([, { ok }]) => ok === true).length
	const numFail = result.results.filter(([, { ok }]) => ok !== true).length
	const allPass = numFail === 0
	print(
		chalk.gray(' Failed:   '),
		(allPass ? colorSuccess : colorFailure)(`${numFail}`.padStart(6, ' ')),
		chalk.gray(' Passed:   '),
		(allPass ? colorSuccess : colorFailure)(`${numPass}`.padStart(6, ' ')),
	)
	const duration = result.results.reduce(
		(total, [, result]) => total + result.duration,
		0,
	)
	print(
		chalk.gray(' Total:    '),
		chalk.white(`${result.results.length}`.padStart(6, ' ')),
		chalk.gray(' Duration: '),
		chalk.white(`${`${duration}`.padStart(6, ' ')} ms`),
	)
}
type RunResultFormatterOptions = {
	// Only print failed scenarios
	onlyFailed?: boolean
}
const formatRunResult = (
	result: SuiteResult,
	print: (...args: string[]) => void,
	options?: RunResultFormatterOptions & PrintLogsOptions,
) => {
	const testSuiteDuration = result.results.reduce(
		(total, [, { duration }]) => total + duration,
		0,
	)
	print(
		'',
		result.ok ? passMark : errorMark,
		`${chalk.white(result.name)}`,
		formatDuration({ duration: testSuiteDuration }),
	)

	result.results.forEach(([file, featureResult], i, results) => {
		const lastFeature = i === results.length - 1
		const featureLine = lastFeature ? ' ' : '│'
		print(colorLine(' │ '))
		const prefix = lastFeature ? colorLine(' └─') : colorLine(' ├─')

		if (featureResult.skipped) {
			print(prefix, colorSkipped(file.name))
			return
		}

		if (options?.onlyFailed === true && featureResult.ok) {
			print(
				prefix,
				featureResult.ok ? passMark : errorMark,
				(featureResult.ok ? chalk.greenBright : chalk.redBright)(file.name),
				formatDuration(featureResult),
			)
			return
		}

		print(
			prefix,
			featureResult.ok ? passMark : errorMark,
			(featureResult.ok ? chalk.greenBright : chalk.redBright)(file.name),
			formatDuration(featureResult),
		)

		printLogs(
			featureResult.logs,
			colorLine(` ${featureLine}  │   `),
			print,
			options,
		)

		featureResult.results.forEach(([scenario, scenarioResult], i, results) => {
			const lastScenario = i === results.length - 1
			const scenarioLine = lastScenario ? ' ' : '│'
			if (scenarioResult.skipped) {
				print(
					colorLine(` ${featureLine}  ${lastScenario ? '└' : '├'}─`),
					colorSkipped(scenario.title),
				)
				return
			}
			print(colorLine(` ${featureLine}  │`))
			print(
				colorLine(` ${featureLine}  ${lastScenario ? '└' : '├'}─`),
				scenarioResult.ok ? passMark : errorMark,
				(scenarioResult.ok ? chalk.greenBright : chalk.redBright)(
					scenario.title,
				),
				formatDuration(scenarioResult),
			)
			if (scenario.example !== undefined) {
				print(
					colorLine(` ${featureLine}  ${scenarioLine}  │ `),
					colorComment('⌘'),
					Object.entries(scenario.example)
						.map(
							([k, v]) => `${colorKey(k)} ${colorToken('=')} ${colorValue(v)}`,
						)
						.join(colorToken(', ')),
				)
			}

			printLogs(
				scenarioResult.logs,
				colorLine(` ${featureLine}  ${scenarioLine}  │  `),
				print,
				options,
			)

			print(colorLine(` ${featureLine}  ${scenarioLine}  │ `))

			scenarioResult.results.forEach(([step, stepResult], i, results) => {
				const lastStep = i === results.length - 1
				const stepLine = lastStep ? ' ' : '│'
				if (stepResult.skipped) {
					print(
						colorLine(
							` ${featureLine}  ${scenarioLine}  ${lastStep ? '└─' : '├─'}`,
						),
						colorSkipped(`${step.keyword.padEnd(5, ' ')}`),
						stepResult.executed.title,
					)
					return
				}
				print(
					colorLine(
						` ${featureLine}  ${scenarioLine}  ${lastStep ? '└─' : '├─'}`,
					),
					chalk.gray(step.keyword.padEnd(5, ' ')),
					(stepResult.ok ? colorSuccess : colorFailure)(
						stepResult.executed.title,
					),
					formatDuration(stepResult),
				)
				if (stepResult.executed.codeBlock !== undefined) {
					stepResult.executed.codeBlock.code
						.split(os.EOL)
						.forEach((line, i, lines) =>
							print(
								colorLine(
									` ${featureLine}  ${scenarioLine}  ${stepLine}       `,
								),
								i === 0
									? colorCode('❯')
									: i === lines.length - 1
									? colorCode('└')
									: colorCode('│'),
								colorCode(line),
							),
						)
				}
				if (stepResult.result !== undefined) {
					printResult(stepResult)
						.split(os.EOL)
						.forEach((line, i, lines) =>
							print(
								colorLine(
									` ${featureLine}  ${scenarioLine}  ${stepLine}       `,
								),
								i === 0
									? colorValue('❮')
									: i === lines.length - 1
									? colorValue('└')
									: colorValue('│'),
								colorValue(line),
							),
						)
				}

				printLogs(
					stepResult.logs,
					colorLine(` ${featureLine}  ${scenarioLine}  ${stepLine}        `),
					print,
					options,
				)
			})
		})
	})
}
const printResult = (result: StepResult) => {
	if (result.printable !== undefined) return result.printable
	return JSON.stringify(result.result)
}

type PrintLogsOptions = { withTimestamps?: boolean }

const printLogs = (
	logs: LogEntry[],
	line: string,
	print: (...args: string[]) => void,
	options?: PrintLogsOptions,
) => {
	for (const log of logs) {
		let color = chalk.gray
		let prefix = ' '
		switch (log.level) {
			case LogLevel.INFO:
				color = chalk.yellow
				prefix = color(`🛈`)
				break
			case LogLevel.DEBUG:
				color = chalk.magentaBright
				prefix = color(`🗲`)
				break
			case LogLevel.ERROR:
				color = chalk.redBright
				prefix = color(`⚠️`)
				break
			case LogLevel.PROGRESS:
				color = chalk.blue.dim
				prefix = color('»')
				break
		}

		if (options?.withTimestamps === true) {
			const timeInfo = colorTime(`⏲ ${log.ts.toString()} ms`)
			print(`${line}${prefix}`, timeInfo)
		}

		for (const message of log.message) {
			const lines = toString(message).trim().split(os.EOL)
			lines.forEach((m, i, messages) =>
				print(
					`${line}${
						i === 0
							? prefix
							: i === messages.length - 1
							? color('└')
							: color('│')
					}`,
					color(m),
				),
			)
		}
	}
}

const formatDuration = ({ duration }: { duration: number }) =>
	colorTime(` ⏲  ${duration} ms`)

const colorKey = chalk.cyan
const colorValue = chalk.magenta
const colorToken = chalk.gray
const colorComment = chalk.gray
const colorTime = chalk.blue.dim
const colorLine = chalk.blue
const colorSuccess = chalk.green
const colorFailure = chalk.red
const colorSkipped = chalk.gray.strikethrough
const colorCode = chalk.cyanBright
