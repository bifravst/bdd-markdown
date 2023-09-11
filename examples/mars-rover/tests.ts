import chalk from 'chalk'
import path from 'path'
import { runFolder } from '../../runner/runFolder.js'
import { steps, type RoverContext } from './steps.js'

const start = Date.now()
const runner = await runFolder<RoverContext>({
	folder: path.join(process.cwd(), 'examples', 'mars-rover'),
	name: 'Mars Rover',
	logObserver: {
		onProgress: ({ ts }, ...progress) =>
			console.error(
				chalk.gray(`»`),
				chalk.cyan(`@${ts - start}`),
				...progress.map((s) => chalk.yellow(s)),
			),
		onError: ({ ts }, error) =>
			console.error(
				chalk.gray(`‼️`),
				chalk.red(`@${ts - start}`),
				chalk.red(error.message),
			),
	},
})

runner.addStepRunners(...steps)

const res = await runner.run()

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
