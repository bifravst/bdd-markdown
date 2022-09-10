import { TokenStream } from '../tokenStream'

const skip =
	(ifMatch: (char: string) => boolean) =>
	(s: TokenStream): void => {
		while (true) {
			if (!ifMatch(s.char())) break
			if (s.isEoF()) break
			s.next()
		}
	}

export const whiteSpace = skip((s) => /\s/.test(s))
export const space = skip((s) => s.includes(' '))
