import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { parseTag } from './parseTags.js'

describe('parseTag()', () => {
	const tests: [string, ReturnType<typeof parseTag>][] = [
		[
			'@tag',
			{
				name: 'tag',
			},
		],
		[
			'@tag:prop1',
			{
				name: 'tag',
				props: {
					prop1: true,
				},
			},
		],
		[
			'@tag:prop1,prop2',
			{
				name: 'tag',
				props: {
					prop1: true,
					prop2: true,
				},
			},
		],
		[
			'@tag:prop1=42',
			{
				name: 'tag',
				props: {
					prop1: '42',
				},
			},
		],
		[
			'@tag:prop1=1.42',
			{
				name: 'tag',
				props: {
					prop1: '1.42',
				},
			},
		],
		[
			'@tag:prop1=42,prop2,prop3=17',

			{
				name: 'tag',
				props: {
					prop1: '42',
					prop2: true,
					prop3: '17',
				},
			},
		],
		// ERROR CASES
		['some text', undefined],
		// Space after :
		['@tag: prop1', undefined],
		// Incomplete props
		['@tag:', undefined],
		// Space after ,
		['@tag:prop1, prop2', undefined],
		//  , at end
		['@tag:prop1,', undefined],
		// Email
		['alex@example.com', undefined],
		// Comma after tag
		['@tag1,', undefined],
		// Dot after tag
		['@tag1.', undefined],
	]

	for (const [text, expected] of tests) {
		it(`should parse "${text}" into ${JSON.stringify(expected)}`, () =>
			assert.deepEqual(parseTag(text), expected))
	}
})
