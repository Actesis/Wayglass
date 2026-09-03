# Phase 6B Phase 1 primitive contract audit

**Status:** Proposed on September 2, 2026. This record reconciles the first component family against
its implementation, documentation, React bindings, stories, and browser evidence. It changes no
package version, privacy, registry, or deployment state.

## Scope

The audited family is the ten original Phase 1 primitives:

- `wg-button`, `wg-boolean-value`, `wg-canvas`, `wg-elbow`, and `wg-metric`;
- `wg-panel`, `wg-rail`, `wg-status-indicator`, `wg-theme-provider`, and `wg-value-tile`; and
- their corresponding `@wayglass/react` wrappers.

For each component, the audit compared attributes and their property mappings, property defaults,
slots, events, methods, CSS parts, public CSS custom properties, explicit element registration,
React adaptation, documented behavior, Storybook coverage, and browser validation.

## Result

The authored behavior and public fields are coherent across the family. One documentation drift was
found and corrected: `wg-button` has always exposed the `core` CSS part that stabilizes its label
and pending layouts, but the Button contract omitted it.

No element behavior, tag name, JavaScript symbol, event, slot, default, or React prop changed. The
existing browser suites remain the behavioral authority for native button activation, focus,
responsive recomposition, semantic-state separation, accessible summaries, theme resolution, forced
colors, reduced motion, zoom, direction, and automated accessibility checks.

## Frozen field-level contracts

| Component        | Attributes | Properties | Slots | Parts | CSS properties | Events/methods                          |
| ---------------- | ---------: | ---------: | ----: | ----: | -------------: | --------------------------------------- |
| Button           |          3 |          3 |     4 |     6 |              8 | Native `click`; `focus()` and `click()` |
| Boolean value    |          7 |          7 |     2 |     6 |              7 | None                                    |
| Canvas           |          1 |          1 |     3 |     2 |              4 | None                                    |
| Elbow            |          2 |          2 |     1 |     3 |              5 | None                                    |
| Metric           |          8 |          8 |     4 |     9 |              6 | None                                    |
| Panel            |          5 |          5 |     5 |     7 |              6 | None                                    |
| Rail             |          2 |          2 |     0 |     1 |              4 | None                                    |
| Status indicator |          5 |          5 |     2 |     6 |              6 | None                                    |
| Theme provider   |          2 |          3 |     1 |     0 |              0 | `wg-theme-change`                       |
| Value tile       |          3 |          3 |     7 |     9 |              5 | None                                    |

The theme provider's third property is the read-only `resolvedTheme`. Its event remains bubbling and
composed, and fires only when that resolved value changes. Button's public methods continue to
forward platform focus and activation to its internal native button while respecting disabled and
pending state.

## Enforcement

The new documentation test stores the reviewed contract for each primitive and compares it with the
element source and authoritative component document. It also requires the corresponding React
wrapper, checks custom attribute/property mappings and defaults, and separately freezes the Button
method and theme-change event exceptions.

This is intentionally structural. Behavioral claims remain tested in Playwright rather than being
reduced to documentation word matching.

## Decision requested

Accept this family as field-level reconciled and proceed to the tabs family. Acceptance freezes the
listed public contract for v1; later changes require explicit compatibility review. It does not
authorize package publication.
