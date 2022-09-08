import { TokenStream } from '../tokenStream'
import { readNewLine } from './readNewLine'
import { readSentence } from './readSentence'
import { skipWhiteSpace } from './skipWhiteSpace'

export const readDescription = (s: TokenStream) => {
	let paragraph = 0
	const description: string[] = []
	while (true) {
		const sentence = readSentence(s)
		if (sentence === null) break
		description[paragraph] = `${
			description[paragraph] ?? ''
		} ${sentence}`.trim()
		if (s.eof()) break
		const lineBreaks = skipWhiteSpace(s)
		if (lineBreaks === 2) {
			readNewLine(s)
			paragraph++
		}
		if (lineBreaks > 2) break
	}
	return description.filter((s) => s.length > 0)
}
