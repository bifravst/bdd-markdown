import { TokenStream } from '../tokenStream'

export const skip =
	(ifMatch: (char: string) => boolean) =>
	(s: TokenStream): void => {
		while (true) {
			if (!ifMatch(s.char())) break
			if (s.eof()) break
			s.next()
		}
	}

export const skipWhiteSpace = skip((s) => /\s/.test(s))
export const skipSpace = skip((s) => s.includes(' '))
