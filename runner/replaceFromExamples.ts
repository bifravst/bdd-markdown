import { type Step } from '../parser/grammar.js'
import jsonata from 'jsonata'

export const replaceFromExamples = async (
	step: Step,
	row: Record<string, unknown>,
): Promise<Step> => {
	const replaced = {
		...step,
		title: await replacePlaceholders(step.title, row),
	}
	if (step.codeBlock !== undefined) {
		replaced.codeBlock = {
			...step.codeBlock,
			code: await replacePlaceholders(step.codeBlock.code, row),
		}
	}
	return replaced
}
const placeholderExpression = /\$\{([^}]+)\}/g
export const replacePlaceholders = async (
	s: string,
	row: Record<string, unknown>,
): Promise<string> => {
	let result = s
	for (const match of s.matchAll(placeholderExpression)) {
		const expression = match[1] as string
		const e = jsonata(expression)
		const replaced = await e.evaluate(row)
		if (replaced === undefined) continue
		result = result.replace(match[0], replaced)
	}
	return result
}
