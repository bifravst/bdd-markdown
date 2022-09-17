import {
	LogEntry,
	LogLevel,
	StepResult,
	SuiteResult,
} from '@nordicsemiconductor/bdd-markdown/runner'
import chalk, { ChalkInstance } from 'chalk'

const errorMark = chalk.bgRedBright(' EE ')
const passMark = chalk.bgGreenBright(' OK ')

export const consoleReporter = (result: SuiteResult): void => {
	console.log('')
	formatRunResult(result)
	console.log('')
	summarizeRunResult(result)
}

const summarizeRunResult = (result: SuiteResult) => {
	const numPass = result.results.filter(([, { ok }]) => ok === true).length
	const numFail = result.results.filter(([, { ok }]) => ok !== true).length
	const allPass = numFail === 0
	console.log(
		chalk.gray(' Failed:   '),
		(allPass ? colorSuccess : colorFailure)(`${numFail}`.padStart(6, ' ')),
		chalk.gray(' Passed:   '),
		(allPass ? colorSuccess : colorFailure)(`${numPass}`.padStart(6, ' ')),
	)
	const duration = result.results.reduce(
		(total, [, result]) => total + result.duration,
		0,
	)
	console.log(
		chalk.gray(' Total:    '),
		chalk.white(`${result.results.length}`.padStart(6, ' ')),
		chalk.gray(' Duration: '),
		chalk.white(`${`${duration}`.padStart(6, ' ')} ms`),
	)
}

const formatRunResult = (result: SuiteResult) => {
	const testSuiteDuration = result.results.reduce(
		(total, [, { duration }]) => total + duration,
		0,
	)
	console.log(
		result.ok ? passMark : errorMark,
		`${chalk.white('Test suite')}`,
		formatDuration({ duration: testSuiteDuration }),
	)

	result.results.forEach(([file, featureResult], i, results) => {
		const lastFeature = i === results.length - 1
		const featureLine = lastFeature ? ' ' : '│'
		console.log(colorLine('     │ '))
		const prefix = lastFeature ? colorLine('     └─') : colorLine('     ├─')

		if (featureResult.skipped) {
			console.log(prefix, colorSkipped(file.name))
			return
		}

		console.log(prefix, chalk.white(file.name), formatDuration(featureResult))

		printLogs(featureResult.logs, colorLine(`     ${featureLine}  │  `))

		featureResult.results.forEach(([scenario, scenarioResult], i, results) => {
			const lastScenario = i === results.length - 1
			const scenarioLine = lastScenario ? ' ' : '│'
			if (scenarioResult.skipped) {
				console.log(
					colorLine(`        ${lastScenario ? '└' : '├'}─`),
					colorSkipped(scenario.title),
				)
				return
			}
			console.log(colorLine(`     ${featureLine}  │`))
			console.log(
				colorLine(`        ${lastScenario ? '└' : '├'}─`),
				chalk.white(scenario.title),
				formatDuration(scenarioResult),
			)
			if (scenario.example !== undefined) {
				console.log(
					colorLine(`     ${featureLine}  ${scenarioLine}  │ `),
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
				colorLine(`     ${featureLine}  ${scenarioLine}  │  `),
			)

			console.log(colorLine(`     ${featureLine}  ${scenarioLine}  │ `))

			scenarioResult.results.forEach(([step, stepResult], i, results) => {
				const lastStep = i === results.length - 1
				const stepLine = lastStep ? ' ' : '│'
				if (stepResult.skipped) {
					console.log(
						colorLine(
							`     ${featureLine}  ${scenarioLine}  ${lastStep ? '└─' : '├─'}`,
						),
						colorSkipped(`${step.keyword.padEnd(5, ' ')}${step.title}`),
					)
					return
				}
				console.log(
					colorLine(
						`     ${featureLine}  ${scenarioLine}  ${lastStep ? '└─' : '├─'}`,
					),
					chalk.gray(step.keyword.padEnd(5, ' ')),
					(stepResult.ok ? colorSuccess : colorFailure)(step.title),
					formatDuration(stepResult),
				)
				if (stepResult.result !== undefined) {
					console.log(
						colorLine(
							`     ${featureLine}  ${scenarioLine}  ${stepLine}        ❮`,
						),
						colorValue(printResult(stepResult)),
					)
				}

				printLogs(
					stepResult.logs,
					colorLine(
						`     ${featureLine}  ${scenarioLine}  ${stepLine}        `,
					),
				)
			})
		})
	})
}
const printResult = (result: StepResult) => {
	if (result.printable !== undefined) return result.printable
	return JSON.stringify(result.result)
}

const indent = (message: string[], color: ChalkInstance, prefix: string) => {
	console.log(prefix, ...message.map((m) => color(m)))
}

const printLogs = (logs: LogEntry[], line: string) => {
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
		indent(log.message, color, `${line}${prefix}`)
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
