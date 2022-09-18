import { consoleReporter } from './console.js'

process.stdin.on('data', (data) => {
	consoleReporter(JSON.parse(data.toString()), console.log)
})
