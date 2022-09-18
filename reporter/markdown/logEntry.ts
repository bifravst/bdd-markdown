import { LogEntry, LogLevel } from '@nordicsemiconductor/bdd-markdown'

// eslint-disable-next-line no-irregular-whitespace
export const ZERO_WIDTH_SPACE = `​`

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

	const logmsg = logEntry.message
		.map((m) => {
			const numBackTicks = Math.max(1, m.match(/`/g)?.length ?? 0)
			return `${'`'.repeat(
				numBackTicks,
			)}${ZERO_WIDTH_SPACE}${m}${ZERO_WIDTH_SPACE}${'`'.repeat(numBackTicks)}`
		})
		.join(' ')

	return `  ${prefix} ${logmsg} _@ ${logEntry.ts} ms_${isLast ? '' : '  '}`
}
