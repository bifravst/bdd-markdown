import chalk from 'chalk'
import { spawn } from 'child_process'
import os from 'os'
import path from 'path'
import { findFilesInFolder } from '../runner/findTestFiles.js'
import { formatTapErrors } from './tap/formatTapErrors.js'
import { complete, summarize } from './tap/summary.js'

export const runTests = async (baseDir: string): Promise<void> => {
	const testFiles = await findFilesInFolder(baseDir, '.spec.ts')
	const result = await Promise.all(
		testFiles.map(
			async (f) =>
				new Promise<{
					success: boolean
					log: string
					err: string
					file: string
				}>((resolve) => {
					const run = spawn('npx', ['tsx', f], {})
					const log: string[] = []
					const err: string[] = []
					run.stdout.on('data', (data) => log.push(data))
					run.stderr.on('data', (data) => err.push(data))
					run.on('exit', (code) => {
						resolve({
							success: code === 0,
							err: err.join(os.EOL),
							log: log.join(os.EOL),
							file: f,
						})
					})
				}),
		),
	)
	result.map(({ log, success, file }) => {
		if (success) {
			console.log(
				chalk.greenBright('  OK  '),
				chalk.whiteBright(file.replace(baseDir + path.sep, '')),
			)
		} else {
			console.log(
				chalk.redBright(' FAIL '),
				chalk.whiteBright(file.replace(baseDir + path.sep, '')),
			)
			formatTapErrors(log)
		}
	})

	const summary = summarize(result.map(({ log }) => complete(log)))
	const pad = (n: number) => `${n}`.padStart(5, ' ')
	console.log()
	console.log(
		chalk.grey(` Failed:   `),
		(summary.fail !== 0 ? chalk.redBright : chalk.green)(pad(summary.fail)),
		chalk.grey(` Passed:   `),
		(summary.fail !== 0 ? chalk.yellow : chalk.greenBright)(pad(summary.pass)),
	)
	console.log(
		chalk.grey(` Total:    `),
		chalk.white(pad(summary.count)),
		chalk.grey(` Duration: `),
		chalk.white(`${pad(Math.round(summary.durationMs))} ms`),
	)
	console.log()

	if (
		!result.reduce(
			(allPass, { success }) => (success === false ? false : allPass),
			true,
		)
	)
		process.exit(1)
}
