import os from 'os'
import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import { Keyword, keywords } from './grammar'
import { readSentence } from './readSentence'
import { readWord } from './readWord'
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
	let firstWord = readWord(s)
	if (firstWord === null) return null
	let keyword: Keyword | undefined = undefined

	const firstWordIsKeyword = keywords.includes(firstWord)

	if (s.char() === ':') {
		// First word is followed by a colon, so this is supposed to be a keyword
		s.next() // skip the colon
		if (!firstWordIsKeyword)
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
		firstWord = ''
	} else {
		if (firstWordIsKeyword && s.char() === os.EOL) {
			// The only word in the heading is a keyword, this is allowed
			keyword = firstWord as Keyword
		} else {
			keyword = level === 1 ? Keyword.Feature : Keyword.Scenario
		}
	}
	skipSpace(s) // skip whitespace after first word

	if (s.char() === os.EOL) return { keyword }

	skipSpace(s)
	return {
		description: [firstWord, readSentence(s) ?? ''].join(' ').trim(),
		keyword,
	}
}
