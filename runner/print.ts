import chalk, { ChalkInstance } from 'chalk'
import os from 'os'
import { LogLevel, RunResult, StepResult } from './runner'

const errorMark = chalk.bgRedBright(' EE ')
const passMark = chalk.bgGreenBright(' OK ')

export const print = (result: RunResult): void => {
	console.log('')
	console.log(result.ok ? passMark : errorMark, `${chalk.white('Test suite')}`)

	result.results.forEach(([file, fileResult], i, results) => {
		const lastFeature = i === results.length - 1
		const featureLine = lastFeature ? ' ' : '│'
		console.log(colorLine('     │ '))
		if (lastFeature) {
			console.log(colorLine('     └─'), chalk.white(file.name))
		} else {
			console.log(colorLine('     ├─'), chalk.white(file.name))
		}

		fileResult.results.forEach(([scenario, scenarioResult], i, results) => {
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
			)
			if (scenario.example !== undefined) {
				console.log(
					colorLine(`     ${featureLine}  ${scenarioLine}  │ `),
					colorComment('Example:'),
				)
				console.log(
					colorLine(`     ${featureLine}  ${scenarioLine}  │  ❯`),
					Object.entries(scenario.example)
						.map(
							([k, v]) => `${colorKey(k)} ${colorToken('=')} ${colorValue(v)}`,
						)
						.join(', '),
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
				)
				if (stepResult.result !== undefined) {
					console.log(
						colorLine(`     ${featureLine}  ${scenarioLine}  ${stepLine}  ❮`),
						colorValue(printResult(stepResult)),
					)
				}

				for (const log of stepResult.logs) {
					let color = chalk.gray
					const line = colorLine(
						`     ${featureLine}  ${scenarioLine}  ${stepLine}  `,
					)
					let prefix = '    '
					switch (log.level) {
						case LogLevel.DEBUG:
							color = chalk.cyan
							break
						case LogLevel.ERROR:
							color = chalk.redBright
							prefix = chalk.red(` ⚠️ `)
							break
						case LogLevel.PROGRESS:
							chalk.magenta
							break
					}
					indent(log.message, color, `${line}${prefix}`)
				}
			})
		})
	})
}

const printResult = (result: StepResult) => {
	if (result.printable !== undefined) return result.printable
	return JSON.stringify(result.result)
}

const indent = (message: string[], color: ChalkInstance, prefix: string) => {
	for (const m of message) {
		for (const sm of m.split(os.EOL).filter((s) => s.length > 0))
			console.log(prefix, color(sm))
	}
}

const colorKeyword = chalk.yellow
const colorKey = chalk.cyan
const colorValue = chalk.magenta
const colorToken = chalk.gray
const colorComment = chalk.gray
const colorLine = chalk.blue
const colorSuccess = chalk.green
const colorFailure = chalk.red
