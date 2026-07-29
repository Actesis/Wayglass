# Phase 2C layout contracts

**Status:** Proposed for Phase 2C review on July 29, 2026. The responsive delivery model is recorded
in [ADR 0012](../architecture/adr/0012-layout-primitives-and-container-responsiveness.md).

These contracts cover the remaining layout primitives: frame, stack, cluster, grid, split, and
scroll region. They arrange consumer-authored content without taking ownership of its meaning,
state, or interaction.

## Shared layout model

All six primitives are side-effect-free Custom Element modules in `@wayglass/elements`. Importing a
module does not register its element. Each module exports its element class, tag name, public value
types and validators, and an explicit registration function.

The primitives preserve light-DOM source order and expose no application events. Except for an
overflowing scroll region, they add no roles or focus stops. Consumer-authored headings, sections,
landmarks, controls, and accessible relationships retain their native semantics.

Before upgrade, content remains visible and in source order. The intended arrangement and scrolling
constraint may be absent, so correctness must not depend on visual position, columns, or clipping.
Applications may include future package-provided fallback display rules to reduce layout movement,
but fallback CSS must not hide content or duplicate component internals.

### Semantic spacing

`wg-stack`, `wg-cluster`, `wg-grid`, and `wg-split` share a `space` attribute:

| Value      | Meaning                                                        |
| ---------- | -------------------------------------------------------------- |
| `none`     | No component-owned gap                                         |
| `related`  | Closely related items inside one local group                   |
| `section`  | Distinct groups or sections inside one function                |
| `function` | Independent functional zones that need unmistakable separation |

The values express relationships, not fixed measurements. Themes and density modes may change their
measure while preserving the ordering `none < related < section <= function`. A function gap alone
does not create a function boundary; independent functions still require identity and containment.

The primitives do not accept arbitrary gap attributes. A deliberate composition may override the
documented component gap custom property, but repeated exceptions indicate that the shared semantic
scale should be revised.

### Alignment

Where alignment is public, values use logical terms:

- `start`
- `center`
- `end`
- `stretch`

`wg-cluster` additionally supports `baseline`. Justification supports `start`, `center`, `end`, and
`between`. No primitive visually reverses source order.

### Responsive rules

- Grid and split decisions respond to their own available inline size through container queries, not
  the viewport.
- Responsive changes recompose content; they do not shrink text or controls to preserve columns.
- Narrow arrangements preserve DOM, reading, and focus order.
- Content may wrap or stack earlier at 200% zoom or with enlarged text.
- No primitive hides overflow, state, instructions, or actions as a responsive strategy.
- Phone, desktop, and wall-display fixtures use the same markup and semantic spacing roles.

## Frame

### Purpose

`wg-frame` establishes the strong neutral boundary and responsive container for exactly one
functional zone. It is the layout counterpart to a visible function identity supplied by consumer
content.

Use a frame around one function when neighboring functions appear simultaneously. Do not use it for
an unnamed card, an internal information/monitor/control section, or as a substitute for `wg-panel`,
`wg-surface`, or a native landmark.

### API

#### Attributes and properties

- `boundary: standard | strong`; default `standard`.
- `padding: none | compact | comfortable`; default `comfortable`.

#### Slots

- default

#### CSS parts

- `base`

#### CSS custom properties

- `--wg-frame-color-background`
- `--wg-frame-color-border`
- `--wg-frame-border-size`
- `--wg-frame-radius`
- `--wg-frame-padding`

#### Events and methods

None.

### Semantics and responsive behavior

The frame adds no role or accessible name. Its content must contain or be associated with a visible
function heading, and applications add `section`, `article`, or landmark semantics where
appropriate. A frame must not combine unrelated functions.

The host establishes the named inline-size container `wg-frame`. Its neutral boundary remains
visible in forced colors and does not use condition color. Padding may become more compact through
density tokens but never changes content meaning or target size.

## Stack

### Purpose

`wg-stack` arranges a sequence vertically in source order with one semantic block-axis gap.

Use it for headings and content, form-like sequences, or vertically grouped sections. Do not use it
when inline wrapping, two-dimensional alignment, independent function containment, or scrolling is
the actual requirement.

### API

#### Attributes and properties

- `space: none | related | section | function`; default `section`.
- `align: start | center | end | stretch`; default `stretch`.

#### Slots

- default

#### CSS parts

- `base`

#### CSS custom properties

- `--wg-stack-space`

#### Events and methods

None.

### Semantics and responsive behavior

The stack adds no semantics, separators, margins, minimum item size, or wrapping. Slotted children
remain block-axis items in DOM order. Consumer margins are not collapsed through the stack; the gap
is the supported rhythm.

## Cluster

### Purpose

`wg-cluster` arranges a wrapping inline group whose members have a peer relationship, such as
actions, short metadata, tags, or compact status summaries.

Do not use a cluster for navigation or selection semantics, data that requires row/column
association, or controls whose order must change at narrow widths.

### API

#### Attributes and properties

- `space: none | related | section | function`; default `related`.
- `align: start | center | end | stretch | baseline`; default `center`.
- `justify: start | center | end | between`; default `start`.

#### Slots

- default

#### CSS parts

- `base`

#### CSS custom properties

- `--wg-cluster-space`

#### Events and methods

None.

### Semantics and responsive behavior

The cluster wraps rather than introducing horizontal page overflow. It never opts children out of
wrapping, truncates them, or changes their order. Controls keep their component-defined minimum
target sizes. `justify="between"` distributes a line's remaining space but does not force a
single-line composition.

## Grid

### Purpose

`wg-grid` creates an adaptive set of equal-priority columns for repeated peer content such as value
tiles, section summaries, or function previews.

