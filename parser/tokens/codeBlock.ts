import os from 'os'
import { CodeBlock } from '../grammar'
import { TokenStream } from '../tokenStream'
import { line } from './line'
import { whiteSpace } from './whiteSpace'
import { word } from './word'

const fence = (s: TokenStream): boolean => {
	const index = s.index()
	if (s.char() !== '`') return false
	if (s.next() !== '`') {
		s.go(index)
		return false
	}
	if (s.next() !== '`') {
		s.go(index)
		return false
	}
	s.next()
	return true
}

/**
 * A codeblock is a block fenced with three in the line before and after, and optionally a language specifier.
 *
 * Example:
 *
 * ```json
 * {
 *   "dev": {
 *       "modV": "mfw_nrf9160_1.3.1",
 *       "brdV": "nrf9160dk_nrf9160",
 *       "appV": "${appVersion}-upgraded"
 *     }
 *   }
 * }
 * ```
 */
export const codeBlock = (s: TokenStream): CodeBlock | null => {
	if (!fence(s)) return null
	const language = word(s)
	whiteSpace(s)

	const codeLines: string[] = []

	while (true) {
		const l = line(s)
		if (l === null) break
		if (l === '```') break
		codeLines.push(l)
	}

	const block: CodeBlock = {
		code: codeLines.join(os.EOL),
	}
	if (language !== null) block.language = language

	return block
}
