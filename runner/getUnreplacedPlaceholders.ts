import os from 'os'
import type { Step } from '../parser/grammar.js'

const placeholderMatch = /\${[^}]+}/g

export const getUnreplacedPlaceholders = (step: Step): string[] => {
	const searchText = `${step.title}${os.EOL}${step.codeBlock?.code ?? ''}`
	const unreplaced: string[] = []
	for (const match of searchText.matchAll(placeholderMatch)) {
		unreplaced.push(match[0])
	}
	return [...new Set(unreplaced)]
}
