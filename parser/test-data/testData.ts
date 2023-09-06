import { readFileSync } from 'fs'
import path, { parse, type ParsedPath } from 'path'
import { tokenStream, type TokenStream } from '../tokenStream.js'

export const testData =
	(testFilename: string, component = 'parser') =>
	(dataFilename: string): TokenStream =>
		testFile(testFilename, component)(dataFilename).stream

export const testFile =
	(testFilename: string, component = 'parser') =>
	(
		dataFilename: string,
	): {
		stream: TokenStream
		file: ParsedPath
	} => {
		const f = path.join(
			process.cwd(),
			component,
			'test-data',
			parse(testFilename).name.replace('.spec', ''),
			`${dataFilename}.feature.md`,
		)
		return {
			stream: tokenStream(readFileSync(f, 'utf-8')),
			file: parse(f),
		}
	}
