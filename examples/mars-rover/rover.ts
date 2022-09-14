export enum Direction {
	N = 'N',
	S = 'S',
	W = 'W',
	E = 'E',
}

type Rover = {
	setX: (newX: number) => void
	setY: (newY: number) => void
	setDirection: (newDirection: Direction) => void
	x: () => number | undefined
	y: () => number | undefined
	direction: () => Direction | undefined
	forward: (squares: number) => void
	backward: (squares: number) => void
	knownObstacles: () => [x: number, y: number][]
}

export const rover = ({
	canMoveTo,
	debug,
}: {
	canMoveTo: (pos: [x: number, y: number]) => boolean
	debug?: (...args: string[]) => void
}): Rover => {
	let x: number | undefined = undefined
	let y: number | undefined = undefined
	let direction: Direction | undefined = undefined
	const knownObstacles: [x: number, y: number][] = []
	let moving = false

	const move = (squares: number) => {
		if (moving) throw new Error(`Still on the move.`)
		moving = true
		// This is intentionally "bad" design, because the code in the promise is simulating an effect that is happening in the background.
		// eslint-disable-next-line no-async-promise-executor
		new Promise<void>(async (resolve) => {
			const dir = squares > 0 ? 1 : -1
			for (let i = 0; i < Math.abs(squares); i++) {
				let newY = y ?? 0
				let newX = x ?? 0
				switch (direction) {
					case Direction.N:
						newY = (y ?? 0) - dir
						break
					case Direction.S:
						newY = (y ?? 0) + dir
						break
					case Direction.W:
						newX = (x ?? 0) - dir
						break
					case Direction.E:
						newX = (x ?? 0) + dir
						break
				}
				if (canMoveTo([newX, newY])) {
					// Wait 100 ms
					await new Promise((resolve) => setTimeout(resolve, 100))
					x = newX
					y = newY
					debug?.(`Moving to ${x},${y}`)
				} else {
					knownObstacles.push([newX, newY])
					break
				}
			}
			moving = false
			resolve()
		}).catch(console.error)
	}

	return {
		setX: (newX: number) => (x = newX),
		setY: (newY: number) => (y = newY),
		setDirection: (newDirection: Direction) => (direction = newDirection),
		x: () => x,
		y: () => y,
		direction: () => direction,
		forward: (squares) => move(squares),
		backward: (squares) => move(-squares),
		knownObstacles: () => knownObstacles,
	}
}
