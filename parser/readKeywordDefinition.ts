import { Keyword, KeywordDefinition } from './grammar'
import { readComments } from './readComments'
import { readDescription } from './readDescription'
import { readKeyword } from './readKeyword'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

/**
 * In this reader we have to take a look ahead in in case we do not encounter the "allowed" keyword, track back.
 */
export const readKeywordDefinition = (
	s: TokenStream,
	allowedKeywords: Keyword[],
	allowedLevel: number,
): KeywordDefinition | null => {
	if (s.isEoF()) return null

	const startIndex = s.index()

	const comment = readComments(s)

	skipWhiteSpace(s)

	const keyword = readKeyword(s, allowedKeywords, allowedLevel)
	if (keyword === null) {
		s.go(startIndex)
		return null
	}

	skipWhiteSpace(s)

	const description = readDescription(s)

	const kw: KeywordDefinition = {
		keyword: keyword.keyword,
		title: keyword.description,
	}
	if (description !== null) kw.description = description
	if (comment !== null) kw.comment = comment

	return kw
}
