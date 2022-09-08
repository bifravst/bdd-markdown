import { readFileSync } from 'fs'
import path from 'path'
import { parseFeature } from './parser/parseFeature'
import { tokenStream } from './tokenStream'

console.log(
	JSON.stringify(
		parseFeature(
			tokenStream(
				readFileSync(
					path.join(process.cwd(), process.argv[process.argv.length - 1]),
					'utf-8',
				),
			),
		),
	),
	null,
	2,
)
