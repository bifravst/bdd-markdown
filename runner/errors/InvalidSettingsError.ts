export class InvalidSettingsError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvalidSettingsError'
	}
}
