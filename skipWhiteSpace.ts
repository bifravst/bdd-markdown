import os from 'node:os'
import { isWhiteSpace } from './isWhiteSpace'
import { TokenStream } from './TokenStream'

export const skipWhiteSpace = (s: TokenStream) => {
	let newLines = 0
	while (true) {
		if (s.char() === os.EOL) newLines++
		if (!isWhiteSpace(s.char())) break
		if (s.eof()) break
		s.next()
	}
	return newLines
}
