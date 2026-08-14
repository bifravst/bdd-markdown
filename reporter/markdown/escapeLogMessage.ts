import { toString } from '../toString.ts'

// eslint-disable-next-line no-irregular-whitespace
export const ZERO_WIDTH_SPACE = `​`

export const escapeLogMessage = (m: string): string => {
	const messageString = toString(m)
	const numBackTicks = Math.max(1, messageString.match(/`/g)?.length ?? 0)
	return `${'`'.repeat(
		numBackTicks,
	)}${ZERO_WIDTH_SPACE}${messageString}${ZERO_WIDTH_SPACE}${'`'.repeat(
		numBackTicks,
	)}`
}
