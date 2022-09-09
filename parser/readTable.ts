import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import { Table } from './grammar'
import { readUntil } from './readUntil'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

/**
 * A table is created using a bit of ASCII art.
 *
 * Example:
 *
 * | start | eat | left |
 * | ----- | --- | ---- |
 * | 12    | 5   | 7    |
 * | 20    | 5   | 15   |
 *
 */
export const readTable = (s: TokenStream): Table | null => {
	const table: Table = []

	while (true) {
		if (s.char() !== '|') break
		// Parse header
		const header = readRow(s)
		if (header === null)
			throw new InvalidSyntaxError(s, `Failed to parse table header!`)
		// Parse header separator
		const headerSep = readRow(s)
		if (headerSep === null)
			throw new InvalidSyntaxError(s, `Failed to parse table header separator!`)
		if (headerSep.filter((col) => /^-+$/.test(col)).length !== headerSep.length)
			throw new InvalidSyntaxError(s, `Invalid table header separator.`)
		// Parse rows
		while (true) {
			const cols = readRow(s)
			if (cols === null) break
			if (cols.length !== header.length)
				throw new InvalidSyntaxError(
					s,
					`Table row column count of ${cols.length} does not match table header count of ${header.length}.`,
				)
			table.push(
				cols.reduce(
					(row, col, i) => ({
						...row,
						[header[i]]: col,
					}),
					{} as Record<string, string>,
				),
			)
		}
	}

	return Object.keys(table).length > 0 ? table : null
}

const readCol = readUntil('|')

const readRow = (s: TokenStream): string[] | null => {
	const rowTokens: string[] = []

	while (true) {
		if (s.char() !== '|') break
		s.next() // skip |
		skipWhiteSpace(s)
		const col = readCol(s)
		if (col === null) break
		rowTokens.push(col.trim())
	}
	skipWhiteSpace(s)
	return rowTokens.length > 0 ? rowTokens : null
}
