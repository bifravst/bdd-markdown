import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { StepKeyword } from '../parser/grammar.js'
import { replaceFromExamples } from './replaceFromExamples.js'

describe('replaceFromExamples()', () => {
	it('should replace placeholders in a step title with the provided example data', async () => {
		const replaced = await replaceFromExamples(
			{
				keyword: StepKeyword.Then,
				title: 'the current position should be `${x},${y}`',
				line: 1,
			},
			{ x: '17', y: '42' },
		)
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Then,
			title: 'the current position should be `17,42`',
			line: 1,
		})
	})
	it('should replace placeholders in a step code block with the provided example data', async () => {
		const replaced = await replaceFromExamples(
			{
				keyword: StepKeyword.Then,
				title: 'the current position should be `${x},${y}`',
				line: 1,
				codeBlock: {
					language: 'json',
					code: '{ "foo": "${v}" }',
				},
			},
			{ v: 'bar' },
		)
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
	it('should replace multiple occurrences', async () => {
		const replaced = await replaceFromExamples(
			{
				keyword: StepKeyword.Then,
				title: 'the current position should be `${x},${x}`',
				line: 1,
			},
			{ x: '17' },
		)
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Then,
			title: 'the current position should be `17,17`',
			line: 1,
		})
	})
	it('should replace using dot notation', async () => {
		const replaced = await replaceFromExamples(
			{
				keyword: StepKeyword.Given,
				title: 'network is `${variant.nw}` and modem is `${variant.modem}`',
				line: 1,
			},
			{
				variant: {
					nw: 'ltem',
					modem: 'LTE-m',
				},
			},
		)
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Given,
			title: 'network is `ltem` and modem is `LTE-m`',
			line: 1,
		})
	})
	it('should replace quoted numbers in JSON code-blocks', async () => {
		const replaced = await replaceFromExamples(
			{
				keyword: StepKeyword.Then,
				title:
					'replace a quoted number with the actual number in a JSON code-block',
				line: 1,
				codeBlock: {
					language: 'json',
					code: '{ "foo": "$number{v}" }',
				},
			},
			{ v: 42 },
		)
		assert.deepEqual(replaced, {
			keyword: StepKeyword.Then,
			title:
				'replace a quoted number with the actual number in a JSON code-block',
			line: 1,
			codeBlock: {
				language: 'json',
				code: '{ "foo": 42 }',
			},
		})
	})
})
