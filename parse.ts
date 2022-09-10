import { readFileSync } from 'fs'
import path from 'path'
import { feature } from './parser/feature'
import { tokenStream } from './parser/tokenStream'

console.log(
	JSON.stringify(
		feature(
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
