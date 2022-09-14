# BDD Markdown [![npm version](https://img.shields.io/npm/v/@nordicsemiconductor/bdd-markdown.svg)](https://www.npmjs.com/package/@nordicsemiconductor/bdd-markdown)

[![Test and Release](https://github.com/coderbyheart/bdd-markdown/actions/workflows/test-and-release.yaml/badge.svg)](https://github.com/coderbyheart/bdd-markdown/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://api.mergify.com/v1/badges/coderbyheart/bdd-markdown)](https://mergify.io)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Write BDD tests in Markdown.

## Idea

Writing BDD tests should be more comfortable
[than this](https://github.com/NordicSemiconductor/cloud-e2e-bdd-test-runner-example-js/blob/ca4f6e8c517c13f1c88abfdb6426c8ed6fe730e7/features/Webhook.feature),
so why not use Markdown? It can look
[like this](./parser/test-data/feature/Example.feature.md).

- it is a well supported document format, many tools like auto-formatters
  already exist
- it provide good tools to structure a hierarchical document
- it has support for embedding source code / JSON payloads, and even tables
- front matter can be used for feature-level configuration

## Examples

- [Demo of supported syntax](./parser/test-data/feature/Example.feature.md)
- [Gherkin `Rule` keyword](./parser/test-data/feature/Highlander.feature.md)
- [Mars Rover Kata](./examples/mars-rover/MarsRover.feature.md) (this
  demonstrates the `Soon` keyword which retries steps)  
  Run: `npx tsx examples/mars-rover/tests.ts`
- [Firmware UART log assertions](./examples/firmware/)  
  Run: `npx tsx examples/firmware/tests.ts`

## Test eventual consistent systems using the `Soon` keyword

Let's have a look at this scenario:

```markdown
# To Do List

## Create a new todo list item

Given I create a new task named `My item`

Then the list of tasks should contain `My item`
```

What if you are testing a todo list system, that is eventually consistent?

More specifically: creating a new task happens through a `POST` request to an
API that returns a `202 Accepted` status code.

The system does not guarantee that task you've just created is _immediately_
available.

The `Then` assertion will fail, because it is executed immediately.

For testing eventual consistent systems, we need to either wait a reasonable
enough time or retry the assertion.

However, if there are many similar assertions in your test suite will quickly
add up to long run times.

Therefore the most efficient solution is to retry the assertion until it passes,
or times out. This way a back-off algorithm can be used to wait increasing
longer times and many tries during the test run will have the least amount of
impact on the run time.

The `Soon` keyword can be used to retry a step until a timeout is reached. It
can be configured through the `@retry` tag in a comment preceding the step, the
scenario. Pass one or multiple settings to override the default behavior.
Example: `@retry:tries=3,initialDelay=50,delayFactor=2`.

```markdown
---
# Configure the retry settings for the entire feature
retry:
  tries: 10
  initialDelay: 250
  delayFactor: 2
---

# To Do List

<!-- This @retry:tries=5 applies to all steps in the scenario. -->

## Create a new todo list item

Given I create a new task named `My item`

<!-- This @retry:tries=3,initialDelay=100,delayFactor=1.5 applies only to the next step. -->

Soon the list of tasks should contain `My item`
```
