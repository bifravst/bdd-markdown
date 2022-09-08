import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { TokenStream } from '../tokenStream'
import { readSentence } from './readSentence'
import { readWord } from './readWord'

export enum Step {
	Given = 'Given',
	When = 'When',
	Then = 'Then',
}

const steps = [Step.Given, Step.When, Step.Then]

export const readStep = (
	s: TokenStream,
): { step: Step; title: string } | null => {
	const step = readWord(s)
	if (step === null)
		throw new InvalidSyntaxError(s, `Expected a step definition!`)
	if (!steps.includes(step as Step))
		throw new InvalidSyntaxError(
			s,
			`Unexpected step: ${step}, expected one of ${steps}!`,
		)
	const title = readSentence(s)
	if (title === null)
		throw new InvalidSyntaxError(s, `Incomplete step definition!`)
	return {
		step: step as Step,
		title,
	}
}
