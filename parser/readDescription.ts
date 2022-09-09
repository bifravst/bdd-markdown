import { readSentence } from './readSentence'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

/**
 * A description is a freeform text in quotes.
 * It can be provided for all keywords.
 *
 * Example:
 *
 * > This is a description for the feature, which can span multiple lines. This
 * > paragraph is intentionally very long so we hit the prettier auto-format
 * > wrapping the long line.
 * >
 * > And line-breaks should be allowed in the description.
 */
export const readDescription = (s: TokenStream): string[] | null => {
	let paragraph = 0
	const description: string[][] = [[]]
	while (true) {
		if (!isQuoteStart(s.char())) break
		s.next()
		skipWhiteSpace(s) // skip '>' and all whitespace
		while (isQuoteStart(s.char())) {
			// skip blank lines
			s.next()
			skipWhiteSpace(s) // skip '>' and all whitespace
			// Increase paragraph count if current has content
			if (description[paragraph].length > 0) {
				description[++paragraph] = []
			}
		}
		const sentence = readSentence(s)
		if (sentence === null) break
		description[paragraph].push(sentence)
		if (s.isEoF()) break
		skipWhiteSpace(s)
	}

	const paragraphs = description
		.filter((s) => s.length > 0)
		.map((s) => s.join(' '))
	return paragraphs.length > 0 ? paragraphs : null
}

const isQuoteStart = (char: string) => char === '>'
