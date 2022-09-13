import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { LogLevel, StepLog, stepLogger } from './stepLogger'

describe('stepLogger()', () => {
	describe('should allow to log messages', () => {
		const logger = stepLogger({ getRelativeTs: () => 42 })
		const expected: StepLog[] = []

		it('should allow to store debug messages', () => {
			logger.debug(`A debug message`, `with two parts`)

			expected.push({
				level: LogLevel.DEBUG,
				message: [`A debug message`, `with two parts`],
				ts: 42,
			})
			assert.deepEqual(logger.getLogs(), expected)
		})

		it(`should allow to store error messages`, () => {
			logger.error({ message: `Some error` })

			expected.push({
				level: LogLevel.ERROR,
				ts: 42,
				message: [`Some error`],
			})

			assert.deepEqual(logger.getLogs(), expected)
		})

		it(`should allow to store info messages`, () => {
			logger.info(`An info`)

			expected.push({
				level: LogLevel.INFO,
				ts: 42,
				message: [`An info`],
			})

			assert.deepEqual(logger.getLogs(), expected)
		})

		it(`should allow to store progress messages`, () => {
			logger.progress(`Doing something`, `the thing`)

			expected.push({
				level: LogLevel.PROGRESS,
				ts: 42,
				message: [`Doing something`, `the thing`],
			})

			assert.deepEqual(logger.getLogs(), expected)
		})
	})
})
