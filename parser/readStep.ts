import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { TokenStream } from '../tokenStream'
import { Step, StepKeyword, steps } from './grammar'
import { readSentence } from './readSentence'
import { readWord } from './readWord'

export const readStep = (s: TokenStream): Step | null => {
	const stepWord = readWord(s)
	if (stepWord === null) return null
	if (!steps.includes(stepWord as StepKeyword))
		throw new InvalidSyntaxError(
			s,
			`Unexpected step: ${stepWord}, expected one of ${steps}!`,
		)
	const title = readSentence(s)
	if (title === null)
		throw new InvalidSyntaxError(s, `Incomplete step definition!`)

	const step: Step = {
		keyword: stepWord as StepKeyword,
		title,
	}
	const values = parseValues(title)
	if (values !== null) step.values = values
	return step
}

const parseValues = (text: string): string[] | null => {
	const matches: string[] = []

	for (const match of text.matchAll(/`([^`]+)`/g)) {
		matches.push(match[1])
	}

	return matches.length > 0 ? matches : null
}
