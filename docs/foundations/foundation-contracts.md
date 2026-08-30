# Phase 2C foundation contracts

**Status:** Accepted for Phase 2C on July 29, 2026. The delivery model is recorded in
[ADR 0011](../architecture/adr/0011-foundation-delivery-model.md).

**Implementation:** The public utility stylesheet, `wg-surface`, `wg-divider`, tokens, framework
exports, stories, and automated browser coverage are implemented. Evidence is recorded in the
[Phase 2C foundation substrate validation](../accessibility/phase-2c-foundations-validation.md). The
`wg-icon` Stage 4A runtime core now implements this accepted API over authenticated generated data
with unit and package-boundary coverage. Its complete browser, accessibility, visual, and Storybook
evidence remains the next Stage 4B boundary.

The icon API below remains authoritative after the accepted
[`@wayglass/icons` runtime-contract reconciliation](../governance/icon-runtime-contract-reconciliation.md).
The current private package remains unreleased while its Stage 4 validation is completed.

These contracts cover the remaining behaviorless or near-behaviorless foundations: typography,
icons, visually hidden content, focus rings, surfaces, and dividers. They define the public boundary
before token additions or component implementation begin.

## Delivery boundary

Not every foundation should become a Custom Element.

- Typography, visually hidden content, and consumer focus rings are opt-in classes in a public
  `@wayglass/elements/foundations.css` stylesheet. They style the element that already owns the
  correct native semantics.
- `wg-surface` and `wg-divider` are small, inert Custom Elements in `@wayglass/elements` because
  they provide stable rendered structure, theme integration, and a typed declarative API.
- `wg-icon` and the official icon catalog belong to the optional `@wayglass/icons` package.

None of these foundations owns application state, selection, navigation, or domain meaning.
Importing a JavaScript module does not register a Custom Element.

### Client-only fallback

The utility stylesheet works without JavaScript. Before Custom Elements upgrade, `wg-surface` leaves
its light-DOM content visible and in source order. An unupgraded divider or icon may be visually
absent, so neither may be the only source of grouping, state, instructions, or an accessible name.
No foundation requires Declarative Shadow DOM or server rendering for correctness.

### Imports and registration

Utilities are available through the explicit stylesheet export:

```css
@import '@wayglass/elements/foundations.css';
```

Custom Element modules remain side-effect free:

```ts
import { defineWgDivider } from '@wayglass/elements/divider';
import { defineWgSurface } from '@wayglass/elements/surface';

defineWgSurface();
defineWgDivider();
```

## Typography

### Purpose

Typography classes apply the accepted humanist hierarchy without replacing native headings,
paragraphs, labels, lists, data tables, or landmarks.

### Public classes

| Class                     | Intended role                                     | Token treatment                                                                   |
| ------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `wg-type-title`           | Page or function title                            | Display family, title size, compact line height, emphasis weight                  |
| `wg-type-section`         | Section heading                                   | Display family, section size, compact line height, emphasis weight                |
| `wg-type-body`            | Default prose and interface content               | Body family, body size, body line height, regular weight                          |
| `wg-type-label`           | Field, control, and compact structural label      | Body family, label size, compact line height, medium weight                       |
| `wg-type-metadata`        | Time, provenance, and secondary supporting detail | Body family, metadata size, body line height, regular weight                      |
| `wg-type-value`           | Compact numeric value or identifier               | Numeric family, compact value size, compact line height, emphasis, tabular nums   |
| `wg-type-value-prominent` | Deliberately prominent wall-display value         | Numeric family, prominent value size, compact line height, emphasis, tabular nums |

The classes set no margins, display mode, text alignment, color, role, or heading level. A title
must still use the correct `h1`–`h6` element. Prominent value treatment is selected by content
importance, not inferred from viewport width.

Arbitrary font sizes and weights remain outside the supported contract. Consumer themes may replace
the family and scale tokens while preserving hierarchy and legibility.

