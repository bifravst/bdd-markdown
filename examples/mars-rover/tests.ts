import chalk from 'chalk'
import path from 'path'
import { runFolder } from '../../runner/runFolder.js'
import { RoverContext, steps } from './steps.js'

const runner = await runFolder<RoverContext>({
	folder: path.join(process.cwd(), 'examples', 'mars-rover'),
	name: 'Mars Rover',
	logObserver: {
		onProgress: ({ ts }, ...progress) =>
			console.error(
				chalk.gray(`»`),
				chalk.cyan(`@${ts}`),
				...progress.map((s) => chalk.yellow(s)),
			),
	},
})

runner.addStepRunners(...steps)

const res = await runner.run()

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
