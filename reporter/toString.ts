/**
 * Takes an unknown value and tries to turn it into a string for printing.
 */
export const toString = (v: unknown): string => {
	if (v === undefined) return 'undefined'
	if (typeof v === 'string') return v
	try {
		return JSON.stringify(v)
	} catch {
		return '???'
	}
}
