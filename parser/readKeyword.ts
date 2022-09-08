import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { TokenStream } from '../tokenStream'
import { Keyword, keywords } from './grammar'
import { readSentence } from './readSentence'
import { readWord } from './readWord'
import { skipWhiteSpace } from './skipWhiteSpace'

/**
 * Keywords are
 * - Markdown headlines
 * - either of level one or two
 * - with an optional keyword specifier
 * - except for `feature` which must be level 1 without the keyword.
 */
export const readKeyword = (
	s: TokenStream,
): { title: string; keyword?: Keyword } | null => {
	let level = 0
	while (true) {
		if (s.char() !== '#') break
		if (s.eof()) break
		level++
		s.next()
	}
	if (s.char() !== ' ')
		throw new InvalidSyntaxError(s, `Expected " ", got "${s.char()}".`)
	skipWhiteSpace(s)
	const firstWord = readWord(s)
	let title = ''
	let keyword: Keyword | undefined = undefined
	if (s.char() === ':') {
		// This is supposed to be a keyword
		if (!keywords.includes(firstWord))
			throw new InvalidSyntaxError(s, `Unexpected keyword ${firstWord}`)

		if (firstWord === Keyword.Feature) {
			if (level !== 1)
				throw new InvalidSyntaxError(
					s,
					`The ${Keyword.Feature} keyword must be a level 1 heading.`,
				)
		} else {
			if (level !== 2)
				throw new InvalidSyntaxError(
					s,
					`The ${firstWord} keyword must be a level 2 heading.`,
				)
		}
		keyword = firstWord as Keyword
		// Skip colon and whitespace
		s.next()
		skipWhiteSpace(s)
	} else {
		title = firstWord + ' '
	}
	if (keyword === undefined) {
		if (level === 1) keyword = Keyword.Feature
		else keyword = Keyword.Scenario
	}
	skipWhiteSpace(s)
	title += readSentence(s)
	return { title, keyword: keyword as Keyword }
}