### Accessibility and responsive requirements

- Body text remains at least the browser's default `1rem` baseline.
- Text reflows without clipping at 200% zoom and enlarged text settings.
- Numeric values use tabular numerals where changing width would harm scanning or layout stability.
- Metadata cannot be the only place that critical state or required instructions appear.
- Wall-display typography may become more prominent through tokens or the explicit prominent-value
  class; it must not encode different semantics.

## Icons

### Purpose

`wg-icon` renders an official, local SVG glyph as optional reinforcement for an action, value, or
concept. Wayglass remains understandable without icons.

### Package and registration

`wg-icon` is exported by `@wayglass/icons/icon`. The package owns a reviewed, domain-neutral catalog
and may expose tree-shakable catalog subpaths. It does not accept remote URLs, arbitrary SVG markup,
or icon-font code points.

Importing the module does not register the element:

```ts
import { defineWgIcon } from '@wayglass/icons/icon';

defineWgIcon();
```

### API

#### Attributes and properties

- `name: string`: official catalog identifier; required for a rendered glyph.
- `label: string`: optional accessible name.
- `size: compact | standard | prominent`; default `standard`.
- `direction: auto | ltr | rtl`; default `auto`. Only catalog entries explicitly marked as
  directional mirror in automatic right-to-left contexts.

An absent label makes the icon decorative and removes it from the accessibility tree. A non-empty
label exposes one image with that accessible name after upgrade. `wg-icon` is never focusable and
emits no events. Required accessible names remain on the owning native or Wayglass control so
client-only fallback does not depend on icon upgrade.

#### Slots

None.

#### CSS parts

- `svg`

#### CSS custom properties

- `--wg-icon-color`
- `--wg-icon-size`

The default color is `currentColor`. Forced-colors mode preserves the current system text color.

The package root is a side-effect-free convenience barrel for the same symbols exported by
`@wayglass/icons/icon`; it is not a second implementation. Invalid `size` and `direction` attributes
normalize to their documented defaults. A missing or unknown `name` remains decorative and renders
nothing even when a label is present, so an inaccessible or misleading phantom image is not exposed.

### Content rules

- State, value, and action meaning must remain available in text or the owning control's accessible
  name.
- An icon beside visible text is decorative.
- A future icon-only control owns its accessible name; its child icon remains decorative.
- The official foundation catalog does not include domain assets such as lamps, doors, appliances,
  brands, or franchise-specific symbols.
- Missing or unknown icon names render no misleading fallback glyph and do not remove adjacent text.

## Visually hidden content

### Purpose

The public utilities visually conceal content while retaining it in document order and the
accessibility tree.

### Public classes

- `wg-visually-hidden`: keeps non-interactive explanatory content available to assistive technology.
- `wg-visually-hidden-until-focus`: hides a focusable skip link or equivalent control until it
  receives keyboard focus.

These classes do not replace `hidden`, `aria-hidden`, or conditional rendering:

- use `hidden` when content must be absent from everyone;
- use `aria-hidden="true"` only when equivalent accessible meaning already exists;
- never apply `wg-visually-hidden` to an interactive element because invisible focus is a failure;
- use the focus-revealed variant only when the element becomes fully visible on `:focus-visible`.

The clipping dimensions are private mechanical constants, not public design tokens.

## Focus ring

### Purpose

`wg-focus-ring` gives a consumer-authored native control the same visible keyboard-focus treatment
as Wayglass components.

### Contract

- The class applies an outline only through `:focus-visible`.
- It does not set `tabindex`, a role, cursor behavior, or interaction semantics.
- The ring uses `--wg-color-semantic-focus-ring`, `--wg-focus-width`, and `--wg-focus-offset`.
- Consumers may override `--wg-focus-ring-color`, `--wg-focus-ring-width`, and
  `--wg-focus-ring-offset` locally without removing visibility.
- Forced-colors mode uses the system `Highlight` color.
- Disabled or inert content does not gain focus merely because the class is present.

