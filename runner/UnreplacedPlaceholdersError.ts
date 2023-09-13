import path from 'node:path'
import os from 'node:os'
import type { Step } from '../parser/grammar'
import type { Unreplaced } from './getUnreplacedPlaceholders'

export class UnreplacedPlaceholdersError extends Error {
	public readonly step: Step
	public readonly unreplaced: Unreplaced
	public readonly file: path.ParsedPath
	constructor(file: path.ParsedPath, step: Step, unreplaced: Unreplaced) {
		super(
			[
				`Step has unreplaced title placeholders: ${step.title}`,
				unreplaced.map(({ placeholder: name }) => ` - ${name}`).join(os.EOL),
				`${path.format(file)}:${step.line}`,
			].join(os.EOL),
		)
		this.name = 'UnreplacedPlaceholdersError'
		this.step = step
		this.unreplaced = unreplaced
		this.file = file
	}
}
