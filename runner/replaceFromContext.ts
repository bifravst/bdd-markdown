import { type Step } from '../parser/grammar.js'
import {
	replaceNumberPlaceholders,
	replaceStringPlaceholders,
} from './replaceFromExamples.js'

export const replaceFromContext = async (
	step: Step,
	context: Record<string, any>,
): Promise<Step> => {
	const replaced = {
		...step,
		title: await replaceStringPlaceholders(step.title, context),
	}
	if (replaced.codeBlock !== undefined) {
		if (replaced.codeBlock.language === 'json') {
			replaced.codeBlock = {
				...replaced.codeBlock,
				code: await replaceNumberPlaceholders(replaced.codeBlock.code, context),
			}
		}
		replaced.codeBlock = {
			...replaced.codeBlock,
			code: await replaceStringPlaceholders(replaced.codeBlock.code, context),
		}
	}
	return replaced
}
