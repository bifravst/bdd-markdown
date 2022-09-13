import { InvalidSyntaxError } from '../errors/InvalidSyntaxError'
import { getLineNumber } from '../errors/toErrorPosition'
import { Step, StepKeyword, steps } from '../grammar'
import { TokenStream } from '../tokenStream'
import { sentence } from './sentence'
import { word } from './word'

export const step = (s: TokenStream): Step | null => {
	const stepWord = word(s)
	const line = getLineNumber(s)
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
		line,
	}
	return step
}
