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

<!-- The parser will extract all values in backticks and provide them in a list. -->

When I add `4`

And I add `5`

Then the result is `9`
