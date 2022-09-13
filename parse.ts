import chalk from 'chalk'
import { readFileSync } from 'fs'
import path from 'path'
import { feature } from './parser/feature.js'
import { tokenStream } from './parser/tokenStream.js'

const f = path.join(process.cwd(), process.argv[process.argv.length - 1])

try {
	feature(tokenStream(readFileSync(f, 'utf-8')))
	console.log(chalk.green(' OK  '), chalk.whiteBright(f))
} catch (err) {
	console.error(chalk.red(' ERR '), chalk.whiteBright(f))
	console.error(chalk.red((err as Error).message))
	process.exit(1)
}
