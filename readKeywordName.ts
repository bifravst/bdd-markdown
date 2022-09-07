import { TokenStream } from './TokenStream'

export const readKeywordName = (s: TokenStream): string | null => {
	let keywordTokens = []
	while (true) {
		const char = s.char()
		if (!/[a-z]/i.test(char)) break
		keywordTokens.push(char)
		s.next()
	}
	if (s.char() !== ':') return null
	s.next() // Skip colon
	return keywordTokens.join('')
}
