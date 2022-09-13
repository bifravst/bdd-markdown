import { TokenStream } from '../tokenStream.js'

export const word = (s: TokenStream): string | null => {
	const wordTokens = []
	while (true) {
		if (!/[a-z]/i.test(s.char())) break
		wordTokens.push(s.char())
		if (s.isEoF()) break
		s.next()
	}
	const word = wordTokens.join('')
	return word.length > 0 ? word : null
}
