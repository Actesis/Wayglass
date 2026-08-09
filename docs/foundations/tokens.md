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

## Phase 3B scalar data

Phase 3B adds `color.semantic.data.change` for a neutral operational-change signal. Dark and light
themes may map it to different hues or contrast levels, but rising, falling, steady, mixed, and
absent direction all use the same role. Trend direction never borrows positive, caution, or critical
color; an application-supplied condition remains a separate cue.

The `component.metric-group.*` group defines its neutral contained surface, boundary, heading and
description text, radius, density-aware edge and item spacing, and preferred scalar-item measure.
The `component.trend-indicator.*` group defines neutral signal, text and state colors, direction
geometry measures, and density-aware spacing. The `component.key-value.*` group defines label,
value, and state text, density-aware spacing, and the preferred aligned label measure.

Direction geometry, line angle, wrapping threshold, loading text, child counting, and grid column
count remain private mechanical behavior. Exposing them as tokens would imply visual customization
or application policy that the contracts do not support.

## Phase 3C compact telemetry

The `component.telemetry-strip.*` group defines the contained and inset graphic surfaces, routine
boundary, heading and current-value text, neutral single-series color, context and state text,
surface radius, density-aware spacing, preferred graphic block size, and non-scaling series stroke.
Observation knowledge continues to use the shared `color.semantic.knowledge.*` roles rather than a
second telemetry-specific state palette.

Dash patterns, normalized coordinates, path grouping, point radius, boundary placement, and gap-mark
height remain private mechanical constants. Those values preserve the accepted non-color language
and rendering performance; exposing them would allow themes to make knowledge states ambiguous or
turn the compact overview into a general chart API.

## Phase 3D status collections

The `component.status-list.*` group defines the neutral contained collection surface, routine
boundary, heading and context text, radius, density-aware section spacing, and separation between
authored entries. The `component.status-entry.*` group defines the inset entry surface, routine
boundary, primary and supporting text, shared known-state and condition roles, compact signal
boundary and size, radii, and density-aware internal spacing.

Condition signals and pending signal emphasis continue to use their shared semantic color roles.
State words use the contrast-safe status-entry text role; knowledge also retains fixed non-color
signal-border distinctions. This prevents graphic-support colors from becoming low-contrast text
without creating a second state palette. Entry row geometry, responsive wrap thresholds, state-label
copy, authored-action layout, child validation, focus recovery, and mutation behavior remain private
mechanics or application responsibilities. Exposing them as tokens would allow themes to change
semantics or imply behavioral customization that the contracts do not support.

## Phase 3E temporal collections

The `component.timeline.*` group defines the neutral contained timeline surface, boundary, heading
and chronology context, radius, density-aware section spacing, and separation between curated items.
The `component.timeline-item.*` group defines primary and supporting text, contrast-safe known-state
text, occurrence condition and signal boundary, direction-neutral sequence geometry, signal radius
and size, sequence width, and density-aware internal spacing.

The `component.event-log.*` group defines the neutral contained event-stream surface, boundary,
heading and chronology context, radius, density-aware section spacing, and compact record
separation. The `component.event-record.*` group defines the inset record surface, routine boundary,
primary summary and supporting text, contrast-safe known-state text, occurrence condition and signal
boundary, radii, compact signal size, and density-aware internal spacing.

Occurrence signals reuse `color.semantic.condition.*`; non-default knowledge and activity continue
to use their shared semantic roles. The timeline sequence uses a neutral strong-boundary role rather
than condition or change color, so the line never implies severity, health, causality, or current
source state. State words use contrast-safe component text roles rather than graphic-support colors.

Sequence placement, marker attachment, interval geometry, responsive thresholds, field-column
layout, state-label copy, authored chronology, native disclosure behavior, scroll position,
follow-latest policy, and unseen-record calculation remain private mechanics or application
responsibilities. Exposing them as tokens would allow themes to change semantics or imply behavioral
customization that the accepted contracts do not support.

## Phase 3F filter and command compositions

The `component.filter-bar.*` and `component.command-bar.*` groups define neutral contained surfaces,
routine boundaries, heading and supporting-context text, panel radii, density-aware section spacing,
and spacing between related control groups. Both use the same semantic foundation while remaining
separate component namespaces so substantial brand adaptation does not collapse their different
native form and immediate-command ownership.

Child controls continue to use their existing form, button, menu, focus, pending, disabled, and
feedback tokens. Applied-filter summaries and durable command outcomes remain authored content; they
do not receive a new state palette. Responsive thresholds, control priority, command migration,
overflow calculation, form layout, result count, busy state, and announcement delivery remain
private mechanics or application policy. Exposing them as tokens would imply behavior or ownership
that the accepted Phase 3F contract explicitly excludes.

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
