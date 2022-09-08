import os from 'node:os'
import { TokenStream } from '../tokenStream'
import { skipWhiteSpace } from './skipWhiteSpace'

export const readSentence = (s: TokenStream) => {
	skipWhiteSpace(s)
	const sentenceTokens = []
	while (true) {
		const char = s.char()
		if (char === os.EOL) break
		if (char === '#') break
		sentenceTokens.push(char)
		if (s.eof()) break
		s.next()
	}
	const sentence = sentenceTokens.join('')
	return sentence.length === 0 ? null : sentence
}
