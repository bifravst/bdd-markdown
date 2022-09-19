import { CodeBlock, Step } from '@nordicsemiconductor/bdd-markdown'

export class MissingCodeBlockError extends Error {
	constructor(step: Step) {
		super(
			`Expected code block to be defined for step "${step.keyword} ${step.title}"
			in line ${step.line}!`,
		)
	}
}

/**
 * Returns the codeBlock from the step or throws an exception. Useful helper for steps that require a codeBlock.
 */
export const codeBlockOrThrow = (step: Step): CodeBlock => {
	if (step.codeBlock === undefined) throw new MissingCodeBlockError(step)
	return step.codeBlock
}
