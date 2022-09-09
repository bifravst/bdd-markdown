export class EndOfStreamError extends Error {
	constructor({ index }: { index: number; stream: string }) {
		super(`Reached end of stream at ${index}`)
		this.name = 'EndOfStreamError'
	}
}
