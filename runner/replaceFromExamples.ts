import { type Row, type Step } from '../parser/grammar.js'

export const replaceFromExamples =
	(row: Row) =>
	(step: Step): Step => {
		const replaced = {
			...step,
			title: replacePlaceholders(step.title, row),
		}
		if (step.codeBlock !== undefined) {
			replaced.codeBlock = {
				...step.codeBlock,
				code: replacePlaceholders(step.codeBlock.code, row),
			}
		}
		return replaced
	}
export const replacePlaceholders = (s: string, row: Row): string =>
	Object.entries(row).reduce(
		(replaced, [k, v]) => (replaced = replaced.replaceAll(`\${${k}}`, v)),
		s,
	)
