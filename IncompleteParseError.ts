import { TokenStream } from './TokenStream'

export class IncompleteParseError extends Error {
	constructor(stream: TokenStream) {
		super(
			`Failed to parse entire source. ${
				stream.source().length - stream.index()
			} bytes remaining.`,
		)
		this.name = 'IncompleteParseError'
	}
}
