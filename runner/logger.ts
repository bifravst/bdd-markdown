import type { Feature, Scenario, Step } from '../parser/grammar.js'

export type Logger<Context extends Feature | Scenario | Step> = {
	/**
	 * Logs a debug message
	 */
	debug: (...args: string[]) => void
	/**
	 * Logs a info message
	 */
	info: (...args: string[]) => void
	/**
	 * Logs a error message
	 */
	error: (error: ErrorInfo) => void
	/**
	 * Logs a progress message
	 */
	progress: (...args: string[]) => void
	/**
	 * Returns the context of the logger.
	 */
	context: Context
}

type ErrorInfo = {
	message: string
	detail?: any
}

export enum LogLevel {
	DEBUG = 'debug',
	INFO = 'info',
	ERROR = 'error',
	PROGRESS = 'progress',
}

export type LogEntry = {
	level: LogLevel
	message: string[]
	/**
	 * Time in ms from beginning of the feature run when the log message was created
	 */
	ts: number
}

type LogObserverInfo = {
	context: Feature | Scenario | Step
	level: LogLevel
	/**
	 * Time in ms from beginning of the feature run when the log message was created
	 */
	ts: number
}

export type LogObserver = {
	/**
	 * Register a listener that receives debug logs
	 */
	onDebug?: (info: LogObserverInfo, ...args: string[]) => unknown
	/**
	 * Register a listener that receives info logs
	 */
	onInfo?: (info: LogObserverInfo, ...args: string[]) => unknown
	/**
	 * Register a listener that receives error logs
	 */
	onError?: (info: LogObserverInfo, error: ErrorInfo) => unknown
	/**
	 * Register a listener that receives progress logs
	 */
	onProgress?: (info: LogObserverInfo, ...args: string[]) => unknown
}

export const logger = <Context extends Feature | Scenario | Step>({
	context,
	getRelativeTs,
	onDebug,
	onError,
	onInfo,
	onProgress,
}: {
	/**
	 * The context the logs of this logger are coming from
	 */
	context: Context
	/**
	 * Returns the number of milliseconds that have elapse since the "start" of the test run.
	 */
	getRelativeTs: () => number
} & LogObserver): Logger<Context> & { getLogs: () => LogEntry[] } => {
	const logs: LogEntry[] = []
	const ts = getRelativeTs()
	return {
		debug: (...message) => {
			logs.push({
				message,
				level: LogLevel.DEBUG,
				ts,
			})
			onDebug?.({ context, ts, level: LogLevel.DEBUG }, ...message)
		},
		progress: (...message) => {
			logs.push({
				message,
				level: LogLevel.PROGRESS,
				ts,
			})
			onProgress?.({ context, ts, level: LogLevel.PROGRESS }, ...message)
		},
		info: (...message) => {
			logs.push({
				message,
				level: LogLevel.INFO,
				ts,
			})
			onInfo?.({ context, ts, level: LogLevel.INFO }, ...message)
		},
		error: (error) => {
			logs.push({
				message: [error.message],
				level: LogLevel.ERROR,
				ts,
			})
			onError?.({ context, ts, level: LogLevel.ERROR }, error)
		},
		getLogs: () => logs,
		context,
	}
}
