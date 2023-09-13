---
variants:
  - nw: ltem
---

# Ignore unreplaced placeholders

> The suite walker should ignore unreplaced placeholders in code blocks because
> they are not used to match step runners

## Scenario

Given network is `${variant.nw}`

```json
{
  "thingName": "${variant.name}"
}
```
