import { readFileSync } from 'fs'
import path, { parse } from 'path'
import { tokenStream, type TokenStream } from '../tokenStream.js'

export const testData =
	(testFilename: string) =>
	(dataFilename: string): TokenStream =>
		tokenStream(
			readFileSync(
				path.join(
					process.cwd(),
					'parser',
					'test-data',
					parse(testFilename).name.replace('.spec', ''),
					`${dataFilename}.feature.md`,
				),
				'utf-8',
			),
		)
