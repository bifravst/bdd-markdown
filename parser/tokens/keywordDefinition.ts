import { getLineNumber } from '../errors/toErrorPosition.js'
import type { Keyword } from '../grammar.js'
import { type KeywordDefinition } from '../grammar.js'
import { type TokenStream } from '../tokenStream.js'
import { comment } from './comment.js'
import { description } from './description.js'
import { keyword } from './keyword.js'
import { whiteSpace } from './whiteSpace.js'

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
