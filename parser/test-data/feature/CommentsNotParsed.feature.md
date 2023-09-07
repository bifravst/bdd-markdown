# Feature with broken comments

> The comments in Scenario 2 should should be parsed

## Scenario 1

> This enqueues a mock response on the mock HTTP API the stack is configure to
> use for the nRF Cloud integration

Given I have a random number between `1` and `100000000` in `cellId`

<!-- Comments on the last step should be parsed for the next scenario. @retryScenario -->

## Scenario 2

Given I store `$millis()` into `ts`
