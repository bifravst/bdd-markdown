import os from 'os'
import { parse } from 'yaml'
import { readLine } from './readLine'
import { TokenStream } from './tokenStream'

const readFence = (s: TokenStream): boolean => {
	const index = s.index()
	if (s.char() !== '-') return false
	if (s.next() !== '-') {
		s.go(index)
		return false
	}
	if (s.next() !== '-') {
		s.go(index)
		return false
	}
	s.next()
	return true
}

/**
 * Frontmatter is YAML embedded in Markdown. It may appear at the beginning of the file, and is enclosed with triple dashed lines.
 *
 * Example:
 *
 * ---
 * tags:
 *   - foo
 *   - bar
 * ---
 */
export const readFrontMatter = (s: TokenStream): Record<string, any> | null => {
	if (!readFence(s)) return null

	const yamlLines: string[] = []

	while (true) {
		const line = readLine(s)
		if (line === null) break
		if (line === '---') break
		yamlLines.push(line)
	}

	return parse(yamlLines.join(os.EOL))
}
