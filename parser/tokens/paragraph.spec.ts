import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream.js'
import { paragraph } from './paragraph.js'

describe('paragraph()', () => {
	it('should read a paragraph', () =>
		assert.equal(
			paragraph(
				tokenStream(
					['This is a short description.', 'Second line.'].join(os.EOL),
				),
			),
			'This is a short description. Second line.',
		))

	it('should stop after two EOL', () =>
		assert.equal(
			paragraph(
				tokenStream(
					[
						'This is a short description.',
						'Second line.',
						'',
						'New line.',
					].join(os.EOL),
				),
			),
			'This is a short description. Second line.',
		))
})
