import { TokenStream } from '../tokenStream'

const isWhiteSpace = (char: string) => /\s/.test(char)

export const skipWhiteSpace = (s: TokenStream): void => {
	while (true) {
		if (!isWhiteSpace(s.char())) break
		if (s.eof()) break
		s.next()
	}
}
