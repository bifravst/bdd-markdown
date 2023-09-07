import os from 'os'
import type { Step } from '../parser/grammar.js'

const placeholderMatch = /\${[^}]+}/g
const alternativePlaceholderMatch = /<[^>]+>/g

export const getUnreplacedPlaceholders = (step: Step): string[] => {
	const searchText = `${step.title}${os.EOL}${step.codeBlock?.code ?? ''}`
	const unreplaced: string[] = []
	for (const pattern of [placeholderMatch, alternativePlaceholderMatch]) {
		for (const match of searchText.matchAll(pattern)) {
			unreplaced.push(match[0])
		}
	}
	return [...new Set(unreplaced)]
}
