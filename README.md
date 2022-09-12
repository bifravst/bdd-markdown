# BDD Markdown

[![Test](https://github.com/coderbyheart/bdd-markdown/actions/workflows/test.yaml/badge.svg)](https://github.com/coderbyheart/bdd-markdown/actions/workflows/test.yaml)
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
