export type Logger = {
	debug: (...args: any[]) => void
	info: (...args: string[]) => void
	error: (error: ErrorInfo) => void
	progress: (...args: string[]) => void
}

type ErrorInfo = {
	message: string
}

export enum LogLevel {
	DEBUG = 'debug',
	INFO = 'info',
	ERROR = 'error',
	PROGRESS = 'progress',
}

export type StepLog = {
	level: LogLevel
	message: string[]
	/**
	 * Time in ms from beginning of the feature run when the log message was created
	 */
	ts: number
}

export const stepLogger = ({
	getRelativeTs,
}: {
	getRelativeTs: () => number
}): Logger & { getLogs: () => StepLog[] } => {
	const logs: StepLog[] = []
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
