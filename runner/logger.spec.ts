import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { Step } from '../parser/grammar.js'
import { LogEntry, logger, LogLevel } from './logger.js'

describe('logger()', () => {
	describe('should allow to log messages', () => {
		const step = {} as Step
		const { progress, debug, error, getLogs, info, context } = logger({
			context: step ,
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

		describe('context provides the source of the log', () => {
			it('should provide the context', () => assert.equal(context, step))
		})
	})

	describe('listening to logs', () => {
		it('should call log listeners', () => {
			const debugLogs: any[] = []
			const infoLogs: any[] = []
			const progressLogs: any[] = []
			const errorLogs: any[] = []
			const step = {} as Step
			const l = logger({
				context: step,
				getRelativeTs: () => 42,
				onDebug: (...args) => debugLogs.push(args),
				onInfo: (...args) => infoLogs.push(args),
				onProgress: (...args) => progressLogs.push(args),
				onError: (...args) => errorLogs.push(args),
			})

			l.debug('foo', 'bar')
			assert.deepEqual(debugLogs, [
				[{ context: step, ts: 42, level: LogLevel.DEBUG }, 'foo', 'bar'],
			])

			l.info('bar', 'foo')
			assert.deepEqual(infoLogs, [
				[{ context: step, ts: 42, level: LogLevel.INFO }, 'bar', 'foo'],
			])

			l.progress('progress', 'foo')
			assert.deepEqual(progressLogs, [
				[
					{ context: step, ts: 42, level: LogLevel.PROGRESS },
					'progress',
					'foo',
				],
			])

			const e = new Error()
			l.error(e)
			assert.deepEqual(errorLogs, [
				[{ context: step, ts: 42, level: LogLevel.ERROR }, e],
			])
		})
	})
})
