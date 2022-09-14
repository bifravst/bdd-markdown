import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { parseTags } from './parseTags.js'

describe('parseTags()', () => {
	const tests: [string, ReturnType<typeof parseTags>][] = [
		[
			'A text with @tag1 and another @tag2',
			{
				tag1: true,
				tag2: true,
			},
		],
		[
			'@tag1 @tag2 two tags at the beginning',
			{
				tag1: true,
				tag2: true,
			},
		],
		[
			'At the end @tag1 @tag2',
			{
				tag1: true,
				tag2: true,
			},
		],
		[
			'@start and then @conf:foo=bar,a=b with and end @end',
			{
				start: true,
				end: true,
				conf: { foo: 'bar', a: 'b' },
			},
		],
		[
			// no tags
			'A text with no tags, but an email: alex@example.com',
			undefined,
		],
	]

	for (const [text, expected] of tests) {
		it(`should parse "${text}" into ${JSON.stringify(expected)}`, () =>
			assert.deepEqual(parseTags(text), expected))
	}
})
