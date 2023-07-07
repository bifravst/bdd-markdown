---
info: front-matter should be supported for feature-level settings
tags:
  - first
variants:
  - nw: ltem
    nw-modem: LTE-M
  - nw: nbiot
    nw-modem: NB-IoT
---

# Example feature

> This is a description for the feature, which can span multiple lines. This
> paragraph is intentionally very long so we hit the prettier auto-format
> wrapping the long line.
>
> And line-breaks should be allowed in the description.

<!-- Comments on separate lines are supported. They will be associated with the following keyword. -->

## The first scenario

> This is a description for the scenario, which can span multiple lines. This
> paragraph is intentionally very long so we hit the prettier auto-format
> wrapping the long line.
>
> And line-breaks should be allowed in the description.

<!-- Comments can also precede steps and they will be associated with them. -->

Given a calculator

When I add `4`

And I add `5`

Then the result is `9`

## Verify that a webhook request was sent using the REST client

When I POST to `${webhookReceiver}/hook` with this JSON

```json
{ "foo": "bar" }
```

<!-- This is the response from API Gateway -->

Then the response status code should be `202`

## Scenario Outline: eating

Given there are `${start}` cucumbers

When I eat `${eat}` cucumbers

Then I should have `${left}` cucumbers

### Examples

| start | eat | left |
| ----- | --- | ---- |
| 12    | 5   | 7    |
| 20    | 5   | 15   |
