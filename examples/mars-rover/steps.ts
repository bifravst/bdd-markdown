import {
	noMatch,
	StepRunner,
	StepRunnerArgs,
	StepRunResult,
} from '@nordicsemiconductor/bdd-markdown/runner'
import assert from 'assert/strict'
import { Direction, rover } from './rover.js'

const printRover = (r: ReturnType<typeof rover>): string =>
	`${r.x()},${r.y()} ${r.direction()}`

type RoverContext = Record<string, unknown>

export const steps: StepRunner<RoverContext>[] = [
	async ({
		step,
		log: { progress },
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		if (!/^I have a Mars Rover$/.test(step.title)) return noMatch
		progress('Creating a new rover')
		const r = rover()
		progress('Rover created')
		return { matched: true, result: r, printable: printRover(r) }
	},
	async ({
		step,
		previousResult,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^I set the initial starting point to `(?<x>[0-9]+),(?<y>[0-9]+)`$/.exec(
				step.title,
			)
		if (match?.groups === undefined) return noMatch
		const r = previousResult as unknown as ReturnType<typeof rover>
		r.setX(parseInt(match.groups.x ?? '0', 10))
		r.setY(parseInt(match.groups.y ?? '0', 10))
		return {
			matched: true,
			result: r,
			printable: printRover(r),
		}
	},
	async ({
		step,
		previousResult,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match = /^I set the initial direction to `(?<direction>[^`]+)`$/.exec(
			step.title,
		)
		if (match?.groups === undefined) return noMatch
		const r = previousResult as unknown as ReturnType<typeof rover>
		r.setDirection(match.groups.direction as Direction)
		return {
			matched: true,
			result: r,
			printable: printRover(r),
		}
	},
	async ({
		step,
		previousResult,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^I move the Mars Rover `(?<direction>forward|backward)`$/.exec(
				step.title,
			)
		if (match?.groups === undefined) return noMatch
		const r = previousResult as unknown as ReturnType<typeof rover>
		if (match.groups.direction === 'forward') r.forward()

		return { matched: true, result: r, printable: printRover(r) }
	},
	async ({
		step,
		previousResult,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^the current position should be `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/.exec(
				step.title,
			)
		if (match?.groups === undefined) return noMatch

		const r = previousResult as unknown as ReturnType<typeof rover>

		assert.deepEqual(r.x(), parseInt(match.groups.x, 10))
		assert.deepEqual(r.y(), parseInt(match.groups.y, 10))

		return { matched: true }
	},
]
