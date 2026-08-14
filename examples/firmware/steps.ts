import assert from 'assert/strict'
import os from 'os'
import type { StepRunner, StepRunnerArgs } from '../../runner/runSuite.ts'

export type FirmwareCIRunContext = {
	appVersion: string
	deviceId: string
	idScope: string
	deviceLog: string[]
}

export const steps: StepRunner<FirmwareCIRunContext>[] = [
	{
		match: (title) =>
			/^the Firmware CI run device log should contain$/.test(title),
		run: async ({
			step,
			context: { deviceLog },
		}: StepRunnerArgs<FirmwareCIRunContext>): Promise<void> => {
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
