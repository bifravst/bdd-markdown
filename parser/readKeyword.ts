import os from 'os'
import { InvalidSyntaxError } from './errors/InvalidSyntaxError'
import { Keyword } from './grammar'
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
export const readKeyword =
	(allowedKeywords: Keyword[], allowedLevel: number) =>
	(s: TokenStream): { keyword: Keyword; description?: string } | null => {
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

		if (s.char() === ':') {
			// First word is followed by a colon, so this is supposed to be a keyword
			s.next() // skip the colon
			keyword = firstWord as Keyword
			firstWord = ''
		} else {
			if (s.peekNext() === os.EOL) {
				// The only word in the heading is a keyword, this is allowed
				keyword = firstWord as Keyword
			} else {
				keyword = level === 1 ? Keyword.Feature : Keyword.Scenario
			}
		}
		skipSpace(s) // skip whitespace after first word

		if (!allowedKeywords.includes(keyword))
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

		if (s.char() === os.EOL) return { keyword }

		skipSpace(s)
		return {
			description: [firstWord, readSentence(s) ?? ''].join(' ').trim(),
			keyword,
		}
	}

export const readFeatureKeyword = readKeyword([Keyword.Feature], 1)
export const readSecondLevelKeyword = readKeyword(
	[Keyword.Scenario, Keyword.ScenarioOutline, Keyword.Background, Keyword.Rule],
	2,
)
export const readExampleKeyword = readKeyword([Keyword.Example], 3)
