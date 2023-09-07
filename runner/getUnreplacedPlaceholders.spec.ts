import assert from 'assert/strict'
import { describe, it } from 'node:test'
import os from 'os'
import { StepKeyword } from '../parser/grammar.js'
import { getUnreplacedPlaceholders } from './getUnreplacedPlaceholders.js'

describe('getUnreplacedPlaceholders()', () => {
	it('should detect unreplaced placeholders in the title', () =>
		assert.deepEqual(
			getUnreplacedPlaceholders({
				keyword: StepKeyword.Then,
				line: 1,
				title:
					'azure_iot_hub_integration: cloud_wrap_init:  Version:      ${appVersion}-original',
			}),
			['${appVersion}'],
		))
	it('should detect unreplaced placeholders in the code block', () =>
		assert.deepEqual(
			getUnreplacedPlaceholders({
				keyword: StepKeyword.Then,
				line: 1,
				title: 'Some title',
				codeBlock: {
					code: [
						'azure_iot_hub_integration: cloud_wrap_init:  Version:      ${appVersion}-original',
						'azure_iot_hub_integration: cloud_wrap_init:  ID scope:     ${idScope}',
					].join(os.EOL),
				},
			}),
			['${appVersion}', '${idScope}'],
		))
	it('should return false if there are no placeholders', () =>
		assert.deepEqual(
			getUnreplacedPlaceholders({
				keyword: StepKeyword.Then,
				line: 1,
				title: 'Some title',
				codeBlock: {
					code: 'azure_iot_hub_integration',
				},
			}),
			[],
		))
	it('should detect unreplaced placeholders using the alternative syntax', () =>
		assert.deepEqual(
			getUnreplacedPlaceholders({
				keyword: StepKeyword.Then,
				line: 1,
				title: 'Given network is `<variant.nw>` and modem is `<variant.modem>`',
			}),
			['<variant.nw>', '<variant.modem>'],
		))
})
