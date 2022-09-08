import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { tokenStream } from '../tokenStream'
import { readKeyword } from './readKeyword'

describe('readKeyword()', () => {
	it('should parse a feature headline without the keyword', () =>
		assert.deepEqual(readKeyword(tokenStream('# Example feature')), {
			keyword: 'Feature',
			title: 'Example feature',
		}))

	it('should parse a feature headline with the keyword', () =>
		assert.deepEqual(readKeyword(tokenStream('# Feature: Example feature')), {
			keyword: 'Feature',
			title: 'Example feature',
		}))

	it('should only parse one line for the keyword', () =>
		assert.deepEqual(
			readKeyword(
				tokenStream(
					`# Feature: Example feature${os.EOL}${os.EOL}Additional text.`,
				),
			),
			{
				keyword: 'Feature',
				title: 'Example feature',
			},
		))

	it('should not allow feature keyword on level 2 headline', () =>
		assert.throws(
			() => readKeyword(tokenStream('## Feature: Example feature')),
			/The Feature keyword must be a level 1 heading./,
		))

	it('should not allow other keywords on level 1 headline', () =>
		assert.throws(
			() => readKeyword(tokenStream('# Scenario: Example scenario')),
			/The Scenario keyword must be a level 2 heading./,
		))
})
