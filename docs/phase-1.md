# Phase 1 domain-neutral vertical slice

**Status:** Complete as of July 28, 2026.

Phase 1 proved that Wayglass's visual language, semantic state model, themes, responsive
composition, accessibility, Custom Element APIs, and typed React bindings work together as one
domain-neutral operational interface. Its reference composition is Operations Overview: three
visually separated functions named Access, Communications, and Processing.

The function names are neutral fixtures, not product concepts. They demonstrate how an application
can keep informational, monitoring, control, and feedback content distinct without centering
Wayglass on home automation or another domain.

## Delivered foundation

| Area          | Delivered contract                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| State         | Domain value, condition, knowledge, and activity remain independent axes                                               |
| Structure     | Theme provider, canvas, rail, elbow, and panel establish the initial composition grammar                               |
| Action        | Button intent remains separate from confirmed application state                                                        |
| Status        | Status indicator communicates operational condition without relying on color alone                                     |
| Boolean state | Boolean value presents asserted and not-asserted states without treating off, closed, or unverified as errors          |
| Values        | Metric and value tile provide compact authored values without inventing condition or confidence                        |
| Delivery      | Side-effect-free Custom Elements, explicit registration, typed React wrappers, and runnable Vanilla and React examples |
| Validation    | Chromium, Firefox, and WebKit coverage across themes, forced colors, reduced motion, zoom, and responsive compositions |

The complete public surface is recorded in the [Phase 1 component contracts](./components/). The
architectural reason for defining the reference composition and contracts before implementation is
captured in [ADR 0008](./architecture/adr/0008-phase-1-contracts.md).

## Reference composition

Operations Overview exercises several safeguards that remain central to Wayglass:

- function boundaries are stronger than dividers within a function;
- informational sections are not presented as operational status;
- condition colors retain their stoplight meaning and are not reused for ordinary Boolean state;
- Boolean state remains legible through an asserted or unasserted visual signal plus text;
- structural rails and elbows organize content without carrying unlabeled condition meaning;
- phone, desktop, and wall-display compositions preserve function identity and reading order; and
- icons, color, motion, and physical position remain redundant to visible text and semantics.

## Initial component set

- [`wg-theme-provider`](./components/theme-provider.md)
- [`wg-canvas`](./components/canvas.md)
- [`wg-rail`](./components/rail.md)
- [`wg-elbow`](./components/elbow.md)
- [`wg-panel`](./components/panel.md)
- [`wg-button`](./components/button.md)
- [`wg-status-indicator`](./components/status-indicator.md)
- [`wg-boolean-value`](./components/boolean-value.md)
- [`wg-metric`](./components/metric.md)
- [`wg-value-tile`](./components/value-tile.md)

Each element module exports its class and an explicit `defineWg*` registration function. Imports do
not register elements as a side effect. React bindings compose the same production elements rather
than duplicating behavior.

## Validation

The [Phase 1 validation record](./accessibility/phase-1-validation.md) closes the initial WCAG 2.2
AA gate. It covers native semantics, keyboard and pointer interaction, 44-by-44 CSS-pixel action
targets, dark and light themes, reduced motion, forced colors, 200% zoom and narrow reflow,
responsive composition, independent state combinations, framework parity, and all three supported
browser engines.

Phase 1 intentionally did not attempt to deliver a complete component system. Selection, richer
layout, media, forms, feedback, modal content, operational-data collections, ecosystem tooling, and
release readiness followed in Phases 2 through 6.
