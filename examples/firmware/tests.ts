import { readFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { runFolder } from '../../runner/runFolder.js'
import { FirmwareCIRunContext, steps } from './steps.js'

const runner = await runFolder<FirmwareCIRunContext>({
	name: 'Firmware',
	folder: path.join(process.cwd(), 'examples', 'firmware'),
})

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

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
