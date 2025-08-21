---
needs:
  - Update Context
exampleContext:
  randomString: some value
  cognitoUser:
    idToken: eyJraWQiOiJndmxxx
---

# Read Context

## Scenario that reads the updated context

Then `${randomString}` should not be empty

And `${cognitoUser.idToken}` should be replaced in the step

And it should be replaced in this JSON

```json
{
  "aStringParameter": "${randomString}",
  "aNestedParameter": "${cognitoUser.idToken}"
}
```
