import os from 'os'
import { TokenStream } from '../tokenStream.js'

export const sentence = (s: TokenStream): string | null => {
	const sentenceTokens = []
	while (true) {
		const char = s.char()
		if (char === os.EOL) break
		if (char === '#') break
		sentenceTokens.push(char)
		if (s.isEoF()) break
		s.next()
	}
	const sentence = sentenceTokens.join('')
	return sentence.length === 0 ? null : sentence
}
