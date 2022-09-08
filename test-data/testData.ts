import { readFileSync } from 'node:fs'
import path, { parse } from 'node:path'
import { tokenStream } from '../tokenStream'

export const testData = (testFilename: string) => (dataFilename: string) =>
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
