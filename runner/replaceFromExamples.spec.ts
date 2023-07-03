import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { StepKeyword } from '../parser/grammar.js'
import { replaceFromExamples } from './replaceFromExamples.js'

describe('replaceFromExamples()', () => {
	it('should replace placeholders in a step title with the provided example data', async () => {
		const replaced = replaceFromExamples({ x: '17', y: '42' })({
			keyword: StepKeyword.Then,
			title: 'the current position should be `${x},${y}`',
			line: 1,
		})
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Then,
			title: 'the current position should be `17,42`',
			line: 1,
		})
	})
	it('should replace placeholders in a step code block with the provided example data', async () => {
		const replaced = replaceFromExamples({ v: 'bar' })({
			keyword: StepKeyword.Then,
			title: 'the current position should be `${x},${y}`',
			line: 1,
			codeBlock: {
				language: 'json',
				code: '{ "foo": "${v}" }',
			},
		})
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Then,
			title: 'the current position should be `${x},${y}`',
			line: 1,
			codeBlock: {
				language: 'json',
				code: '{ "foo": "bar" }',
			},
		})
	})
	it('should replace multiple occurrences', () => {
		const replaced = replaceFromExamples({ x: '17' })({
			keyword: StepKeyword.Then,
			title: 'the current position should be `${x},${x}`',
			line: 1,
		})
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Then,
			title: 'the current position should be `17,17`',
			line: 1,
		})
	})
})
