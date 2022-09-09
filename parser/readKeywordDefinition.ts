import { Keyword, KeywordDefinition } from './grammar'
import { readComments } from './readComments'
import { readDescription } from './readDescription'
import { readKeyword } from './readKeyword'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

export const readKeywordDefinition = (
	s: TokenStream,
	allowedKeywords: Keyword[],
	allowedLevel: number,
): KeywordDefinition | null => {
	if (s.isEoF()) return null

	const comment = readComments(s)

	skipWhiteSpace(s)

	const keyword = readKeyword(s, allowedKeywords, allowedLevel)
	if (keyword === null) return null

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
