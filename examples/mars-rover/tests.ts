import assert from 'assert/strict'
import path from 'path'
import { noMatch, print, runner } from 'runner'

enum Direction {
	N = 'N',
	S = 'S',
	W = 'W',
	E = 'E',
}
const rover = () => {
	let x: number | undefined = undefined
	let y: number | undefined = undefined
	let direction: Direction | undefined = undefined
	return {
		setX: (newX: number) => (x = newX),
		setY: (newY: number) => (y = newY),
		setDirection: (newDirection: Direction) => (direction = newDirection),
		x: () => x,
		y: () => y,
		direction: () => direction,
		forward: () => {
			switch (direction) {
				case Direction.N:
					y = (y ?? 0) - 1
					break
				case Direction.S:
					y = (y ?? 0) + 1
					break
				case Direction.W:
					x = (x ?? 0) - 1
					break
				case Direction.E:
					x = (x ?? 0) + 1
					break
			}
		},
	}
}

const printRover = (r: ReturnType<typeof rover>): string =>
	`${r.x()},${r.y()} ${r.direction()}`

const res = await runner(path.join(process.cwd(), 'examples', 'mars-rover'))
	.addStepRunner(async ({ step }) => {
		if (!/^I have a Mars Rover$/.test(step.title)) return noMatch
		const r = rover()
		return { matched: true, result: r, printable: printRover(r) }
	})
	.addStepRunner(async ({ step, previousResult }) => {
		const match = /^I set the initial starting point to `(?<x>[0-9]+),(?<y>[0-9]+)`$/.exec(step.title)
		if (match?.groups === undefined) return noMatch
		const r = previousResult as unknown as ReturnType<typeof rover>
		r.setX(parseInt(match.groups.x ?? '0', 10))
		r.setY(parseInt(match.groups.y ?? '0', 10))
		return {
			matched: true,
			result: r,
			printable: printRover(r),
		}
	})
	.addStepRunner(async ({ step, previousResult }) => {
		const match = /^I set the initial direction to `(?<direction>[^`]+)`$/.exec(step.title)
		if (match?.groups === undefined) return noMatch
		const r = previousResult as unknown as ReturnType<typeof rover>
		r.setDirection(match.groups.direction as Direction)
		return {
			matched: true,
			result: r,
			printable: printRover(r),
		}
	})
	.addStepRunner(async ({ step, previousResult }) => {
		const match = /^I move the Mars Rover `(?<direction>forward|backward)`$/.exec(step.title)
		if (match?.groups === undefined) return noMatch
		const r = previousResult as unknown as ReturnType<typeof rover>
		if (match.groups.direction === 'forward') r.forward()

		return { matched: true, result: r, printable: printRover(r) }
	})
	.addStepRunner(async ({ step, previousResult }) => {
		const match = /^the current position should be `(?<x>-?[0-9]+),(?<y>-?[0-9]+)`$/.exec(step.title)
		if (match?.groups === undefined) return noMatch

		const r = previousResult as unknown as ReturnType<typeof rover>

		assert.deepEqual(r.x(), parseInt(match.groups.x, 10))
		assert.deepEqual(r.y(), parseInt(match.groups.y, 10))

		return { matched: true }
	})
	.run()

print(res)

if (!res.ok) process.exit(1)
