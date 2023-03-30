import { consoleReporter } from './consoleReporter.js'

const chunks: string[] = []

process.stdin.on('data', (data) => {
	chunks.push(data.toString())
})

process.stdin.on('end', () => {
	const report = JSON.parse(chunks.join(''))
	consoleReporter(report, console.log)
	if (report.ok !== true) process.exit(1)
})
