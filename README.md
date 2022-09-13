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
- [Mars Rover Kata](./examples/mars-rover/MarsRover.feature.md)  
  Run: `npx tsx examples/mars-rover/tests.ts`
- [Firmware UART log assertions](./examples/firmware/)  
  Run: `npx tsx examples/firmware/tests.ts`
