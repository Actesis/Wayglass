# ADR 0016: Match each core control to its interaction semantics

- Status: accepted
- Date: 2026-07-31

## Context

Phase 2D-B includes an icon button, operational toggle, segmented control, and navigation rail.
Although all four are visually compact controls, they do not share one interaction model:

- an icon button emits an immediate command;
- an operational toggle requests a remote Boolean value without changing confirmed truth;
- a segmented control selects one local option;
- a navigation rail moves between destinations.

Treating all four as pressed buttons would erase meaningful differences among command, checked,
selected, and current-page semantics. Treating them all as one compound selection widget would also
replace native navigation behavior and create unnecessary keyboard management.

The WAI-ARIA Authoring Practices define established button, switch, and radio-group patterns. HTML
already supplies native links and navigation landmarks. The implementation boundary should maximize
native behavior while keeping compound relationships inspectable in light DOM.

References:

- [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [WAI-ARIA switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)
- [WAI-ARIA radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [WAI-ARIA navigation landmark example](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html)

## Decision

Implement each core control according to its actual semantics:

- `wg-icon-button` contains one internal native `<button type="button">`. It owns a required
  accessible name while its slotted icon remains decorative.
- `wg-toggle` contains one internal native `<button type="button" role="switch">`. Its
  `aria-checked` state reflects the confirmed Boolean value supplied by the application. Activation
  emits a typed request event and never changes that value internally.
- `wg-segmented-control` and `wg-segment` are a compound radio-group pattern. Their hosts carry
  `radiogroup` and `radio` semantics in one light-DOM relationship graph. The coordinator owns
  roving focus, checked state, mutation fallback, and one typed local-selection event.
- `wg-navigation-rail` is an inert presentation wrapper for direct, consumer-authored native links.
  The consumer-authored `<nav>` owns the navigation landmark and its accessible name. Each link owns
  its destination, activation, and optional `aria-current="page"` state.

Imports remain side-effect free until explicit registration. React wrappers type the same element
classes and events without reproducing behavior.

The four controls do not share a base interactive class beyond the existing `WayglassElement`.
Visual token reuse must not force semantic or behavioral reuse.

## Consequences

Buttons and links retain native activation. Switch and radio semantics match the value model that
assistive technology announces. Navigation stays usable without custom arrow-key handling, and a
rail never implies a tab-panel relationship.

`wg-segmented-control` carries the largest implementation obligation because custom radio hosts must
reproduce roving focus, keyboard selection, disabled skipping, mutation behavior, and checked-state
relationships. It requires cross-browser and representative assistive-technology review before the
API is accepted as implemented.

The navigation rail requires slightly more consumer markup than a generated destination model, but
it preserves native links, browser history, modified-click behavior, context menus, and framework
routing adapters.

The icon button and toggle use labels supplied to the owning component rather than deriving names
from icons. Missing icons cannot erase their accessible names.

## Alternatives considered

- **Use `aria-pressed` for operational toggles:** rejected because switch checkedness communicates
  an on/off value more directly, while pressed state describes a latched command presentation.
- **Make segmented controls a group of toggle buttons:** rejected because exactly-one selection is
  the radio-group model and independent pressed buttons would expose the wrong relationship.
- **Make segmented controls tabs:** rejected because they do not own associated tab panels.
- **Make the navigation rail a tablist:** rejected because destinations use navigation and history,
  not same-context panel selection.
- **Generate links from destination attributes:** rejected because it would hide native link
  ownership and duplicate router, URL, download, target, and relationship APIs.
- **Use one generic `wg-control`:** rejected because a visual abstraction cannot safely unify
  command, switch, radio, and link behavior.
