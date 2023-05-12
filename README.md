# BDD Markdown [![npm version](https://img.shields.io/npm/v/@nordicsemiconductor/bdd-markdown.svg)](https://www.npmjs.com/package/@nordicsemiconductor/bdd-markdown)

[![Test and Release](https://github.com/NordicSemiconductor/bdd-markdown-js/actions/workflows/test-and-release.yaml/badge.svg)](https://github.com/NordicSemiconductor/bdd-markdown-js/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://api.mergify.com/v1/badges/NordicSemiconductor/bdd-markdown-js)](https://mergify.io)
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

## History

Work on the original BDD e2e feature runner began in 2018, and the project has
been proved very useful for testing cloud-native solutions. Read more about the
original idea
[here](https://github.com/NordicSemiconductor/cloud-e2e-bdd-test-runner-js#motivation).
However, the implementation had some shortcomings. Especially understanding test
results and the way state and retries were handled was not optimal. In addition
was the old codebase itself not sufficiently covered with tests. Therefore this
project was initiated in 2022, with four years of experience authoring and
running tests. With a fresh set of eyes, the way to write test was complete
changed from Gherkin to Markdown which called for releasing it as a standalone
project.

## Examples

- [Demo of supported syntax](./parser/test-data/feature/Example.feature.md)
- [Gherkin `Rule` keyword](./parser/test-data/feature/Highlander.feature.md)
- [Mars Rover Kata](./examples/mars-rover/MarsRover.feature.md) (this
  demonstrates the `Soon` keyword which retries steps)  
  Run:
  `$(set -o pipefail && npx tsx examples/mars-rover/tests.ts | npx tsx reporter/console-cli.ts)`
- [Firmware UART log assertions](./examples/firmware/RunFirmware.feature.md)
  (this demonstrates the use of the `Context`, which is a global object
  available to provide run-time settings to the test run, which replace
  placeholders in step titles and codeblocks.)  
  Run:
  `$(set -o pipefail && npx tsx examples/firmware/tests.ts | npx tsx reporter/console-cli.ts)`

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

## Control feature execution order via dependencies

By default the features are loaded in no particular order. You _may_ attempt to
order them using a naming convention, however this can enforce a forced ranking
of all features, and over time files might need to get renamed to make room for
new features.

In this project, features can specify a dependency to one or more other features
in their front matter, and after parsing all features files, they will be sorted
[topologically](https://en.wikipedia.org/wiki/Topological_sorting).

Features can define their dependencies via the `needs` keyword:

```markdown
---
needs:
  - First feature
---

# Second

## Scenario

Given this is the first step
```

This feature will be run after a feature with the name `First feature`

## Running features _first_ and _last_

In addition, features can specify whether they should be run before all other
features, or after all. Multiple keywords can have this flag, but dependencies
will take precedence.

### Example: running a feature before all others

```markdown
---
run: first
---

# Runs before all others

## Scenario

Given this is the first step
```

### Example: running a feature after all others:

```markdown
---
run: last
---

# Runs before all others

## Scenario

Given this is the first step
```

## Skipping features

Features can be skipped, this will also skip all dependent and transiently
dependent features.

### Example: skipping a feature

```markdown
---
run: never
---

# This feature never runs

## Scenario

Given this is the first step
```

## Running only specific features

Features can be run exclusively, this will also run all dependent and
transiently dependent features. All other features not marked as `run: only`
will be skipped.

### Example: running only a specific feature

```markdown
---
run: only
---

# This feature runs, all other features are skipped

## Scenario

Given this is the first step
```

## Markdown Reporter

It includes a markdown reporter, which will turn the suite result into markdown,
suitable for displaying it as
[GitHub Actions job summaries](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary).

Example: [Mars Rover Report](./reporter/test-data/mars-rover.md)
