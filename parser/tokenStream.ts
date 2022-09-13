import os from 'os'
import { EndOfStreamError } from './errors/EndOfStreamError.js'

export const tokenStream = (source: string, index = 0): TokenStream => {
	const isEoF = () => index + 1 > source.length
	return {
		index: () => index,
		char: () => source[index] ?? os.EOL,
		next: () => {
			if (index + 1 > source.length)
				throw new EndOfStreamError({ stream: source, index })
			return source[++index] ?? os.EOL
		},
		peekNext: () => source[index + 1] ?? os.EOL,
		isEoF,
		isEoL: () => isEoF() || source[index] === os.EOL,
		source: () => source,
		go: (i: number) => {
			if (i < 0) throw new Error(`Index must be 0 or greater.`)
			if (i + 1 > source.length)
				throw new Error(`Index must not be beyond stream size.`)
			index = i
		},
	}
}

export type TokenStream = {
	index: () => number
	char: () => string
	next: () => string
	peekNext: () => string
	isEoF: () => boolean
	isEoL: () => boolean
	source: () => string
	go: (index: number) => void
}
