import { Type } from '@sinclair/typebox'
import assert from 'assert/strict'
import { backOff } from 'exponential-backoff'
import { regExpMatchedStep } from '../../runner/regExpMatchedStep.js'
import type { StepRunner } from '../../runner/runSuite.js'
import { Direction, rover } from './rover.js'

export type RoverContext = {
	rover?: ReturnType<typeof rover>
	obstacles?: [x: number, y: number][]
}

const Coordinates = Type.Object({
	x: Type.Integer(),
	y: Type.Integer(),
})
const coordinateTransformer = {
	x: (s: string) => parseInt(s, 10),
	y: (s: string) => parseInt(s, 10),
}

enum MovementDirection {
	forward = 'forward',
	backward = 'backward',
}

export const steps: StepRunner<RoverContext>[] = [
	<StepRunner<RoverContext>>{
		match: (title) => /^I have a Mars Rover$/.test(title),
		run: async ({ log: { progress }, context }) => {
			progress('Creating a new rover')
			const r = rover({
				canMoveTo: ([x, y]) =>
					(context.obstacles ?? []).find(([oX, oY]) => oX === x && oY === y) ===
					undefined,
				debug: (...args) => progress('Rover', ...args),
			})
			progress('Rover created')
			context.rover = r
		},
	},
	regExpMatchedStep(
		{
			regExp:
				/^I set the initial starting point to `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			schema: Coordinates,
			converters: coordinateTransformer,
		},
		async ({ match, context, log: { progress } }) => {
			const r = context.rover as ReturnType<typeof rover>
			r.setX(match.x)
			r.setY(match.y)
			progress(`Rover moved to ${match.x} ${match.y}`)
		},
	),
	regExpMatchedStep(
		{
			regExp: /^I set the initial direction to `(?<direction>[^`]+)`$/,
			schema: Type.Object({ direction: Type.Enum(Direction) }),
		},
		async ({ match, context, log: { progress } }) => {
			const r = context.rover as ReturnType<typeof rover>
			r.setDirection(match.direction)
			progress(`Rover direction set to ${match.direction}`)
		},
	),
	regExpMatchedStep(
		{
			regExp:
				/^I move the Mars Rover `(?<direction>forward|backward)` (?<squares>[0-9]+) squares?$/,
			schema: Type.Object({
				direction: Type.Enum(MovementDirection),
				squares: Type.Integer({ minimum: 1 }),
			}),
			converters: {
				squares: (s) => parseInt(s, 10),
			},
		},
		async ({ match, context, log: { progress } }) => {
			const r = context.rover as ReturnType<typeof rover>
			progress(`Move rover ${match.direction}`)
			if (match.direction === MovementDirection.forward)
				r.forward(match.squares)
			if (match.direction === MovementDirection.backward)
				r.backward(match.squares)
		},
	),
	regExpMatchedStep(
		{
			regExp:
				/^the current position should be `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			schema: Coordinates,
			converters: coordinateTransformer,
		},
		async ({ match, context, log: { progress } }) => {
			// This implements the retry in the step using a linear backoff
			await backOff(
				async () => {
					const r = context.rover as ReturnType<typeof rover>
					progress(`Current position is ${r.x()} ${r.y()}`)
					assert.deepEqual(r.x(), match.x)
					assert.deepEqual(r.y(), match.y)
				},
				{ timeMultiple: 1 },
			)
		},
	),
	regExpMatchedStep(
		{
			regExp: /^there is an obstacle at `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			schema: Coordinates,
			converters: coordinateTransformer,
		},
		async ({ match, context }) => {
			if (context.obstacles === undefined) context.obstacles = []
			context.obstacles.push([match.x, match.y])
		},
	),
	regExpMatchedStep(
		{
			regExp:
				/^the Mars Rover should report an obstacle at `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/,
			schema: Coordinates,
			converters: coordinateTransformer,
		},
		async ({ match, context, log: { debug } }) => {
			const r = context.rover as ReturnType<typeof rover>
			debug('knownObstacles', JSON.stringify(r.knownObstacles()))
			assert.deepEqual(r.knownObstacles(), [[match.x, match.y]])
		},
	),
]
