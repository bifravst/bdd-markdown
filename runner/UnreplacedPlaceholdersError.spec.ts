import assert from 'node:assert'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { StepKeyword } from '../parser/grammar.js'
import { Source } from './getUnreplacedPlaceholders.js'
import { UnreplacedPlaceholdersError } from './UnreplacedPlaceholdersError.js'

describe('UnreplacedPlaceholdersError', () => {
	it('should format the error', () => {
		const err = new UnreplacedPlaceholdersError(
			path.parse('/tmp/MyFeature.feature.md'),
			{
				keyword: StepKeyword.Given,
				title:
					'I am authenticated with Cognito as `${userEmail}` with password `${userPassword}`',
				line: 1,
			},
			[
				{
					placeholder: '${userEmail}',
					source: Source.title,
				},
				{
					placeholder: '${userPassword}',
					source: Source.title,
				},
			],
		)

		assert.equal(
			err.message,
			[
				'Step has unreplaced title placeholders: I am authenticated with Cognito as `${userEmail}` with password `${userPassword}`',
				' - ${userEmail}',
				' - ${userPassword}',
				'/tmp/MyFeature.feature.md:1',
			].join(os.EOL),
		)
	})
})
