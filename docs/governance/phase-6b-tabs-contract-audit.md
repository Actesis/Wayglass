# Phase 6B tabs contract audit

**Status:** Proposed on September 2, 2026. This record reconciles the tabs family against its
implementation, architecture decision, documentation, React bindings, stories, and browser evidence.
It changes no package version, privacy, registry, or deployment state.

## Scope

The audited family is `wg-tabs`, `wg-tab-list`, `wg-tab`, and `wg-tab-panel`, including the
coordinator entry point and their `@wayglass/react` wrappers.

The audit covers authored and managed fields, selection ownership, defaults, slots, events, methods,
CSS parts and custom properties, relationship IDs, keyboard and pointer interaction, responsive
overflow, invalid authoring, dynamic mutation, focus recovery, registration, and React event typing.

## Result

The implementation remains aligned with ADR 0009 and the completed Phase 2A validation record. No
runtime or public API correction was required. Two stale draft remnants in the component document
were resolved:

- the implemented CSS custom properties are no longer labeled “proposed”; and
- horizontal scrolling is now recorded as the selected narrow-layout behavior rather than an open
  wrapping-versus-scrolling question.

A browser regression test now proves that all four element modules remain unregistered after import
and preserve fallback content until explicit registration. The existing tabs suite already covers
the compound role graph, reciprocal IDs, automatic and manual activation, direction-aware keyboard
movement, disabled and invalid pairs, programmatic silence, mutation recovery, responsive overflow,
themes, forced colors, reduced motion, and automated accessibility.

## Frozen contract

- `wg-tabs` owns `value`, `activation`, and `orientation`; exposes the default slot and
  `focusSelected()`; and emits one bubbling, composed `wg-tab-change` only for user selection.
- `wg-tab-list` exposes the default slot and `list` part. Authors name it; the coordinator manages
  role and orientation.
- `wg-tab` owns `value` and `disabled`; exposes default and `summary` slots plus four CSS parts; and
  receives its selection, disabled, relationship, and roving-focus semantics from the coordinator.
- `wg-tab-panel` owns `value`; exposes the default slot and `panel` part; and receives its labeling,
  visibility, role, and focus semantics from the coordinator.
- The 16 documented family CSS custom properties are public. Horizontal lists scroll and do not
  wrap; vertical lists remain a column.
- `defineWgTabs()` explicitly and idempotently registers the entire compound family. Individual
  registration functions remain available from their subpaths.
- React exposes the same four elements, with `onWgTabChange` preserving the typed element, detail,
  and current-target contract.

## Remaining release evidence

The completed VoiceOver/Safari review remains valid. NVDA with Firefox on Windows is still an open
pre-public-release evidence item, consistent with the previously approved decision to move past it
temporarily; this audit does not silently convert that gap into a support claim.

## Decision requested

Accept the tabs family as field-level reconciled and proceed to the foundations and layout family.
Acceptance freezes the listed contract for v1; later changes require explicit compatibility review.
It does not authorize package publication.
