import { TokenStream } from '../tokenStream.js'
import { sentence } from './sentence.js'
import { whiteSpace } from './whiteSpace.js'

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
export const description = (s: TokenStream): string[] | null => {
	let paragraph = 0
	const description: string[][] = [[]]
	while (true) {
		if (!isQuoteStart(s.char())) break
		s.next()
		whiteSpace(s) // skip '>' and all whitespace
		while (isQuoteStart(s.char())) {
			// skip blank lines
			s.next()
			whiteSpace(s) // skip '>' and all whitespace
			// Increase paragraph count if current has content
			if (description[paragraph].length > 0) {
				description[++paragraph] = []
			}
		}
		const sn = sentence(s)
		if (sn === null) break
		description[paragraph].push(sn)
		if (s.isEoF()) break
		whiteSpace(s)
	}

	const paragraphs = description
		.filter((s) => s.length > 0)
		.map((s) => s.join(' '))
	return paragraphs.length > 0 ? paragraphs : null
}

const isQuoteStart = (char: string) => char === '>'
