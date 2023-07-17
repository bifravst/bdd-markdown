import { type Step } from '../parser/grammar.js'
import {
	replaceNumberPlaceholders,
	replaceStringPlaceholders,
	replaceVariantPlaceholders,
} from './replaceFromExamples.js'

export const replaceFromContext = async (
	step: Step,
	context: Record<string, any>,
): Promise<Step> => {
	const replaced = {
		...step,
		title: await replaceStringPlaceholders(
			await replaceVariantPlaceholders(step.title, context.variant),
			context,
		),
	}
	if (replaced.codeBlock !== undefined) {
		if (replaced.codeBlock.language === 'json') {
			replaced.codeBlock = {
				...replaced.codeBlock,
				code: await replaceNumberPlaceholders(
					await replaceVariantPlaceholders(
						replaced.codeBlock.code,
						context.variant,
					),
					context,
				),
			}
		}
		replaced.codeBlock = {
			...replaced.codeBlock,
			code: await replaceStringPlaceholders(
				await replaceVariantPlaceholders(
					replaced.codeBlock.code,
					context.variant,
				),
				context,
			),
		}
	}
	return replaced
}
