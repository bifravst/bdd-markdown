import type { Step } from '../parser/grammar.ts'

const placeholderMatch = /\${[^}]+}/g
const alternativePlaceholderMatch = /<[^>]+>/g

export const Source = {
	title: 'title',
	codeblock: 'codeblock',
} as const
export type Source = (typeof Source)[keyof typeof Source]

export type Unreplaced = { placeholder: string; source: Source }[]

export const getUnreplacedPlaceholders = (step: Step): Unreplaced => {
	const unreplacedInTitle = listUnreplaced(step.title)
	const unreplacedInCodeblock = listUnreplaced(step.codeBlock?.code ?? '')
	return [
		...unreplacedInTitle.map((placeholder) => ({
			placeholder,
			source: Source.title,
		})),
		...unreplacedInCodeblock.map((placeholder) => ({
			placeholder,
			source: Source.codeblock,
		})),
	]
}

const listUnreplaced = (source: string): string[] => {
	const unreplaced: string[] = []
	for (const pattern of [placeholderMatch, alternativePlaceholderMatch]) {
		for (const match of source.matchAll(pattern)) {
			unreplaced.push(match[0])
		}
	}
	return [...new Set(unreplaced)]
}
