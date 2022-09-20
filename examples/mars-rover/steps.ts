import { Type } from '@sinclair/typebox'
import assert from 'assert/strict'
import { matchGroups } from '../../runner/matchGroups.js'
import {
	noMatch,
	StepRunner,
	StepRunnerArgs,
	StepRunResult,
} from '../../runner/runStep.js'
import { Direction, rover } from './rover.js'

const printRover = (r: ReturnType<typeof rover>): string =>
	`${r.x()},${r.y()} ${r.direction()}`

export type RoverContext = {
	rover?: ReturnType<typeof rover>
	obstacles?: [x: number, y: number][]
}

const coordinateMatch = matchGroups(
	Type.Object({
		x: Type.Integer(),
		y: Type.Integer(),
	}),
	{
		x: (s) => parseInt(s, 10),
		y: (s) => parseInt(s, 10),
	},
)

export const steps: StepRunner<RoverContext>[] = [
	async ({
		step,
		log: {
			scenario: { progress },
			step: { progress: stepProgress },
		},
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		if (!/^I have a Mars Rover$/.test(step.title)) return noMatch
		stepProgress('Creating a new rover')
		const r = rover({
			canMoveTo: ([x, y]) =>
				(context.obstacles ?? []).find(([oX, oY]) => oX === x && oY === y) ===
				undefined,
			debug: (...args) => progress('Rover', ...args),
		})
		stepProgress('Rover created')
		context.rover = r
		return {
			result: context.rover,
			printable: printRover(r),
		}
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match = coordinateMatch(
			/^I set the initial starting point to `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			step.title,
		)
		if (match === null) return noMatch
		const r = context.rover as ReturnType<typeof rover>
		r.setX(match.x)
		r.setY(match.y)
		return {
			result: r,
			printable: printRover(r),
		}
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match = matchGroups(Type.Object({ direction: Type.Enum(Direction) }))(
			/^I set the initial direction to `(?<direction>[^`]+)`$/,
			step.title,
		)

		if (match === null) return noMatch
		const r = context.rover as ReturnType<typeof rover>
		r.setDirection(match.direction)
		return {
			result: r,
			printable: printRover(r),
		}
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		enum MovementDirection {
			forward = 'forward',
			backward = 'backward',
		}
		const match = matchGroups(
			Type.Object({
				direction: Type.Enum(MovementDirection),
				squares: Type.Integer({ minimum: 1 }),
			}),
			{
				squares: (s) => parseInt(s, 10),
			},
		)(
			/^I move the Mars Rover `(?<direction>forward|backward)` (?<squares>[0-9]+) squares?$/,
			step.title,
		)

		if (match === null) return noMatch
		const r = context.rover as ReturnType<typeof rover>
		if (match.direction === MovementDirection.forward) r.forward(match.squares)
		if (match.direction === MovementDirection.backward)
			r.backward(match.squares)

		return { result: r, printable: printRover(r) }
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match = coordinateMatch(
			/^the current position should be `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			step.title,
		)
		if (match === null) return noMatch

		const r = context.rover as ReturnType<typeof rover>

		assert.deepEqual(r.x(), match.x)
		assert.deepEqual(r.y(), match.y)
	},
	async ({
		step,
		context,
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match = coordinateMatch(
			/^there is an obstacle at `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			step.title,
		)

		if (match === null) return noMatch

		if (context.obstacles === undefined) context.obstacles = []

		context.obstacles.push([match.x, match.y])
	},
	async ({
		step,
		context,
		log: {
			step: { debug },
		},
	}: StepRunnerArgs<RoverContext>): Promise<StepRunResult> => {
		const match = coordinateMatch(
			/^the Mars Rover should report an obstacle at `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			step.title,
		)
		if (match === null) return noMatch
		const r = context.rover as ReturnType<typeof rover>

		debug('knownObstacles', JSON.stringify(r.knownObstacles()))

		assert.deepEqual(r.knownObstacles(), [[match.x, match.y]])
	},
]
