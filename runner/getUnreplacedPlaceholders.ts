import { Step } from '@nordicsemiconductor/bdd-markdown/parser'
import os from 'os'

const placeholderMatch = /\${[^}]+}/g

export const getUnreplacedPlaceholders = (step: Step): string[] => {
	const searchText = `${step.title}${os.EOL}${step.codeBlock?.code ?? ''}`
	const unreplaced: string[] = []
	for (const match of searchText.matchAll(placeholderMatch)) {
		unreplaced.push(match[0])
	}
	return [...new Set(unreplaced)]
}
