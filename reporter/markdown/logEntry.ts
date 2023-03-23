import { LogLevel, type LogEntry } from '../../runner/logger.js'
import { escapeLogMessage } from './escapeLogMessage.js'

export const logEntry = (logEntry: LogEntry, isLast: boolean): string => {
	let prefix = ''
	switch (logEntry.level) {
		case LogLevel.DEBUG:
			prefix = ':zap:'
			break
		case LogLevel.ERROR:
			prefix = ':bangbang:'
			break
		case LogLevel.INFO:
			prefix = ':information_source:'
			break
		case LogLevel.PROGRESS:
			prefix = ':fast_forward:'
			break
	}

	const message = logEntry.message.map(escapeLogMessage).join(' ')

	return `  ${prefix} ${message} _@ ${logEntry.ts} ms_${isLast ? '' : '  '}`
}
