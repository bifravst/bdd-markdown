import { LogLevel } from '@nordicsemiconductor/bdd-markdown/runner'
import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { ZERO_WIDTH_SPACE } from './escapeLogMessage.js'
import { logEntry } from './logEntry.js'

describe('logEntry()', () => {
	it('should escape backticks in log messages', async () => {
		assert.deepEqual(
			logEntry(
				{
					level: LogLevel.ERROR,
					message: [
						'No runner defined for step: the endpoint is `https://up22obby20.execute-api.eu-north-1.amazonaws.com/prod/`',
					],
					ts: 42,
				},
				false,
			),
			'  :bangbang: ``' +
				ZERO_WIDTH_SPACE +
				'No runner defined for step: the endpoint is `https://up22obby20.execute-api.eu-north-1.amazonaws.com/prod/`' +
				ZERO_WIDTH_SPACE +
				'`` _@ 42 ms_  ',
		)
	})
})
