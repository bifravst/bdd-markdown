import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { getLineNumber } from '../errors/toErrorPosition'
import { Keyword } from '../grammar'
import { TokenStream } from '../tokenStream'
import { sentence } from './sentence'
import { space } from './whiteSpace'

/**
 * Keywords are
 * - Markdown headings
 * - either of level one or two
 * - with an optional keyword specifier
 * - except for `feature` which must be level 1 without the keyword
 * - and an optional descriptions
 *
 * Examples:
 *
 * # User registration
 * ^ this is the "feature" keyword, with the description "User registration"
 *
 * # Feature: User registration
 * ^ the same as the previous
 *
 * ## Fill registration form
 * ^ the "scenario" keyword, with the description "Fill registration form"
 *
 * ## Scenario: Fill registration form
 * ^ the same as the previous
 *
 * ## Rule: Email must be syntactically correct
 * ^ the "rule" keyword, with the description "Email must be syntactically correct"
 *
 * ## Background
 * ^ the "background" keyword, without description
 */
export const keyword = (
	s: TokenStream,
	allowedKeywords: Keyword[],
	allowedLevel: number,
): { keyword: Keyword; description?: string; lineNumber: number } | null => {
	let level = 0
	if (s.char() !== '#') return null
	while (true) {
		if (s.char() !== '#') break
		if (s.isEoF()) break
		level++
		s.next()
	}
	if (s.char() !== ' ')
		throw new InvalidSyntaxError(s, `Expected " ", got "${s.char()}".`)
	space(s)

	let keyword: Keyword | undefined = undefined
	let description: string | undefined = undefined

	const sn = sentence(s)
	const lineNumber = getLineNumber(s)
	if (sn?.includes(':') ?? false) {
		// Keyword heading includes a colon, so the part before the colon is supposed to be a keyword
		const [k, d] = (sn as string).split(':').map((s) => s.trim())
		keyword = k as Keyword
		description = d
	} else if (allowedKeywords.includes(sn as Keyword)) {
		// The heading is just the keyword
		keyword = sn as Keyword
	} else {
		// The heading is just the description
		description = sn ?? undefined
		// Infer the keyword from the level
		keyword = {
			1: Keyword.Feature,
			2: Keyword.Scenario,
			3: Keyword.Example,
		}[level]
	}

	if (!allowedKeywords.includes(keyword as Keyword)) return null

	if (level !== allowedLevel) return null

	if (description === undefined)
		return { keyword: keyword as Keyword, lineNumber: lineNumber }

	return {
		keyword: keyword as Keyword,
		lineNumber: lineNumber,
		description,
	}
}