Do not use it for tabular data, unequal primary/secondary regions, masonry packing, or a layout
whose column position conveys meaning not present in source order.

### API

#### Attributes and properties

- `space: none | related | section | function`; default `section`.
- `minimum: compact | standard | wide`; default `standard`.
- `align: start | center | end | stretch`; default `stretch`.

#### Slots

- default

#### CSS parts

- `base`

#### CSS custom properties

- `--wg-grid-space`
- `--wg-grid-item-minimum`

#### Events and methods

None.

### Semantics and responsive behavior

The grid uses as many equal flexible columns as fit without making an item narrower than its
selected semantic minimum. `compact`, `standard`, and `wide` describe content capacity rather than
device classes. When one column cannot satisfy the minimum, it becomes full width instead of causing
page overflow.

The component does not expose a fixed column count, named placement, dense packing, or visual order.
Applications needing a fixed data matrix use a table; applications needing a bespoke editorial grid
use consumer CSS.

## Split

### Purpose

`wg-split` arranges exactly two related regions side by side when both can remain usable, then
stacks them in source order when space is constrained.

Use it for a primary working region with supporting context, or two related regions that benefit
from comparison. Do not use it to separate independent functions, reorder content, or force a
sidebar to remain beside unreadably narrow content.

### API

#### Attributes and properties

- `space: none | related | section | function`; default `section`.
- `ratio: equal | primary | secondary`; default `equal`.
- `minimum: compact | standard | wide`; default `standard`.
- `align: start | center | end | stretch`; default `stretch`.

`ratio="primary"` gives the primary region more available inline space; `secondary` gives the
secondary region more. Ratio changes prominence, not source or focus order.

#### Slots

- `primary`
- `secondary`

#### CSS parts

- `base`
- `primary`
- `secondary`

#### CSS custom properties

- `--wg-split-space`
- `--wg-split-region-minimum`
- `--wg-split-primary-ratio`
- `--wg-split-secondary-ratio`

#### Events and methods

None.

### Semantics and responsive behavior

Both named regions are required. Primary precedes secondary in DOM, reading, and focus order. Inline
placement follows writing direction. The split stacks when its own container cannot preserve the
selected minimum for both regions plus the gap. It exposes no author breakpoint and never overlays
or hides the secondary region.

## Scroll region

### Purpose

`wg-scroll-region` constrains intentionally scrollable content while keeping that boundary
discoverable and keyboard operable.

Use it for a bounded event history, code/data surface, or another region that must retain
surrounding context. Do not use it for the page's normal document scroll, to conceal content for
visual tidiness, or as a substitute for pagination, disclosure, or virtualization.

### API

#### Attributes and properties

- `axis: block | inline | both`; default `block`.
- `label: string`; required whenever overflow can occur.

#### Slots

- default

#### CSS parts

- `content`

#### CSS custom properties

- `--wg-scroll-region-max-block-size`
- `--wg-scroll-region-max-inline-size`
- `--wg-scroll-region-color-border`
- `--wg-scroll-region-focus-ring-color`

#### Events and methods

None. The host is the native scroll target, so consumers may read its standard scroll-position
properties or listen for the native `scroll` event. Wayglass does not translate it into a component
event.

### Semantics, focus, and responsive behavior

The host detects overflow on the allowed axis. It joins the tab order only while overflow exists,
receives the supplied accessible label, and exposes region semantics. When content fits, it is not
an extra focus stop. Descendant controls retain their normal tab order, and focus is never trapped.

The component uses `overflow: auto`, shows a visible boundary when constrained, supports keyboard
and pointer scrolling, and uses the shared focus ring. It does not scroll-lock the page, snap,
auto-scroll on updates, restore position, virtualize content, or hide scrollbars. Applications own
announcements for newly appended content and preserve a user's reading position during live updates.

If `label` is missing, content remains visible and scrollable and the host still becomes keyboard
focusable when required, but it does not expose an unnamed region role. The authored state is
invalid and must fail component validation. The implementation must not invent an English accessible
name.

Inline scrolling is allowed only when the content relationship genuinely requires it, such as
preformatted data. Ordinary interface composition must reflow instead.

## Token additions required by implementation

Implementation will lock only the roles required by these contracts:

- semantic layout gaps for related, section, and function relationships in both densities;
- frame background, boundary, radius, and padding aliases;
- grid item minimums for compact, standard, and wide content;
- split region minimums and balanced/emphasized ratios;
- scroll-region maximums and boundary aliases.

Existing page, section, function-gutter, focus, border, shape, density, and breakpoint tokens are
reused where their meanings fit. CSS cannot currently substitute custom properties into container
conditions, so any implementation threshold that mirrors a token must be documented beside the query
and covered by a token-consistency test.

## Validation requirements

The implementation gate must cover:

- source, reading, and focus order before and after upgrade;
- nested layouts and nested `wg-frame`/`wg-canvas` container contexts;
- every spacing role in compact and comfortable density;
- early wrapping caused by long content, localization, and enlarged text;
- 200% and 400% zoom without lost content or horizontal page overflow;
- right-to-left logical placement;
- forced-colors boundaries and focus rings;
- grid item minimums and split collapse at threshold edges;
- scroll-region overflow detection, keyboard access, dynamic content, and focus preservation;
- phone, desktop, and wall-display fixtures in Chromium, Firefox, and WebKit;
- framework-neutral registration and typed React wrappers.

## Deferred decisions

- Subgrid, masonry, named grid placement, fixed column counts, and visual reordering are not part of
  the generic contract.
- Pagination, virtualization, scroll restoration, and live-update announcements remain owned by data
  and feedback patterns.
- Media aspect ratio, cropping, inspection, loading, and unavailable behavior belong to the later
  Phase 2C media-content contract.
