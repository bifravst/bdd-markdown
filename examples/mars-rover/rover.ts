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
	forward: () => void
}

export const rover = (): Rover => {
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
