import { KeywordDefinition } from './grammar'
import { readComments } from './readComments'
import { readDescription } from './readDescription'
import { readKeyword } from './readKeyword'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

export const readKeywordDefinition = (
	s: TokenStream,
): KeywordDefinition | null => {
	if (s.isEoF()) return null

	const comment = readComments(s)

	skipWhiteSpace(s)

	const keyword = readKeyword(s)
	if (keyword === null) return null

	skipWhiteSpace(s)

	const description = readDescription(s)

	const kw: KeywordDefinition = {
		keyword: keyword.keyword,
		shortDescription: keyword.description,
	}
	if (description !== null) kw.description = description
	if (comment !== null) kw.comment = comment

	return kw
}
