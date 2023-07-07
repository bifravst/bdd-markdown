import { type Step } from '../parser/grammar.js'
import { replacePlaceholders } from './replaceFromExamples.js'

export const replaceFromContext = async (
	step: Step,
	context: Record<string, any>,
): Promise<Step> => {
	const replaced = {
		...step,
		title: await replacePlaceholders(step.title, context),
	}
	if (step.codeBlock !== undefined) {
		replaced.codeBlock = {
			...step.codeBlock,
			code: await replacePlaceholders(step.codeBlock.code, context),
		}
	}
	return replaced
}
