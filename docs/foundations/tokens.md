# Design tokens

The Phase 1 token set is locked as the implementation vocabulary for the first vertical slice. Phase
2 adds reviewed token groups before their components are implemented. A lock means component work
must consume these tokens and proposed changes require review, tests, and updated documentation. It
is not yet a public compatibility promise.

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
- Selection has its own indicator, surface, and text roles. It does not borrow condition, Boolean
  value, activity, or action meaning even when a theme maps roles to the same reference hue.

## Phase 2A selection and tabs

The Phase 2A selection roles are:

- `color.semantic.selection.indicator`: redundant selected-view emphasis;
- `color.semantic.selection.surface`: the shared surface joined to the selected view;
- `color.semantic.selection.text`: selected-view text.

The tabs contract locks component tokens for tab-list spacing; default and selected backgrounds;
boundary, text, and selection colors; radius; density-aware padding; minimum target size; selection
indicator thickness; and tab-panel background, boundary, radius, and padding.

Dark and light themes may choose different selection-indicator references. Both preserve selection
as blue selection emphasis rather than healthy condition. Forced-colors mode maps selection to
system `Highlight`, `Canvas`, and `CanvasText` roles.

## Themes

The generated `:root` values form the Wayglass Dark baseline. `@wayglass/themes/themes.css` provides
explicit Wayglass Dark and Wayglass Light selectors plus compact and comfortable density overrides.
Themes replace semantic and component aliases rather than component CSS. Both implemented themes
preserve tested contrast, functional boundaries, asserted-value luminance, focus visibility, and
state meaning.

Wayglass High Contrast and Wayglass Dim remain planned; they are not reported as implemented themes.

## Phase 2F modal content and media inspection

Phase 2F adds `color.semantic.modal.backdrop` as the shared meaning for inert-document separation
behind a native modal. It does not create a universal overlay API. Confirmation, content dialogs,
and media viewers retain separate component token groups because their anatomy and content capacity
differ.

The `component.dialog.*` group defines modal surface, boundary, text, close-control, radius,
density-aware spacing, viewport inset, compact/standard/wide content capacities, minimum close
target, elevation, and optional entry motion. The `component.media-viewer.*` group separately
defines the inspection surface and viewport, control states, caption/detail text, spacing, large
display capacity, preferred viewport minimum, control targets, elevation, and optional motion.

Zoom steps, intrinsic-image calculations, scroll positions, focus mechanics, and coordinator state
remain private implementation constants or runtime values. Making them tokens would imply visual
customization where behavioral consistency is required.

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

A locked token change must:

- preserve or deliberately amend its documented semantic role;
- update compiler tests and generated artifacts;
- be checked in dark and light themes;
- be reviewed in compact, comfortable, phone, desktop, and wall-panel fixtures;
- avoid adding a public token for a private mechanical constant.
