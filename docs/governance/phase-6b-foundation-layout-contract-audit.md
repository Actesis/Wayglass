# Phase 6B foundation and layout contract audit

**Status:** Accepted by the project owner on September 3, 2026. This record reconciles the
foundation and layout element families against implementation, documentation, React bindings,
stories, and browser evidence. It changes no package version, privacy, registry, or deployment
state.

## Scope

The audited elements are `wg-divider`, `wg-surface`, `wg-cluster`, `wg-frame`, `wg-grid`,
`wg-scroll-region`, `wg-split`, and `wg-stack`, together with their `@wayglass/react` wrappers.

The foundation stylesheet utilities and `wg-icon` remain governed by their already reconciled
contracts and are not reopened here.

## Result

All eight element implementations align with their accepted field and behavior contracts. No runtime
or public API correction was required. The audit resolved stale future-tense text left from the
original implementation planning: token roles and validation are now recorded as implemented, the
official icon catalog and layout contract are no longer listed as deferred, and completed media work
is referenced as a separate contract instead of future work.

The existing browser suites already prove source-order preservation, explicit registration, fallback
visibility, closed-value normalization, neutral semantics, semantic spacing, container
responsiveness, right-to-left placement, zoom/reflow, forced colors, theme accessibility, and
conditional scroll-region semantics. The foundation import test now checks both `wg-surface` and
`wg-divider`; the layout suite already checks all six layout modules.

## Frozen contract

- Surface owns three fields, one slot, one part, and five CSS properties. Divider owns three fields,
  one part, and two CSS properties.
- Cluster, frame, grid, split, and stack remain semantically inert layout containers with closed,
  logical value vocabularies. They emit no events and add no focus stops.
- Split retains exactly two named regions in source order. Grid remains capacity-based rather than
  exposing fixed columns. Cluster wraps without reordering.
- Scroll region owns `axis` and `label`, exposes one slot and part, and uses native scrolling. It
  becomes a labeled region and keyboard target only when overflow warrants it; it emits no
  translated component event.
- All eight modules remain side-effect free with explicit registration, and React wrappers preserve
  their production element properties, children, and refs.

## Enforcement

The field-level documentation test holds each element's exact properties, defaults, slots, parts,
CSS custom properties, no-event/no-method boundary, and React wrapper against its authoritative
contract. It separately protects scroll-region's conditional semantics and prevents completed token
and validation sections from regressing to future-tense planning language.

## Project-owner decision

On September 3, 2026, the project owner accepted the foundation and layout elements as field-level
reconciled and directed the merge and continuation to core controls. This freezes the listed
contract for v1; later changes require explicit compatibility review. It does not authorize package
publication.
