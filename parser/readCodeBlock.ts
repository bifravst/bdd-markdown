import os from 'os'
import { CodeBlock } from './grammar'
import { readLine } from './readLine'
import { readWord } from './readWord'
import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './tokenStream'

const readFence = (s: TokenStream): boolean => {
	if (s.char() !== '`') return false
	if (s.next() !== '`') return false
	if (s.next() !== '`') return false
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
export const readCodeBlock = (s: TokenStream): CodeBlock | null => {
	if (!readFence(s)) return null
	const language = readWord(s)
	skipWhiteSpace(s)

	const codeLines: string[] = []

	while (true) {
		const line = readLine(s)
		if (line === null) break
		if (line === '```') break
		codeLines.push(line)
	}

	const block: CodeBlock = {
		code: codeLines.join(os.EOL),
	}
	if (language !== null) block.language = language

	return block
}
