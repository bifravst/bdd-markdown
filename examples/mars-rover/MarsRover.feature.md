<!-- Source: https://kata-log.rocks/mars-rover-kata -->

# Mars Rover

> You’re part of the team that explores Mars by sending remotely controlled
> vehicles to the surface of the planet. Develop an API that translates the
> commands sent from earth to instructions that are understood by the rover.

## Scenario Outline: Move the rover forward/backward (f,b)

Given I have a Mars Rover

When I set the initial starting point to `0,0`

And I set the initial direction to `${direction}`

And I move the Mars Rover forward

Then the current position should be `${x},${y}`

### Examples

| direction | x   | y   |
| --------- | --- | --- |
| N         | 0   | -1  |
| S         | 0   | 1   |
| E         | 1   | 0   |
| W         | -   | 0   |
