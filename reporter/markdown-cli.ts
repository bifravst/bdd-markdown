import { markdownReporter } from './markdownReporter.js'

process.stdin.on('data', (data) => {
	console.log(markdownReporter(JSON.parse(data.toString())))
})
