import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream'
import { readDescription } from './readDescription'

describe('readDescription()', () => {
	it('should parse a description', () =>
		assert.deepEqual(
			readDescription(tokenStream('This is a short description.')),
			['This is a short description.'],
		))

	it('should parse multi-line descriptions', () =>
		assert.deepEqual(
			readDescription(
				tokenStream(
					[
						`      This is a description for the feature, which can span multiple lines. This`,
						`      paragraph is intentionally very long so we hit the prettier auto-format wrapping`,
						`      the long line.`,
						'      ',
						`      And single line-breaks should be allowed in the description.`,
						'      ',
					].join(os.EOL),
				),
			),
			[
				'This is a description for the feature, which can span multiple lines. This paragraph is intentionally very long so we hit the prettier auto-format wrapping the long line.',
				'And single line-breaks should be allowed in the description.',
			],
		))

	describe('should not parse other instructions', () => {
		it('should not parse the next headline', () =>
			assert.deepEqual(
				readDescription(
					tokenStream(
						[
							'Some description',
							`## Scenario: this begins a new scenario.`,
						].join(os.EOL),
					),
				),
				['Some description'],
			))
	})
})
