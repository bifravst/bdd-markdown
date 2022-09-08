import { TokenStream } from '../tokenStream'

export class UnknownKeywordError extends Error {
	constructor(stream: TokenStream, keyword: string) {
		super(
			`Unknown keyword "${keyword}" encountered at position ${stream.index()}`,
		)
		this.name = 'UnknownKeywordError'
	}
}
