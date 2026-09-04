# Phase 6B core-controls contract audit

**Status:** Proposed on September 3, 2026. This record reconciles the core-control family against
its implementation, architecture decisions, documentation, React bindings, stories, and browser
evidence. It changes no package version, privacy, registry, or deployment state.

## Scope

The audited family is `wg-icon-button`, `wg-toggle`, `wg-segmented-control`, `wg-segment`, and
`wg-navigation-rail`, together with their `@wayglass/react` wrappers.

The audit covers closed fields and defaults, slots, CSS parts and custom properties, native versus
custom events, public methods, confirmed/requested state separation, compound selection ownership,
native navigation ownership, explicit registration, and React event typing.

## Result

The runtime APIs and interaction models remain aligned with ADR 0016. One documentation overclaim
was corrected: invalid toggle request combinations normalize to confirmed presentation without
inventing a request, but the component does not emit the development diagnostic previously claimed.
The contract now states that tested behavior directly.

The segmented-control responsive contract now also records its implemented one-row local scrolling
behavior directly instead of retaining conditional wrapping language.

The document also now records the icon catalog, validation gate, menus/forms/dialog contracts, and
other completed work in present tense. Excluded v1 behaviors remain explicit continuing boundaries
rather than appearing as an outdated phase backlog.

The import regression test now loads all five core-control modules, rather than only icon button,
and proves none registers as an import side effect. Existing browser evidence continues to cover
native button behavior, confirmed toggle truth, request events, radio-group selection, mutation
fallback, native links, themes, forced colors, reduced motion, zoom, and accessibility.

## Frozen contract

- Icon button owns five properties, two slots, three parts, six CSS properties, native activation,
  and forwarded `focus()`/`click()` methods.
- Toggle owns eight properties, three slots, seven parts, eight CSS properties, forwarded methods,
  and one bubbling/composed typed request event that never mutates confirmed truth.
- Segmented control owns `value` and `orientation`, its `group` part, roving radio selection,
  `focusSelected()`, and one bubbling/composed typed change event. Segment owns `value`, `disabled`,
  two slots, and three parts.
- Navigation rail owns only layout orientation, one slot, one part, and seven CSS properties. Native
  links and the surrounding native `nav` retain navigation semantics and events.
- All modules remain side-effect free. The segmented-control registration function explicitly
  registers its segment dependency, and React maps the two Custom Events without duplicating
  behavior.

## Remaining release evidence

The completed VoiceOver/Safari review remains valid. NVDA with Firefox on Windows remains an open
pre-public-release evidence item, consistent with the existing deferred Windows-access decision;
this audit makes no unsupported Windows screen-reader claim.

## Decision requested

Accept core controls as field-level reconciled and proceed to menus and commands. Acceptance freezes
the listed contract for v1; later changes require explicit compatibility review. It does not
authorize package publication.
