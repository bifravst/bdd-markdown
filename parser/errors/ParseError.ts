import { TokenStream } from '../tokenStream'
import { toErrorPosition } from './toErrorPosition'

export class ParseError extends Error {
	constructor(message: string, stream: TokenStream) {
		super(`${message}${toErrorPosition(stream)}`)
		this.name = 'ParseError'
	}
}
