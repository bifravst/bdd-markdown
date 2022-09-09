import os from 'node:os'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

export const readSentence = (s: TokenStream): string | null => {
	skipWhiteSpace(s)
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
