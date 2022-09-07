import { Keyword, keywords, ParsedKeyword } from './parseFeature'
import { readDescription } from './readDescription'
import { readKeywordName } from './readKeywordName'
import { readSentence } from './readSentence'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './TokenStream'
import { UnknownKeywordError } from './UnknownKeywordError'

export const readKeyword = <K extends ParsedKeyword>(
	s: TokenStream,
): K | null => {
	if (s.eof()) return null

	skipWhiteSpace(s)

	const keywordName = readKeywordName(s)
	if (keywordName === null) return null
	if (!keywords.includes(keywordName))
		throw new UnknownKeywordError(s, keywordName)

	const shortDescription = readSentence(s)

	skipWhiteSpace(s)

	const description = readDescription(s)

	const keyword: ParsedKeyword = {
		keyword: keywordName as Keyword,
		shortDescription: shortDescription,
		description,
	}

	return keyword as K
}
