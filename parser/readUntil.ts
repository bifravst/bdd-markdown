import { TokenStream } from './tokenStream'

export const readUntil =
	(endToken: string) =>
	(s: TokenStream): string | null => {
		const contentTokens = []
		while (true) {
			if (s.isEoF()) break
			if (s.char() === endToken) break
			contentTokens.push(s.char())
			s.next()
			if (s.char() === endToken || s.isEoF()) break
		}
		return contentTokens.length > 0 ? contentTokens.join('') : null
	}
