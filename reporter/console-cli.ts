import { consoleReporter } from './consoleReporter.js'

process.stdin.on('data', (data) => {
	consoleReporter(JSON.parse(data.toString()), console.log)
})
