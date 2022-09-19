import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { escapeLogMessage, ZERO_WIDTH_SPACE } from './escapeLogMessage.js'

describe('escapeLogMessage()', () => {
	it('should escape backticks in log messages', async () => {
		assert.deepEqual(
			escapeLogMessage(
				'No runner defined for step: the endpoint is `https://up22obby20.execute-api.eu-north-1.amazonaws.com/prod/`',
			),
			'``' +
				ZERO_WIDTH_SPACE +
				'No runner defined for step: the endpoint is `https://up22obby20.execute-api.eu-north-1.amazonaws.com/prod/`' +
				ZERO_WIDTH_SPACE +
				'``',
		)
	})
})
