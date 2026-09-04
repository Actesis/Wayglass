# Phase 6B scalar-data contract audit

**Status:** Proposed on September 3, 2026. This record reconciles `wg-metric-group`,
`wg-trend-indicator`, `wg-key-value`, and the compatible `wg-metric` trend extension against their
implementations, architecture decision, documentation, React bindings, stories, and browser
evidence. It changes no package version, privacy, registry, or deployment state.

## Scope

The audit covers fields and defaults; direction vocabulary; condition, knowledge, and activity
separation; slots; CSS parts and custom properties; loading and busy semantics; native slotted
content; group and action order; explicit registration; and React adaptation.

Formatting, units, comparisons, thresholds, intervals, ordering, updates, aggregate state,
announcements, domain meaning, and application data remain consumer-owned.

## Result

The family remains aligned with ADR 0024. Values are already formatted application input. Trend
direction communicates change without implying good or bad condition. Knowledge and activity remain
separate from both. All three components are display-only, preserve slotted native content, add no
live region, emit no events, and leave focus and update policy to the application.

One implementation drift was corrected in `wg-metric-group`. Its accepted contract places authored
actions after scalar content in DOM and reading order and moves those actions below the values in a
narrow container. The implementation had rendered the actions inside the header before every value.
The internal shadow order is now heading, scalar content, then actions; CSS retains the desktop
header-side placement and moves actions to the final row below 40 rem. The public `actions` slot,
parts, properties, and visual role are unchanged.

The contract's future-tense testing requirements and the trend prototype question were reconciled
with completed Phase 3B evidence. They now identify current automated coverage and keep
representative assistive-technology review explicit rather than implying an unsupported claim.

## Frozen contract

- `wg-metric-group` exposes `label` and `busy`, four slots, six CSS parts, and eight intentional
  custom properties. It does not enforce child tags or aggregate child state.
- `wg-trend-indicator` exposes one authored comparison label, five direction values, independent
  state axes, loading, two slots, eight CSS parts, and six intentional custom properties. Direction
  never selects a condition color.
- `wg-key-value` exposes authored label and value strings, independent state axes, loading, four
  slots, eight CSS parts, and five intentional custom properties. Its value slot retains native
  consumer semantics and behavior.
- `wg-metric` adds only the `trend` slot and matching part. It receives no comparison, threshold,
  previous-value, delta, interval, or direction policy.
- All modules remain side-effect free and explicitly registered. React registers the production
  classes and adds no fields, events, formatting, comparison, or update behavior.

## Validation

The field-level documentation suite passes all 138 checks. ESLint, element, documentation, and React
typechecks, the element build, the production documentation build, and all 17 React tests pass. The
combined scalar-data and semantic-display browser matrix scheduled 63 cases across Chromium,
Firefox, and WebKit: all 61 applicable cases passed, with the two intentional non-Chromium timing
skips. Coverage includes explicit registration, fallback content, field normalization, group names
and busy state, source and narrow visual order, stable focus, all trend directions, independent
state axes, native slotted values, 24-value reflow at 320 CSS pixels and 200% text, both themes,
forced colors, reduced motion, grayscale, Axe, and page containment.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence for group
naming and reading order, value and unit output, native slotted content, trend and state separation,
busy/loading presentation, updates without repetitive speech, and action order. The Windows item
remains consistent with the existing deferred Windows-access decision.

## Project-owner decision

Pending review. Acceptance freezes the listed scalar-data contract for v1; later changes require
explicit compatibility review. It does not authorize package publication.
