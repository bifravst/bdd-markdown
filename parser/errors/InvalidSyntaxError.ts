import { type TokenStream } from '../tokenStream.ts'
import { toErrorPosition } from './toErrorPosition.ts'

export class InvalidSyntaxError extends Error {
	constructor(stream: TokenStream, error: string) {
		super(`${error}${toErrorPosition(stream)}`)
		this.name = 'InvalidSyntaxError'
	}
}
