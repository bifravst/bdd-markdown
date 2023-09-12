import assert from 'assert/strict'
import { describe, it } from 'node:test'
import type { Step } from '../parser/grammar.js'
import { LogLevel, logger, type LogEntry } from './logger.js'

describe('logger()', () => {
	describe('should allow to log messages', () => {
		const now = Date.now()
		const stepForLog = {} as Step
		const { progress, debug, error, getLogs, info, step } = logger({
			step: stepForLog,
			now,
		})
		const expected: LogEntry[] = []

		it('should allow to store debug messages', () => {
			debug(`A debug message`, `with two parts`)

			expected.push({
				level: LogLevel.DEBUG,
				ts: now,
				message: [`A debug message`, `with two parts`],
			})
			assert.deepEqual(getLogs(), expected)
		})

		it(`should allow to store error messages`, () => {
			error({ message: `Some error` })

			expected.push({
				level: LogLevel.ERROR,
				ts: now,
				message: [`Some error`],
			})

			assert.deepEqual(getLogs(), expected)
		})

		it(`should allow to store info messages`, () => {
			info(`An info`)

			expected.push({
				level: LogLevel.INFO,
				ts: now,
				message: [`An info`],
			})

			assert.deepEqual(getLogs(), expected)
		})

		it(`should allow to store progress messages`, () => {
			progress(`Doing something`, `the thing`)

			expected.push({
				level: LogLevel.PROGRESS,
				ts: now,
				message: [`Doing something`, `the thing`],
			})

			assert.deepEqual(getLogs(), expected)
		})

		describe('step provides the source of the log', () => {
			it('should provide the step', () => assert.equal(step, stepForLog))
		})
	})

	describe('listening to logs', () => {
		it('should call log listeners', () => {
			const debugLogs: any[] = []
			const infoLogs: any[] = []
			const progressLogs: any[] = []
			const errorLogs: any[] = []
			const now = Date.now()
			const step = {} as Step
			const l = logger({
				step,
				onDebug: (...args) => debugLogs.push(args),
				onInfo: (...args) => infoLogs.push(args),
				onProgress: (...args) => progressLogs.push(args),
				onError: (...args) => errorLogs.push(args),
				now,
			})

			l.debug('foo', 'bar')
			assert.deepEqual(debugLogs, [
				[{ step, ts: now, level: LogLevel.DEBUG }, 'foo', 'bar'],
			])

			l.info('bar', 'foo')
			assert.deepEqual(infoLogs, [
				[{ step, ts: now, level: LogLevel.INFO }, 'bar', 'foo'],
			])

			l.progress('progress', 'foo')
			assert.deepEqual(progressLogs, [
				[{ step, ts: now, level: LogLevel.PROGRESS }, 'progress', 'foo'],
			])

			const e = new Error()
			l.error(e)
			assert.deepEqual(errorLogs, [
				[{ step, ts: now, level: LogLevel.ERROR }, e],
			])
		})
	})
})
