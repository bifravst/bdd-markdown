import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from './TokenStream'

export const readNewLine = (s: TokenStream) => {
	skipWhiteSpace(s)
}
