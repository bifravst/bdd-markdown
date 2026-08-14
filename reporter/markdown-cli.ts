import { markdownReporter } from './markdownReporter.ts'

const chunks: string[] = []

process.stdin.on('data', (data) => {
	chunks.push(data.toString())
})

process.stdin.on('end', async () => {
	console.log(await markdownReporter(JSON.parse(chunks.join(''))))
})
