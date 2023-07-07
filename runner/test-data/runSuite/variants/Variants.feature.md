---
variants:
  - nw: ltem
    modem: LTE-M
  - nw: nbiot
    modem: NB-IoT
---

# Using variants

> Variants (defined in the frontmatter of a feature) can be used to run the same
> feature in different variants. For every entry in variants, the feature file
> is run.  
> The properties defined per variant are available in using the `variant.<name>`
> placeholder.

## Scenario

Given network is `${variant.nw}` and modem is `${variant.modem}`
