import { readNewLine } from './readNewLine'
import { readSentence } from './readSentence'
import { skipWhiteSpace } from './skipWhiteSpace'
import { startsWithKeyword } from './startsWithKeyword'
import { TokenStream } from './TokenStream'

export const readDescription = (s: TokenStream) => {
	let paragraph = 0
	const description: string[] = []
	while (true) {
		if (startsWithKeyword(s)) break
		const sentence = readSentence(s)
		if (sentence === null) break
		description[paragraph] = `${
			description[paragraph] ?? ''
		} ${sentence}`.trim()
		if (s.eof()) break
		const linebreaks = skipWhiteSpace(s)
		if (linebreaks === 2) {
			readNewLine(s)
			paragraph++
		}
		if (linebreaks > 2) break
	}
	return description.filter((s) => s.length > 0)
}