Custom Elements continue to implement their focus treatment inside Shadow DOM from the same semantic
tokens. The utility class is not a mechanism for styling through a component's shadow boundary.

## Surface

### Purpose

`wg-surface` provides neutral contained background, boundary, radius, and edge padding without
implying section purpose, application state, or landmark semantics.

Use it to establish visual containment when `wg-panel` would incorrectly imply an information,
monitor, or control section. Do not use it as a generic wrapper around every block or as a
substitute for `wg-canvas`, `wg-frame`, functional zoning, or a semantic section element.

### API

#### Attributes and properties

- `tone: panel | inset | raised`; default `panel`.
- `boundary: none | subtle | strong`; default `subtle`.
- `padding: none | compact | comfortable`; default `comfortable`.

Tone communicates depth and containment only. It never means positive, caution, critical, selected,
enabled, or disabled. Strong boundaries are reserved for containment that must remain obvious
without color or elevation.

#### Slots

- default

#### CSS parts

- `base`

#### CSS custom properties

- `--wg-surface-color-background`
- `--wg-surface-color-border`
- `--wg-surface-radius`
- `--wg-surface-padding`
- `--wg-surface-elevation`

#### Events and methods

None.

### Semantics and behavior

`wg-surface` adds no role, accessible name, focus stop, container query, scrolling, or layout mode.
Consumers place native `section`, `aside`, `article`, or landmark elements inside or around it when
those semantics are required. Content order and meaning remain intact if surface styling is removed.

Forced-colors mode retains a visible boundary and uses system canvas colors. Themes may
substantially change brightness, radius, and elevation while preserving containment strength.

## Divider

### Purpose

`wg-divider` separates related groups inside one function or section. It is weaker than a function
boundary and must not be used to repair ambiguous ownership.

### API

#### Attributes and properties

- `orientation: horizontal | vertical`; default `horizontal`.
- `weight: standard | strong`; default `standard`.
- `decorative: boolean`; default `false`.

#### Slots

None.

#### CSS parts

- `line`

#### CSS custom properties

- `--wg-divider-color`
- `--wg-divider-size`

#### Events and methods

None.

### Semantics and behavior

By default the host exposes `role="separator"` and the matching `aria-orientation`. The `decorative`
attribute removes separator semantics and sets `aria-hidden="true"` when nearby structure already
communicates the grouping.

The divider is never focusable and carries no condition, selection, value, or activity meaning. Its
line uses logical sizing where possible, remains visible in forced colors, and introduces no
implicit margin; layout primitives own surrounding space.

## Token additions required by implementation

Implementation will review and lock only the additional public roles required by these contracts:

- icon size roles;
- surface background, boundary, radius, padding, and elevation aliases;
- divider color and thickness aliases;
- local focus-ring override aliases.

Existing typography, semantic surface, border, focus, spacing, and density tokens are reused where
their meanings already fit. Visually hidden clipping values remain private. The implementation audit
replaced prior uses of the undefined `--wg-typography-size-page-title` and
`--wg-typography-size-section-title` aliases with the accepted `title` and `section` token paths.

## Validation requirements

The implementation gate must cover:

- native semantics remaining intact with and without utility classes;
- no unexpected focus stops, roles, events, or layout ownership;
- icon decorative and labeled modes, missing names, and right-to-left directional behavior;
- surface and divider normalization, logical sizing, and forced-colors boundaries;
- dark and light themes, compact and comfortable density, 200% zoom, enlarged text, and
  phone/desktop/wall fixtures;
- framework-neutral registration and typed React wrappers for Custom Elements;
- Chromium, Firefox, and WebKit.

## Deferred decisions

- The initial official icon catalog is selected with the Phase 2D controls that consume it.
- Product and domain icon catalogs remain consumer-owned.
- Layout spacing and responsive composition belong to the next Phase 2C layout-contract decision.
