import { Row, Step } from '@bdd-markdown/parser'

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
const replacePlaceholders = (s: string, row: Row): string =>
	Object.entries(row).reduce(
		(replaced, [k, v]) => (replaced = replaced.replace(`\${${k}}`, v)),
		s,
	)
