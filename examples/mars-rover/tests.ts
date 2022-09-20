import path from 'path'
import { runFolder } from '../../runner/runFolder.js'
import { RoverContext, steps } from './steps.js'

const runner = await runFolder<RoverContext>({
	folder: path.join(process.cwd(), 'examples', 'mars-rover'),
	name: 'Mars Rover',
})

runner.addStepRunners(...steps)

const res = await runner.run()

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
