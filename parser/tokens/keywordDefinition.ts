import { getLineNumber } from '../errors/toErrorPosition'
import { Keyword, KeywordDefinition } from '../grammar'
import { TokenStream } from '../tokenStream'
import { comment } from './comment'
import { description } from './description'
import { keyword } from './keyword'
import { whiteSpace } from './whiteSpace'

/**
 * In this reader we have to take a look ahead in in case we do not encounter the "allowed" keyword, track back.
 */
export const keywordDefinition = (
	s: TokenStream,
	allowedKeywords: Keyword[],
	allowedLevel: number,
): KeywordDefinition | null => {
	if (s.isEoF()) return null

	const startIndex = s.index()

	const c = comment(s)

	whiteSpace(s)

	const k = keyword(s, allowedKeywords, allowedLevel)
	const line = getLineNumber(s)
	if (k === null) {
		s.go(startIndex)
		return null
	}

	whiteSpace(s)

	const d = description(s)

	const kw: KeywordDefinition = {
		keyword: k.keyword,
		title: k.description,
		line,
	}
	if (d !== null) kw.description = d
	if (c !== null) kw.comment = c

	return kw
}
