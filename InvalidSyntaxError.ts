import os from 'os'
import { TokenStream } from './TokenStream'

export class InvalidSyntaxError extends Error {
	constructor(stream: TokenStream, error: string) {
		const lines = stream.source().substring(0, stream.index()).split(os.EOL)
		const lastLineStart = stream
			.source()
			.substring(0, stream.index())
			.lastIndexOf(os.EOL)
		const col = stream.index() - lastLineStart
		super(
			`${error}\nLine ${lines.length}, Column ${col}\n${
				lines[lines.length - 1]
			}\n${' '.repeat(col - 1)}^`,
		)
		this.name = 'InvalidSyntaxError'
	}
}
