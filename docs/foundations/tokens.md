# Phase 1 design tokens

The Phase 1 token set is locked as the implementation vocabulary for the first vertical slice. The
lock means component work must consume these tokens and proposed changes require review, tests, and
updated documentation. It is not yet a public compatibility promise.

## Layers

Wayglass uses four layers:

1. **Reference** values define palette and scale inputs such as `color.reference.blue.500` and
   `space.reference.4`.
2. **Semantic** values define meaning such as `color.semantic.condition.critical`,
   `color.semantic.value.asserted`, and `space.semantic.function.gutter`.
3. **Component** values adapt semantic values to a public component contract such as
   `component.button.size.minimum`.
4. **Mode overrides** replace semantic or component values for theme, density, contrast, or reduced
   motion without changing their meaning.

Production components consume component tokens first and semantic tokens when no useful
component-specific role exists. They do not consume reference palette values directly.

## Semantic boundaries

- Condition, knowledge, activity, and Boolean value each have separate color roles.
- Stoplight colors remain condition or attention colors.
- Asserted and not-asserted colors carry no health meaning.
- Structural rail and elbow colors are neutral.
- Functional separation uses boundary, spacing, and structure tokens rather than condition color.
- Information, monitor, and control section roles receive purpose-specific neutral or action
  associations without borrowing condition meaning.

## Themes

The generated `:root` values form the Wayglass Dark baseline. Wayglass Light will override semantic
and component aliases rather than change component CSS. Both themes must preserve contrast,
functional boundaries, asserted-value luminance, focus visibility, and state meaning.

## CSS names

Token paths compile deterministically to `--wg-` custom properties:

```text
color.semantic.condition.critical
→ --wg-color-semantic-condition-critical

component.boolean-value.size.rail
→ --wg-component-boolean-value-size-rail
```

Component contracts expose shorter local custom properties, such as `--wg-boolean-value-size-rail`,
whose defaults point to the generated component tokens.

## Change policy

A Phase 1 token change must:

- preserve or deliberately amend its documented semantic role;
- update compiler tests and generated artifacts;
- be checked in dark and light themes;
- be reviewed in compact, comfortable, phone, desktop, and wall-panel fixtures;
- avoid adding a public token for a private mechanical constant.
