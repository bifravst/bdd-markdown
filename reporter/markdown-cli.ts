import { markdownReporter } from './markdownReporter.js'

const chunks: string[] = []

process.stdin.on('data', (data) => {
	chunks.push(data.toString())
})

process.stdin.on('end', () => {
	console.log(markdownReporter(JSON.parse(chunks.join(''))))
})
