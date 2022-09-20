import { Row } from '../../parser/grammar.js'

export const inputTable = (example: Row): string[] => {
	const cellSize: number[] = []

	Object.entries(example).forEach(
		([k, v], i) => (cellSize[i] = Math.max(3, Math.max(k.length, v.length))),
	)

	return [
		toRow(Object.keys(example), cellSize),
		toRow(
			cellSize.map((len) => '-'.repeat(len)),
			cellSize,
		),
		toRow(Object.values(example), cellSize),
	]
}

const toRow = (values: string[], cellSize: number[]) =>
	`| ${values.map((s, i) => s.padEnd(cellSize[i], ' ')).join(' | ')} |`
