import { readKeyword } from './readKeyword'
import { TokenStream } from './TokenStream'

export const startsWithKeyword = (s: TokenStream) =>
	readKeyword(s.clone()) !== null
