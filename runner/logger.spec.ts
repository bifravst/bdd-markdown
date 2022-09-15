import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { LogEntry, logger, LogLevel } from './logger.js'

describe('logger()', () => {
	describe('should allow to log messages', () => {
		const { progress, debug, error, getLogs, info } = logger({
			getRelativeTs: () => 42,
		})
		const expected: LogEntry[] = []

		it('should allow to store debug messages', () => {
			debug(`A debug message`, `with two parts`)

			expected.push({
				level: LogLevel.DEBUG,
				ts: 42,
				message: [`A debug message`, `with two parts`],
			})
			assert.deepEqual(getLogs(), expected)
		})

		it(`should allow to store error messages`, () => {
			error({ message: `Some error` })

			expected.push({
				level: LogLevel.ERROR,
				ts: 42,
				message: [`Some error`],
			})

			assert.deepEqual(getLogs(), expected)
		})

		it(`should allow to store info messages`, () => {
			info(`An info`)

			expected.push({
				level: LogLevel.INFO,
				ts: 42,
				message: [`An info`],
			})

			assert.deepEqual(getLogs(), expected)
		})

		it(`should allow to store progress messages`, () => {
			progress(`Doing something`, `the thing`)

			expected.push({
				level: LogLevel.PROGRESS,
				ts: 42,
				message: [`Doing something`, `the thing`],
			})

			assert.deepEqual(getLogs(), expected)
		})
	})
})
