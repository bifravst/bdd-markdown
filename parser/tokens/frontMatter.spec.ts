import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { testData } from '../../test-data/testData'
import { frontMatter } from './frontMatter'

const l = testData(import.meta.url)

describe('frontMatter()', () => {
	it('should parse a one-line code block', () =>
		assert.deepEqual(frontMatter(l('frontmatter')), {
			info: 'front-matter should be supported for feature-level settings',
			tags: ['first'],
			contexts: [
				{
					nw: 'ltem',
					'nw-modem': 'LTE-M',
				},
				{
					nw: 'nbiot',
					'nw-modem': 'NB-IoT',
				},
			],
		}))
})
