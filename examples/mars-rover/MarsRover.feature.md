<!-- Source: https://kata-log.rocks/mars-rover-kata -->

# Mars Rover

> You’re part of the team that explores Mars by sending remotely controlled
> vehicles to the surface of the planet. Develop an API that translates the
> commands sent from earth to instructions that are understood by the rover.

## Scenario Outline: Move the rover forward

Given I have a Mars Rover

When I set the initial starting point to `0,0`

And I set the initial direction to `${direction}`

And I move the Mars Rover `forward` 1 square

Soon the current position should be `${x},${y}`

### Examples

| direction | x   | y   |
| --------- | --- | --- |
| N         | 0   | -1  |
| S         | 0   | 1   |
| E         | 1   | 0   |
| W         | -1  | 0   |

## Scenario Outline: Move the rover backward

Given I have a Mars Rover

When I set the initial starting point to `0,0`

And I set the initial direction to `${direction}`

And I move the Mars Rover `backward` 1 square

Soon the current position should be `${x},${y}`

### Examples

| direction | x   | y   |
| --------- | --- | --- |
| N         | 0   | 1   |
| S         | 0   | -1  |
| E         | -1  | 0   |
| W         | 1   | 0   |

## Hit an obstacle

> If a given sequence of commands encounters an obstacle, the rover moves up to
> the last possible point, aborts the sequence and reports the obstacle.

Given I have a Mars Rover

And there is an obstacle at `0,-5`

When I set the initial starting point to `0,0`

And I set the initial direction to `N`

And I move the Mars Rover `forward` 10 squares

> The Rover will encounter the obstacle.

Soon the current position should be `0,-4`

Then the Mars Rover should report an obstacle at `0,-5`
