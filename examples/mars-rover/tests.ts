import { consoleReporter } from '@bdd-markdown/reporter'
import { runner } from '@bdd-markdown/runner'
import path from 'path'
import { steps } from './steps'

const res = await runner(path.join(process.cwd(), 'examples', 'mars-rover'))
	.addStepRunners(...steps)
	.run()

consoleReporter(res)

if (!res.ok) process.exit(1)
