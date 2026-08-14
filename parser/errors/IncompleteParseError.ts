import { type TokenStream } from '../tokenStream.ts'
import { toErrorPosition } from './toErrorPosition.ts'

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
