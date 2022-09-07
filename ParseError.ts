import { TokenStream } from './TokenStream'

export class ParseError extends Error {
	constructor(message: string, stream: TokenStream) {
		super(message)
		this.name = 'ParseError'
	}
}
