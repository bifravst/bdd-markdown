import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { Step, StepKeyword, steps } from '../grammar'
import { TokenStream } from '../tokenStream'
import { sentence } from './sentence'
import { word } from './word'

export const step = (s: TokenStream): Step | null => {
	const stepWord = word(s)
	if (stepWord === null) return null
	if (!steps.includes(stepWord as StepKeyword))
		throw new InvalidSyntaxError(
			s,
			`Unexpected step: ${stepWord}, expected one of ${steps}!`,
		)
	const title = sentence(s)
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
