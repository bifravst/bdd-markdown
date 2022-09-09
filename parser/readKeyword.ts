import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import { Keyword } from './grammar'
import { readSentence } from './readSentence'
import { skipSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

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
export const readKeyword = (
	s: TokenStream,
	allowedKeywords: Keyword[],
	allowedLevel: number,
): { keyword: Keyword; description?: string } | null => {
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
	skipSpace(s)

	let keyword: Keyword | undefined = undefined
	let description: string | undefined = undefined

	const sentence = readSentence(s)
	if (sentence?.includes(':') ?? false) {
		// Keyword heading includes a colon, so the part before the colon is supposed to be a keyword
		const [k, d] = (sentence as string).split(':').map((s) => s.trim())
		keyword = k as Keyword
		description = d
	} else if (allowedKeywords.includes(sentence as Keyword)) {
		// The heading is just the keyword
		keyword = sentence as Keyword
	} else {
		// The heading is just the description
		description = sentence ?? undefined
		// Infer the keyword from the level
		keyword = {
			1: Keyword.Feature,
			2: Keyword.Scenario,
			3: Keyword.Example,
		}[level]
	}

	if (!allowedKeywords.includes(keyword as Keyword))
		throw new InvalidSyntaxError(
			s,
			`Unexpected keyword ${keyword}, expected ${allowedKeywords.join(
				' or ',
			)}!`,
		)

	if (level !== allowedLevel)
		throw new InvalidSyntaxError(
			s,
			`The ${keyword} keyword must be a level ${allowedLevel} heading.`,
		)

	if (description === undefined) return { keyword: keyword as Keyword }

	return {
		keyword: keyword as Keyword,
		description,
	}
}
