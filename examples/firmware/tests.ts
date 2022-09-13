import { consoleReporter } from '@nordicsemiconductor/bdd-markdown/reporter'
import { runFolder } from '@nordicsemiconductor/bdd-markdown/runner'
import { readFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { FirmwareCIRunContext, steps } from './steps.js'

const runner = await runFolder<FirmwareCIRunContext>(
	path.join(process.cwd(), 'examples', 'firmware'),
)

runner.addStepRunners(...steps)

const res = await runner.run({
	appVersion: 'v1.0.0',
	deviceId: 'my-tracker',
	idScope: '0n283efa',
	deviceLog: (
		await readFile(
			path.join(process.cwd(), 'examples', 'firmware', 'device.log'),
			'utf-8',
		)
	).split(os.EOL),
})

consoleReporter(res)

if (!res.ok) process.exit(1)
