// eslint-disable-next-line no-irregular-whitespace
export const ZERO_WIDTH_SPACE = `​`

export const escapeLogMessage = (m: string): string => {
	const numBackTicks = Math.max(1, m.match(/`/g)?.length ?? 0)
	return `${'`'.repeat(
		numBackTicks,
	)}${ZERO_WIDTH_SPACE}${m}${ZERO_WIDTH_SPACE}${'`'.repeat(numBackTicks)}`
}
