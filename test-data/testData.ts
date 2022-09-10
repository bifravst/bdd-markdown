import { readFileSync } from 'fs'
import path, { parse } from 'path'
import { TokenStream, tokenStream } from '../parser/tokenStream'

export const testData =
	(testFilename: string) =>
	(dataFilename: string): TokenStream =>
		tokenStream(
			readFileSync(
				path.join(
					process.cwd(),
					'test-data',
					parse(testFilename).name.replace('.spec', ''),
					`${dataFilename}.md`,
				),
				'utf-8',
			),
		)
