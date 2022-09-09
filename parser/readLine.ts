import { TokenStream } from './tokenStream'

export const readLine = (s: TokenStream): string | null => {
	const lineTokens = []
	while (true) {
		lineTokens.push(s.char())
		s.next()
		if (s.isEoL()) {
			if (!s.isEoF()) s.next() // skip EOL
			break
		}
	}
	return lineTokens.length > 0 ? lineTokens.join('') : null
}
