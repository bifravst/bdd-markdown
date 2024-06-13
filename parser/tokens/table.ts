import os from 'os'
import { InvalidSyntaxError } from '../errors/InvalidSyntaxError.js'
import { type Table } from '../grammar.js'
import { type TokenStream } from '../tokenStream.js'
import { space } from './whiteSpace.js'

const until =
	(endToken: string) =>
	(s: TokenStream): string | null => {
		const contentTokens = []
		while (true) {
			if (s.isEoF()) break
			if (s.isEoL()) break
			if (s.char() === endToken) break
			contentTokens.push(s.char())
			s.next()
			if (s.char() === endToken || s.isEoF()) break
		}
		return contentTokens.length > 0 ? contentTokens.join('') : null
	}

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
export const table = (s: TokenStream): Table | null => {
	const table: Table = []

	while (true) {
		if (s.char() !== '|') break
		// Parse header
		const header = readRow(s)
		if (header === null)
			throw new InvalidSyntaxError(s, `Failed to parse table header!`)
		// All header columns must be specified
		if (!isAllStrings(header))
			throw new InvalidSyntaxError(s, `Table header must be all strings.`)
		// Parse header separator
		const headerSep = readRow(s)
		if (headerSep === null) {
			throw new InvalidSyntaxError(s, `Failed to parse table header separator!`)
		}
		if (
			headerSep.filter((col) => /^-+$/.test(col ?? '')).length !==
			headerSep.length
		)
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
						[header[i] ?? '']: col,
					}),
					{},
				),
			)
		}
	}

	return Object.keys(table).length > 0 ? table : null
}

const isAllStrings = (arr: unknown): arr is Array<string> =>
	Array.isArray(arr) && arr.every((v) => typeof v === 'string')

const readCol = until('|')

const readRow = (s: TokenStream): (string | undefined)[] | null => {
	const rowTokens: (string | undefined)[] = []

	while (true) {
		if (s.char() !== '|') break
		s.next() // skip |
		space(s)
		const col = readCol(s)
		if (s.char() === os.EOL) {
			s.next()
			break
		}
		rowTokens.push(col === null ? undefined : col.trim())
	}
	space(s)
	return rowTokens.length > 0 ? rowTokens : null
}
