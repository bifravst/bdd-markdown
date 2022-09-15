export type Logger = {
	debug: (...args: string[]) => void
	info: (...args: string[]) => void
	error: (error: ErrorInfo) => void
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
	/**
	 * Time in ms from beginning of the feature run when the log message was created
	 */
	ts: number
}

export const logger = ({
	getRelativeTs,
}: {
	getRelativeTs: () => number
}): Logger & { getLogs: () => LogEntry[] } => {
	const logs: LogEntry[] = []
	return {
		debug: (...message) =>
			logs.push({
				message,
				level: LogLevel.DEBUG,
				ts: getRelativeTs(),
			}),
		progress: (...message) =>
			logs.push({
				message,
				level: LogLevel.PROGRESS,
				ts: getRelativeTs(),
			}),
		info: (...message) =>
			logs.push({
				message,
				level: LogLevel.INFO,
				ts: getRelativeTs(),
			}),
		error: (error) =>
			logs.push({
				message: [error.message],
				level: LogLevel.ERROR,
				ts: getRelativeTs(),
			}),
		getLogs: () => logs,
	}
}
