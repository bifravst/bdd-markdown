# Update Context

> Steps may update the context and the updated context should be available in
> the following scenarios and steps

## Scenario that updates the context

Given I store a random string in `randomString`

## Scenario that reads the updated context

Then `${randomString}` should not be empty

And it should be replaced in this JSON

```json
{
  "aStringParameter": "${randomString}"
}
```
