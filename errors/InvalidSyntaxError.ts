import os from 'os'
import { TokenStream } from '../tokenStream'

export class InvalidSyntaxError extends Error {
	constructor(stream: TokenStream, error: string) {
		const lines = stream.source().substring(0, stream.index()).split(os.EOL)
		const lastLineStart = stream
			.source()
			.substring(0, stream.index())
			.lastIndexOf(os.EOL)
		const col = stream.index() - lastLineStart
		super(
			`${error}${os.EOL}Line ${lines.length}, Column ${col}${os.EOL}${
				lines[lines.length - 1]
			}${os.EOL}${' '.repeat(col - 1)}^`,
		)
		this.name = 'InvalidSyntaxError'
	}
}
