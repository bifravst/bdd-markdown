import chalk from 'chalk'
import os from 'os'
import { TokenStream } from '../tokenStream'

export class InvalidSyntaxError extends Error {
	constructor(stream: TokenStream, error: string) {
		const lines = stream.source().slice(0, stream.index()).split(os.EOL)
		const lastLineStart = stream
			.source()
			.slice(0, stream.index())
			.lastIndexOf(os.EOL)
		const lineNum =
			stream
				.source()
				.slice(0, stream.index())
				.match(new RegExp(`${os.EOL}`, 'g'))?.length ?? 0
		const col = stream.index() - lastLineStart
		const lineInfo = `${lineNum + 1}:${col}: `
		super(
			`${error}${os.EOL}${chalk.gray(`${lineInfo}`)}${lines[lineNum]}${
				os.EOL
			}${' '.repeat(col - 1 + lineInfo.length)}^`,
		)
		this.name = 'InvalidSyntaxError'
	}
}
