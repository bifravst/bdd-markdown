import chalk from 'chalk'
import { RunResult } from './runner'

export const print = (result: RunResult): void => {
	console.log('')
	console.log(
		result.ok ? chalk.green('  OK  ') : chalk.red(' FAIL '),
		`${chalk.white('Test suite')}`,
	)
	console.log('')

	for (const [file, fileResult] of result.results) {
		console.log(
			fileResult.ok ? chalk.green('  OK  ') : chalk.red(' FAIL '),
			' ',
			`${chalk.white(file.name)}`,
		)
		console.log('')

		for (const [scenario, scenarioResult] of fileResult.results) {
			console.log(
				scenarioResult.ok ? chalk.green('  OK  ') : chalk.red(' FAIL '),
				' ',
				' ',
				`${chalk.white(scenario.title)}`,
			)
			console.log('')

			for (const [step, stepResult] of scenarioResult.results) {
				console.log(
					stepResult.ok ? chalk.green('  OK  ') : chalk.red(' FAIL '),
					' ',
					' ',
					' ',
					chalk.gray(step.keyword.padEnd(5, ' ')),
					`${chalk.white(step.title)}`,
				)
				for (const log of stepResult.logs) {
					console.log(chalk.gray(`             ^ ${log.message}`))
				}
			}

			console.log('')
		}
	}
}
