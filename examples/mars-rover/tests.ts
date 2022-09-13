import { consoleReporter } from '@nordicsemiconductor/bdd-markdown/reporter'
import { runFolder } from '@nordicsemiconductor/bdd-markdown/runner'
import path from 'path'
import { steps } from './steps.js'

const runner = await runFolder(
	path.join(process.cwd(), 'examples', 'mars-rover'),
)

runner.addStepRunners(...steps)

const res = await runner.run()

consoleReporter(res)

if (!res.ok) process.exit(1)
