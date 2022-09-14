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

export type RoverContext = {
	rover?: ReturnType<typeof rover>
	obstacles?: [x: number, y: number][]
}

export const steps: StepRunner<RoverContext>[] = [
	async ({
		step,
		log: { progress },
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		if (!/^I have a Mars Rover$/.test(step.title)) return noMatch
		progress('Creating a new rover')
		const r = rover({
			canMoveTo: ([x, y]) =>
				(context.obstacles ?? []).find(([oX, oY]) => oX === x && oY === y) ===
				undefined,
			debug: (...args) => progress('Rover', ...args),
		})
		progress('Rover created')
		context.rover = r
		return {
			matched: true,
			result: context.rover,
			printable: printRover(r),
		}
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^I set the initial starting point to `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/.exec(
				step.title,
			)
		if (match?.groups === undefined) return noMatch
		const r = context.rover as ReturnType<typeof rover>
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
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match = /^I set the initial direction to `(?<direction>[^`]+)`$/.exec(
			step.title,
		)
		if (match?.groups === undefined) return noMatch
		const r = context.rover as ReturnType<typeof rover>
		r.setDirection(match.groups.direction as Direction)
		return {
			matched: true,
			result: r,
			printable: printRover(r),
		}
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^I move the Mars Rover `(?<direction>forward|backward)` (?<squares>[0-9]+) squares?$/.exec(
				step.title,
			)
		const { direction, squares } = match?.groups ?? {}
		if (direction === undefined || squares === undefined) return noMatch
		const r = context.rover as ReturnType<typeof rover>
		if (direction === 'forward') r.forward(parseInt(squares, 10))
		if (direction === 'backward') r.backward(parseInt(squares, 10))

		return { matched: true, result: r, printable: printRover(r) }
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^the current position should be `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/.exec(
				step.title,
			)
		if (match?.groups === undefined) return noMatch

		const r = context.rover as ReturnType<typeof rover>

		assert.deepEqual(r.x(), parseInt(match.groups.x, 10))
		assert.deepEqual(r.y(), parseInt(match.groups.y, 10))

		return { matched: true }
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^there is an obstacle at `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/.exec(
				step.title,
			)
		if (match?.groups === undefined) return noMatch

		if (context.obstacles === undefined) context.obstacles = []

		context.obstacles.push([
			parseInt(match.groups.x, 10),
			parseInt(match.groups.y, 10),
		])

		return { matched: true }
	},
	async ({
		step,
		context,
		log: { debug },
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match =
			/^the Mars Rover should report an obstacle at `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/.exec(
				step.title,
			)
		if (match?.groups === undefined) return noMatch

		const r = context.rover as ReturnType<typeof rover>

		debug('knownObstacles', JSON.stringify(r.knownObstacles()))

		assert.deepEqual(r.knownObstacles(), [
			[parseInt(match.groups.x, 10), parseInt(match.groups.y, 10)],
		])

		return { matched: true }
	},
]
