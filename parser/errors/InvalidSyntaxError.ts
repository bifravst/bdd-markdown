import { TokenStream } from '../tokenStream'
import { toErrorPosition } from './toErrorPosition'

export class InvalidSyntaxError extends Error {
	constructor(stream: TokenStream, error: string) {
		super(`${error}${toErrorPosition(stream)}`)
		this.name = 'InvalidSyntaxError'
	}
}
