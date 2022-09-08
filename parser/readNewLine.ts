import { skipWhiteSpace } from './skipWhiteSpace'
import { TokenStream } from '../tokenStream'

export const readNewLine = (s: TokenStream) => {
	skipWhiteSpace(s)
}
