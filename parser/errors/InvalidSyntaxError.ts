import { type TokenStream } from '../tokenStream.js'
import { toErrorPosition } from './toErrorPosition.js'

export class InvalidSyntaxError extends Error {
	constructor(stream: TokenStream, error: string) {
		super(`${error}${toErrorPosition(stream)}`)
		this.name = 'InvalidSyntaxError'
	}
}
