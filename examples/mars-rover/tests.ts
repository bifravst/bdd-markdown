import { consoleReporter } from '@bdd-markdown/reporter'
import { runFolder } from '@bdd-markdown/runner'
import path from 'path'
import { steps } from './steps'

const runner = await runFolder(
	path.join(process.cwd(), 'examples', 'mars-rover'),
)

runner.addStepRunners(...steps)

const res = await runner.run()

consoleReporter(res)

if (!res.ok) process.exit(1)
