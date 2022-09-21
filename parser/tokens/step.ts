import { InvalidSyntaxError } from '../errors/InvalidSyntaxError.js'
import { getLineNumber } from '../errors/toErrorPosition.js'
import { Step, StepKeyword, steps } from '../grammar.js'
import { TokenStream } from '../tokenStream.js'
import { paragraph } from './paragraph.js'
import { space } from './whiteSpace.js'
import { word } from './word.js'

type ParsedStep = Omit<Step, 'keyword'> & { keyword: StepKeyword }

export const step = (s: TokenStream): ParsedStep | null => {
	const stepWord = word(s)
	const line = getLineNumber(s)
	if (stepWord === null) return null
	if (!steps.includes(stepWord as StepKeyword))
		throw new InvalidSyntaxError(
			s,
			`Unexpected step: ${stepWord}, expected one of ${steps}!`,
		)
	space(s)
	const title = paragraph(s)
	if (title === null)
		throw new InvalidSyntaxError(s, `Incomplete step definition!`)

	const step: ParsedStep = {
		keyword: stepWord as StepKeyword,
		title,
		line,
	}
	return step
}
