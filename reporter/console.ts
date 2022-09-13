import {
	LogLevel,
	StepResult,
	SuiteResult,
} from '@nordicsemiconductor/bdd-markdown/runner'
import chalk, { ChalkInstance } from 'chalk'
import os from 'os'

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
		if (lastFeature) {
			console.log(
				colorLine('     └─'),
				chalk.white(file.name),
				formatDuration(featureResult),
			)
		} else {
			console.log(
				colorLine('     ├─'),
				chalk.white(file.name),
				formatDuration(featureResult),
			)
		}

		featureResult.results.forEach(([scenario, scenarioResult], i, results) => {
			const lastScenario = i === results.length - 1
			const scenarioLine = lastScenario ? ' ' : '│'
			if (scenarioResult.skipped) {
				console.log(
					colorLine(`        ${lastScenario ? '└' : '├'}─`),
					chalk.gray.strikethrough(scenario.title),
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
					colorLine(`     ${featureLine}  ${scenarioLine}  │       `),
					colorComment('⌘'),
					Object.entries(scenario.example)
						.map(
							([k, v]) => `${colorKey(k)} ${colorToken('=')} ${colorValue(v)}`,
						)
						.join(colorToken(', ')),
				)
			}

			scenarioResult.results.forEach(([step, stepResult], i, results) => {
				const lastStep = i === results.length - 1
				const stepLine = lastStep ? ' ' : '│'
				if (stepResult.skipped) {
					console.log(
						colorLine(
							`     ${featureLine}  ${scenarioLine}  ${lastStep ? '└─' : '├─'}`,
						),
						chalk.gray.strikethrough(
							`${step.keyword.padEnd(5, ' ')}${step.title}`,
						),
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

				for (const log of stepResult.logs) {
					let color = chalk.gray
					const line = colorLine(
						`     ${featureLine}  ${scenarioLine}  ${stepLine}   `,
					)
					let prefix = '    '
					switch (log.level) {
						case LogLevel.DEBUG:
							color = chalk.blue
							prefix = color(`    🛈 `)
							break
						case LogLevel.ERROR:
							color = chalk.redBright
							prefix = color(`     ⚠️`)
							break
						case LogLevel.PROGRESS:
							color = chalk.blueBright
							prefix = color('     »')
							break
					}
					indent(log.message, log.ts, color, `${line}${prefix}`)
				}
			})
		})
	})
}
const printResult = (result: StepResult) => {
	if (result.printable !== undefined) return result.printable
	return JSON.stringify(result.result)
}

const indent = (
	message: string[],
	time: number,
	color: ChalkInstance,
	prefix: string,
) => {
	for (const m of message) {
		for (const sm of m.split(os.EOL).filter((s) => s.length > 0))
			console.log(prefix, colorTime(`[${time} ms]`), color(sm))
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
