import chalk from 'chalk'
import os from 'os'
import { TokenStream } from '../tokenStream'

export const toErrorPosition = (stream: TokenStream): string => {
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
	const nextEOL = stream.source().indexOf(os.EOL, stream.index())
	const line = stream
		.source()
		.slice(0, Math.max(0, nextEOL))
		.split(os.EOL)
		.pop()
	return `${os.EOL}${os.EOL}${chalk.gray(`${lineInfo}`)}${line}${
		os.EOL
	}${' '.repeat(col - 1 + lineInfo.length)}^${os.EOL}`
}
