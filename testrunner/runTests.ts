import chalk from 'chalk'
import { spawn } from 'child_process'
import os from 'os'
import path from 'path'
import { findTestFiles } from './findTestFiles'
import { formatTapErrors } from './tap/formatTapErrors'

export const runTests = async (baseDir: string) => {
	const testFiles = await findTestFiles(baseDir)
	const result = await Promise.all(
		testFiles.map(
			(f) =>
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
	if (
		!result.reduce(
			(allPass, { success }) => (success === false ? false : allPass),
			true,
		)
	)
		process.exit(1)
}
