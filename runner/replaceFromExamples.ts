import { type Step } from '../parser/grammar.js'
import jsonata from 'jsonata'

export const replaceFromExamples = async (
	step: Step,
	row: Record<string, unknown>,
): Promise<Step> => {
	const replaced = {
		...step,
		title: await replaceStringPlaceholders(step.title, row),
	}
	if (replaced.codeBlock !== undefined) {
		// Handle the special quoted number case
		// where expressing a number like this:
		// '{ "foo": "$number{v}" }'
		// will replaced it with (given v = 42)
		// '{ "foo": 42 }'
		// This is a hack to allow JSON formatting to work, because this is not valid JSON:
		// '{ "foo": ${v} }'
		if (replaced.codeBlock.language === 'json') {
			replaced.codeBlock = {
				...replaced.codeBlock,
				code: await replaceNumberPlaceholders(replaced.codeBlock.code, row),
			}
		}
		replaced.codeBlock = {
			...replaced.codeBlock,
			code: await replaceStringPlaceholders(replaced.codeBlock.code, row),
		}
	}
	return replaced
}
const stringPlaceholderExpressions = /\$\{([^}]+)\}/g
const numberPlaceholderExpression = /"\$number\{([^}]+)\}"/g

export const replacePlaceholders = async (
	s: string,
	row: Record<string, unknown>,
	expression: RegExp,
): Promise<string> => {
	let result = s
	for (const match of s.matchAll(expression)) {
		const expression = match[1] as string
		const e = jsonata(expression)
		const replaced = await e.evaluate(row)
		if (replaced === undefined) continue
		result = result.replace(match[0], replaced)
	}
	return result
}

export const replaceStringPlaceholders = async (
	s: string,
	row: Record<string, unknown>,
): Promise<string> => replacePlaceholders(s, row, stringPlaceholderExpressions)

export const replaceNumberPlaceholders = async (
	s: string,
	row: Record<string, unknown>,
): Promise<string> => replacePlaceholders(s, row, numberPlaceholderExpression)
