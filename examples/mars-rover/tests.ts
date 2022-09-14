import { consoleReporter } from '@nordicsemiconductor/bdd-markdown/reporter'
import { runFolder } from '@nordicsemiconductor/bdd-markdown/runner'
import path from 'path'
import { RoverContext, steps } from './steps.js'

const runner = await runFolder<RoverContext>(
	path.join(process.cwd(), 'examples', 'mars-rover'),
)

runner.addStepRunners(...steps)

const res = await runner.run()

consoleReporter(res)

if (!res.ok) process.exit(1)
