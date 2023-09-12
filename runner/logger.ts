import type { Step } from '../parser/grammar.js'

export type Logger = {
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
	 * Returns the step this logger is for.
	 */
	step: Step
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
	step: Step
	level: LogLevel
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

export const logger = ({
	step,
	onDebug,
	onError,
	onInfo,
	onProgress,
	now,
}: {
	/**
	 * The step the logs of this logger are coming from
	 */
	step: Step
} & LogObserver & { now?: number }): Logger & { getLogs: () => LogEntry[] } => {
	const logs: LogEntry[] = []
	return {
		debug: (...message) => {
			logs.push({
				message,
				level: LogLevel.DEBUG,
				ts: now ?? Date.now(),
			})
			onDebug?.(
				{ step, ts: now ?? Date.now(), level: LogLevel.DEBUG },
				...message,
			)
		},
		progress: (...message) => {
			logs.push({
				message,
				level: LogLevel.PROGRESS,
				ts: now ?? Date.now(),
			})
			onProgress?.(
				{ step, ts: now ?? Date.now(), level: LogLevel.PROGRESS },
				...message,
			)
		},
		info: (...message) => {
			logs.push({
				message,
				level: LogLevel.INFO,
				ts: now ?? Date.now(),
			})
			onInfo?.(
				{ step, ts: now ?? Date.now(), level: LogLevel.INFO },
				...message,
			)
		},
		error: (error) => {
			logs.push({
				message: [error.message],
				level: LogLevel.ERROR,
				ts: now ?? Date.now(),
			})
			onError?.({ step, ts: now ?? Date.now(), level: LogLevel.ERROR }, error)
		},
		getLogs: () => logs,
		step,
	}
}
