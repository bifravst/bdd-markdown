# :heavy_check_mark: Mars Rover

> Failed: 0  
> Passed: 1  
> Total: 1  
> Duration: ⏲ 2765 ms

## :heavy_check_mark: MarsRover.feature

### :heavy_check_mark: Move the rover forward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to 0,-1` _@ 102 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| N         | 0   | -1  |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 1 ms_  
  :fast_forward: `Rover created` _@ 1 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `N`

> _Result:_ `0,0 N`

:heavy_check_mark: **When** I move the Mars Rover `forward` 1 square

> _Result:_ `0,0 N`

:heavy_check_mark: **Soon** the current position should be `0,-1`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 2 ms_  
  :fast_forward: `Retrying ... (2)` _@ 254 ms_

</details>


---
### :heavy_check_mark: Move the rover forward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to 0,1` _@ 354 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| S         | 0   | 1   |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 254 ms_  
  :fast_forward: `Rover created` _@ 254 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `S`

> _Result:_ `0,0 S`

:heavy_check_mark: **When** I move the Mars Rover `forward` 1 square

> _Result:_ `0,0 S`

:heavy_check_mark: **Soon** the current position should be `0,1`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 255 ms_  
  :fast_forward: `Retrying ... (2)` _@ 506 ms_

</details>


---
### :heavy_check_mark: Move the rover forward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to 1,0` _@ 606 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| E         | 1   | 0   |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 506 ms_  
  :fast_forward: `Rover created` _@ 506 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `E`

> _Result:_ `0,0 E`

:heavy_check_mark: **When** I move the Mars Rover `forward` 1 square

> _Result:_ `0,0 E`

:heavy_check_mark: **Soon** the current position should be `1,0`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 507 ms_  
  :fast_forward: `Retrying ... (2)` _@ 757 ms_

</details>


---
### :heavy_check_mark: Move the rover forward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to -1,0` _@ 858 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| W         | -1  | 0   |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 758 ms_  
  :fast_forward: `Rover created` _@ 758 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `W`

> _Result:_ `0,0 W`

:heavy_check_mark: **When** I move the Mars Rover `forward` 1 square

> _Result:_ `0,0 W`

:heavy_check_mark: **Soon** the current position should be `-1,0`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 758 ms_  
  :fast_forward: `Retrying ... (2)` _@ 1009 ms_

</details>


---
### :heavy_check_mark: Move the rover backward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to 0,1` _@ 1109 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| N         | 0   | 1   |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 1009 ms_  
  :fast_forward: `Rover created` _@ 1009 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `N`

> _Result:_ `0,0 N`

:heavy_check_mark: **When** I move the Mars Rover `backward` 1 square

> _Result:_ `0,0 N`

:heavy_check_mark: **Soon** the current position should be `0,1`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 1009 ms_  
  :fast_forward: `Retrying ... (2)` _@ 1260 ms_

</details>


---
### :heavy_check_mark: Move the rover backward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to 0,-1` _@ 1360 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| S         | 0   | -1  |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 1260 ms_  
  :fast_forward: `Rover created` _@ 1260 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `S`

> _Result:_ `0,0 S`

:heavy_check_mark: **When** I move the Mars Rover `backward` 1 square

> _Result:_ `0,0 S`

:heavy_check_mark: **Soon** the current position should be `0,-1`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 1260 ms_  
  :fast_forward: `Retrying ... (2)` _@ 1511 ms_

</details>


---
### :heavy_check_mark: Move the rover backward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to -1,0` _@ 1611 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| E         | -1  | 0   |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 1511 ms_  
  :fast_forward: `Rover created` _@ 1511 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `E`

> _Result:_ `0,0 E`

:heavy_check_mark: **When** I move the Mars Rover `backward` 1 square

> _Result:_ `0,0 E`

:heavy_check_mark: **Soon** the current position should be `-1,0`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 1511 ms_  
  :fast_forward: `Retrying ... (2)` _@ 1761 ms_

</details>


---
### :heavy_check_mark: Move the rover backward

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to 1,0` _@ 1862 ms_

</details>

<details>
  <summary>Input</summary>
  
| direction | x   | y   |
| --------- | --- | --- |
| W         | 1   | 0   |

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 1762 ms_  
  :fast_forward: `Rover created` _@ 1762 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `W`

> _Result:_ `0,0 W`

:heavy_check_mark: **When** I move the Mars Rover `backward` 1 square

> _Result:_ `0,0 W`

:heavy_check_mark: **Soon** the current position should be `1,0`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 1762 ms_  
  :fast_forward: `Retrying ... (2)` _@ 2012 ms_

</details>


---
### :heavy_check_mark: Hit an obstacle

<details>
  <summary>Scenario log</summary>
  
  :fast_forward: `Rover Moving to 0,-1` _@ 2113 ms_  
  :fast_forward: `Rover Moving to 0,-2` _@ 2213 ms_  
  :fast_forward: `Rover Moving to 0,-3` _@ 2313 ms_  
  :fast_forward: `Rover Moving to 0,-4` _@ 2413 ms_

</details>

:heavy_check_mark: **Given** I have a Mars Rover

<details>
  <summary>Step log</summary>
  
  :fast_forward: `Creating a new rover` _@ 2012 ms_  
  :fast_forward: `Rover created` _@ 2012 ms_

</details>

> _Result:_ `undefined,undefined undefined`

:heavy_check_mark: **Given** there is an obstacle at `0,-5`

:heavy_check_mark: **When** I set the initial starting point to `0,0`

> _Result:_ `0,0 undefined`

:heavy_check_mark: **When** I set the initial direction to `N`

> _Result:_ `0,0 N`

:heavy_check_mark: **When** I move the Mars Rover `forward` 10 squares

> _Result:_ `0,0 N`

:heavy_check_mark: **Soon** the current position should be `0,-4`

<details>
  <summary>Step log</summary>
  
  :zap: `@retry:tries=5,initialDelay=250,delayFactor=2` _@ 2013 ms_  
  :fast_forward: `Retrying ... (2)` _@ 2263 ms_  
  :fast_forward: `Retrying ... (3)` _@ 2764 ms_

</details>

:heavy_check_mark: **Then** the Mars Rover should report an obstacle at `0,-5`

<details>
  <summary>Step log</summary>
  
  :zap: `knownObstacles [[0,-5]]` _@ 2765 ms_

</details>


