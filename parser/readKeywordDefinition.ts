import { ParsedKeyword } from './grammar'
import { readComments } from './readComments'
import { readDescription } from './readDescription'
import { readKeyword } from './readKeyword'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

export const readKeywordDefinition = <K extends ParsedKeyword>(
	s: TokenStream,
): K | null => {
	if (s.isEoF()) return null

	const comment = readComments(s)

	skipWhiteSpace(s)

	const keyword = readKeyword(s)
	if (keyword === null) return null

	skipWhiteSpace(s)

	const description = readDescription(s)

	const kw: ParsedKeyword = {
		keyword: keyword.keyword,
		shortDescription: keyword.description,
	}
	if (description !== null) kw.description = description
	if (comment !== null) kw.comment = comment

	return kw as K
}
