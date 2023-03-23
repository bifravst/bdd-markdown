import { type TokenStream } from '../tokenStream.js'
import { toErrorPosition } from './toErrorPosition.js'

export class IncompleteParseError extends Error {
	constructor(stream: TokenStream) {
		super(
			`Failed to parse entire source. ${
				stream.source().length - stream.index()
			} bytes remaining.${toErrorPosition(stream)}`,
		)
		this.name = 'IncompleteParseError'
	}
}
