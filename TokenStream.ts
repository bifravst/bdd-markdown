import { EndOfStreamError } from './EndOfStreamError'

export const tokenStream = (source: string, index = 0) => ({
	index: () => index,
	char: () => source[index],
	next: () => {
		if (index + 1 > source.length - 1)
			throw new EndOfStreamError({ stream: source, index })
		return source[++index]
	},
	eof: () => index + 1 >= source.length,
	source: () => source,
	clone: () => tokenStream(source, index),
})

export type TokenStream = ReturnType<typeof tokenStream>
