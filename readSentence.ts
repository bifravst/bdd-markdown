import os from 'node:os'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './TokenStream'

export const readSentence = (s: TokenStream) => {
	skipWhiteSpace(s)
	const sentence = []
	while (true) {
		const char = s.char()
		if (char === os.EOL) break
		sentence.push(char)
		if (s.eof()) break
		s.next()
	}

	return sentence.join('')
}
