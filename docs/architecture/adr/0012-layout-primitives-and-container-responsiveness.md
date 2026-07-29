# ADR 0012: Use semantic layout elements with container-owned responsiveness

- Status: accepted
- Date: 2026-07-29

## Context

Phase 2C adds frame, stack, cluster, grid, split, and scroll-region primitives. They must support
responsive composition from phones through wall displays while preserving source order, native
semantics, stable live-update layouts, compact and comfortable density, enlarged text, and
framework-neutral use.

A layout API that exposes every flexbox and grid property would reproduce CSS with a less capable
syntax and encourage arbitrary spacing. Viewport breakpoints inside leaf components would make
nested panels respond to the device rather than their actual available space. Visually reordering
content could make narrow layouts disagree with reading and focus order.

The elements also need a safe client-only fallback. Before JavaScript upgrades them, consumer
content must remain understandable even though enhanced arrangement, containment, or scrolling is
not yet present.

## Decision

Implement the six layouts as small, inert Custom Elements in `@wayglass/elements`:

- `wg-frame` owns one neutral function boundary and establishes a named responsive container;
- `wg-stack` owns block-axis sequence and spacing;
- `wg-cluster` owns wrapping inline grouping;
- `wg-grid` owns adaptive equal-priority columns;
- `wg-split` owns two-region composition and source-order collapse;
- `wg-scroll-region` owns a constrained, discoverable scroll boundary.

Expose relationship-level variants rather than raw CSS controls. Stack, cluster, grid, and split
share semantic spacing values for `none`, `related`, `section`, and `function`. Grid and split use
semantic content minimums. Split offers balanced, primary-emphasized, and secondary-emphasized
ratios without visual reordering.

Use logical CSS properties and component-owned inline-size container queries. A component recomposes
from the width it actually receives, including when nested, rather than from viewport classes.
Container thresholds are implementation details backed by documented tokens or token-consistency
tests.

Keep source, reading, and focus order identical at every size. Layout hosts add no semantics or
focus stops. The exception is an actually overflowing `wg-scroll-region`, whose host becomes the
native keyboard-focusable scroll target and uses a consumer-supplied accessible label only while
overflow exists.

Preserve light-DOM content before upgrade. No layout may make visual columns, clipping, or position
the only carrier of meaning.

## Consequences

Wayglass gains a compact layout vocabulary that expresses grouping and priority consistently without
replacing bespoke consumer CSS. Density and theme changes can tune measures globally while the
relationship names remain stable. Nested components respond correctly inside canvases, frames,
panels, decks, and application-owned containers.

Consumers cannot request arbitrary column counts, gaps, breakpoints, dense packing, or order through
attributes. They use documented custom-property overrides for deliberate measurement exceptions and
ordinary CSS for genuinely bespoke editorial layouts.

Shadow-DOM slot layout and container-query behavior require cross-browser tests, especially for
intrinsic sizing, long content, zoom, and right-to-left writing direction. Scroll regions require
overflow observation so they do not create unnecessary focus stops as content changes.

Before upgrade, content may appear as ordinary document flow and a planned scroll constraint may be
absent. This is acceptable because all content remains visible and usable; applications that require
layout-stable first paint may load package fallback styles while full server rendering remains
deferred.

## Alternatives considered

- **Expose flexbox and grid through many attributes:** rejected because it creates a weaker parallel
  CSS API and undermines the constrained semantic spacing system.
- **Publish only CSS utility classes:** rejected because typed element contracts, React wrappers,
  component-local container behavior, and scroll accessibility would become inconsistent.
- **Use viewport media queries:** rejected because reusable components must respond to their
  container, especially inside overview grids and focused decks.
- **Allow visual ordering attributes:** rejected because visual, reading, and focus order would
  diverge.
- **Require fixed column counts:** rejected because content capacity, zoom, and localization should
  determine when columns fit.
- **Keep every scroll region permanently focusable:** rejected because non-overflowing content would
  add unexplained keyboard stops.
