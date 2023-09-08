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
	ts: number
}

type LogObserverInfo = {
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
	onDebug,
	onError,
	onInfo,
	onProgress,
	now,
}: LogObserver & { now?: number }): Logger & { getLogs: () => LogEntry[] } => {
	const logs: LogEntry[] = []
	return {
		debug: (...message) => {
			logs.push({
				message,
				level: LogLevel.DEBUG,
				ts: now ?? Date.now(),
			})
			onDebug?.({ ts: now ?? Date.now(), level: LogLevel.DEBUG }, ...message)
		},
		progress: (...message) => {
			logs.push({
				message,
				level: LogLevel.PROGRESS,
				ts: now ?? Date.now(),
			})
			onProgress?.(
				{ ts: now ?? Date.now(), level: LogLevel.PROGRESS },
				...message,
			)
		},
		info: (...message) => {
			logs.push({
				message,
				level: LogLevel.INFO,
				ts: now ?? Date.now(),
			})
			onInfo?.({ ts: now ?? Date.now(), level: LogLevel.INFO }, ...message)
		},
		error: (error) => {
			logs.push({
				message: [error.message],
				level: LogLevel.ERROR,
				ts: now ?? Date.now(),
			})
			onError?.({ ts: now ?? Date.now(), level: LogLevel.ERROR }, error)
		},
		getLogs: () => logs,
	}
}
