---
variants:
  - nw: ltem
    modem: LTE-M
  - nw: nbiot
    modem: NB-IoT
exampleContext:
  tracker:
    ltem:
      id: some-device
    nbiot:
      id: some-device
---

# Using variants

> Variants (defined in the frontmatter of a feature) can be used to run the same
> feature in different variants. For every entry in variants, the feature file
> is run.  
> The properties defined per variant are available in using the `variant.<name>`
> placeholder.

## Scenario

Given network is `${variant.nw}` and modem is `${variant.modem}`

## Alternative placeholders

> These are useful in case variable placeholders need to be constructed.

Given network is `<variant.nw>` and modem is `<variant.modem>`

## Nested variant placeholders

Given the placeholder `<variant.nw>` is embedded in another placeholder:
`${tracker.<variant.nw>.id}/pgps/get`
