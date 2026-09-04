# Phase 6B status-collections contract audit

**Status:** Proposed on September 3, 2026. This record reconciles `wg-status-list` and
`wg-status-entry` against their implementations, architecture decision, tokens, documentation, React
bindings, stories, and browser evidence. It changes no package version, privacy, registry, or
deployment state.

## Scope

The audit covers collection and entry fields; defaults; direct-child diagnostics; slots; CSS parts
and custom properties; condition, knowledge, and activity separation; list semantics; feedback and
busy state; authored actions; responsive order; stable-node mutation; explicit registration; and
React adaptation.

Grouping, ordering, identity, loading and empty-state meaning, selection, whole-row activation,
aggregate state, record reconciliation, announcements, pagination, virtualization, and application
data remain consumer-owned.

## Result

The family remains aligned with ADR 0024. One named `wg-status-list` owns only its collection
boundary and list semantics. Direct light-DOM `wg-status-entry` nodes remain application-owned and
retain their identity through insertion, reorder, and cross-list movement. Entries present shared
state axes and authored details without becoming selected rows, disclosures, or commands.

No implementation field or behavior drift required a public API change. One token-description drift
was corrected after the earlier contrast remediation: `--wg-status-entry-color-condition` controls
the compact condition signal, while visible state words retain the contrast-safe entry text
treatment. Its definition no longer incorrectly claims ownership of both signal and text. The
component contract now states that boundary directly.

The future-tense validation checklist is reconciled with completed Phase 3D evidence and now keeps
representative assistive-technology procedures as explicit public-release gates. Executable
field-level tests freeze both components and narrow action-order coverage now verifies that entry
controls follow informational content at 320 CSS pixels and 200% text.

## Frozen contract

- `wg-status-list` exposes `label` and `busy`, five slots, seven CSS parts, and seven intentional
  custom properties. Its named `role="list"` contains authored default content and owns no child
  state, identity, grouping, sorting, filtering, or selection.
- `wg-status-entry` exposes label and the three shared state axes, six slots, thirteen CSS parts,
  and twelve intentional custom properties. Its host is a list item; its visual signal is hidden
  from the accessibility tree while state words remain visible.
- Unsupported default children are preserved and receive only a deduplicated diagnostic. Neither
  component clones, removes, hides, or reconciles application-authored records.
- List feedback and loading meaning remain authored through `busy` and `status`. Entry actions stay
  native or Wayglass controls after informational content and never make the row itself clickable.
- Both modules remain side-effect free and explicitly registered. React registers the production
  classes and adds no fields, events, list management, identity, or interaction behavior.

## Validation

The field-level documentation suite passes all 155 checks. All 22 token tests and the token artifact
integrity check pass. ESLint, token, element, documentation, and React typechecks, the production
documentation build, and all 17 React tests pass. The focused status-list and React browser matrix
scheduled 60 cases across Chromium, Firefox, and WebKit: all 58 applicable cases passed, with the
two intentional non-Chromium timing skips. Coverage includes fallback and explicit registration,
named lists and list items, every state value, native values and actions, authored feedback,
unsupported-child diagnostics, stable 100-entry mutation, cross-list movement, focus recovery,
narrow action order, themes, density, RTL, forced colors, reduced motion, 320 CSS-pixel width, 200%
text, Axe, and page containment.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence for named
lists, entry count and order, entry state and details, authored feedback, stable mutation,
cross-list movement, focus recovery, native action order, and absence of unsolicited announcements.
The Windows item remains consistent with the existing deferred Windows-access decision.

## Project-owner decision

Pending review. Acceptance freezes the listed status-collections contract for v1; later changes
require explicit compatibility review. It does not authorize package publication.
