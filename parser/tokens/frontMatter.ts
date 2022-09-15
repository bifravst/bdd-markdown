import os from 'os'
import { parse } from 'yaml'
import { TokenStream } from '../tokenStream.js'
import { line } from './line.js'
import { whiteSpace } from './whiteSpace.js'

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
export const frontMatter = (s: TokenStream): Record<string, any> | null => {
	if (!readFence(s)) return null

	const yamlLines: string[] = []

	while (true) {
		const l = line(s)
		if (l === null) break
		if (l === '---') break
		yamlLines.push(l)
	}
	whiteSpace(s)

	return parse(yamlLines.join(os.EOL))
}
