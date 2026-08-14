import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { LogLevel } from '../../runner/logger.ts'
import { ZERO_WIDTH_SPACE } from './escapeLogMessage.ts'
import { logEntry } from './logEntry.ts'

describe('logEntry()', () => {
	it('should escape backticks in log messages', async () => {
		const now = Date.now()
		assert.deepEqual(
			logEntry(
				{
					level: LogLevel.ERROR,
					message: [
						'No runner defined for step: the endpoint is `https://up22obby20.execute-api.eu-north-1.amazonaws.com/prod/`',
					],
					ts: now,
				},
				false,
				now,
			),
			'  :bangbang: ``' +
				ZERO_WIDTH_SPACE +
				'No runner defined for step: the endpoint is `https://up22obby20.execute-api.eu-north-1.amazonaws.com/prod/`' +
				ZERO_WIDTH_SPACE +
				'`` _@ 0 ms_  ',
		)
	})
})
