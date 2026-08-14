import { type TokenStream } from '../tokenStream.ts'
import { sentence } from './sentence.ts'

/**
 * Parse a markdown paragraph (until two newlines are encountered)
 */
export const paragraph = (s: TokenStream): string | null => {
	const sentences: string[] = []
	while (true) {
		const sn = sentence(s)
		if (sn === null) break
		sentences.push(sn)
		if (s.isEoF()) break
		if (s.isEoL()) {
			s.next()
		}
	}

	if (sentences.length === 0) return null
	return sentences.join(' ')
}
