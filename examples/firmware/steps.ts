import assert from 'assert/strict'
import os from 'os'
import type { StepRunner } from '../../runner/runSuite.js'

export type FirmwareCIRunContext = {
	appVersion: string
	deviceId: string
	idScope: string
	deviceLog: string[]
}

export const steps: StepRunner<FirmwareCIRunContext>[] = [
	<StepRunner<FirmwareCIRunContext>>{
		match: (title) =>
			/^the Firmware CI run device log should contain$/.test(title),
		run: async ({ step, context: { deviceLog } }) => {
			const shouldContain = step.codeBlock?.code.split(os.EOL) ?? []
			if (shouldContain.length === 0)
				throw new Error(`Must provide content to match against!`)

			for (const line of shouldContain) {
				try {
					assert.equal(
						deviceLog.find((s) => s.includes(line)) !== undefined,
						true,
					)
				} catch {
					throw new Error(`Device log does not contain "${line}"!`)
				}
			}
		},
	},
]
