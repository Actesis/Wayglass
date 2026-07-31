# ADR 0017: Keep command-menu ownership inside one coordinator

- Status: accepted
- Date: 2026-07-31

## Context

Phase 2D-C needs compact application command menus. A menu button is not merely a button beside a
hidden surface: the trigger, popup, items, expanded state, focus entry, composite keyboard model,
dismissal, and focus return form one interaction contract.

Wayglass also needs to preserve the boundaries established by earlier decisions:

- immediate commands report intent and do not invent persistent state;
- native semantics are preferred where they can own the complete behavior;
- required accessibility relationships should not depend on cross-root ID references;
- consumer content and branding remain adaptable;
- client-only fallback is sufficient;
- this milestone must not accidentally create a general overlay system.

The WAI-ARIA Authoring Practices define a menu button as a button that controls a menu and moves
focus into its items. The menu is a composite widget with arrow navigation, Home/End, optional
typeahead, Escape dismissal, and reason-specific focus behavior. HTML's Popover API supplies
top-layer presentation, close requests, and light dismissal, but it does not implement menu
semantics or keyboard movement. CSS Anchor Positioning can express logical placement and collision
fallback, but Level 1 remains a working draft.

References:

- [WAI-ARIA menu-button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [WAI-ARIA menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [HTML popover model](https://html.spec.whatwg.org/multipage/popover.html)
- [CSS Anchor Positioning Level 1](https://drafts.csswg.org/css-anchor-position/)

## Decision

Implement the first menu as one `wg-menu` coordinator with an internal native trigger button and an
internal `popover="auto"` menu surface. Consumer-authored direct `wg-command-item` and `wg-divider`
children are projected into that surface.

The trigger and menu container live in the same shadow tree. The internal button owns button
activation, accessible naming, `aria-haspopup="menu"`, `aria-expanded`, and the optional
`aria-controls` relationship. The popup container owns `role="menu"`. Slotted command-item hosts own
`menuitem` semantics in the flattened accessibility tree and contain no nested native button.

`wg-menu` owns open state, item discovery, focus movement, typeahead, direct-child mutations,
dismissal, and reason-specific focus return. `wg-command-item` owns its required stable value,
visible label, disabled state, activation guard, and bubbling composed `wg-command` intent event.
Command outcomes remain application-owned and visible outside the dismissed menu when they matter.

Use the platform Popover API for top-layer stacking, native close requests, and light dismissal.
Observe its toggle lifecycle so component state never competes with the platform. Provide a scoped
client fallback for supported browsers without a usable Popover API.

Prefer CSS Anchor Positioning for four logical placements and collision fallback when supported.
Provide a menu-private geometry adapter for equivalent placement otherwise. Do not export that
adapter, portal menu content, or generalize it for dialogs, tooltips, comboboxes, viewers, or other
overlays during Phase 2D-C.

The initial release is a flat command menu only. Navigation menus, arbitrary popup content,
menuitemcheckbox, menuitemradio, submenus, menubars, context menus, and command palettes require
separate contracts.

## Consequences

The semantic button-to-menu relationship remains wholly inside one shadow tree, while authors keep
control of rich visible item labels and ordering. The component can expose one coherent typed API
without asking consumers to manually synchronize expanded state, focus, dismissal, and placement.

Because command-item hosts use ARIA semantics instead of internal native buttons, Wayglass owns
their keyboard activation and must validate host interoperability with representative assistive
technology. The flattened relationship between the internal menu and slotted item hosts also
requires explicit browser and screen-reader evidence before acceptance.

Popover and anchor positioning reduce custom machinery where available. The fallback still adds
engineering and testing cost, but it is deliberately private and bounded to one flat popup. Future
overlay components are free to select different native primitives and focus models rather than
inheriting a premature abstraction.

The scope does not satisfy every control that can visually resemble a menu. This is intentional:
navigation keeps native link behavior, persistent choices use selection or form patterns, and
arbitrary interactive content uses disclosure or a future dialog/popover contract.

## Alternatives considered

- **Consumer-authored trigger beside a standalone `wg-menu`:** rejected for the initial API because
  `wg-button` and `wg-icon-button` encapsulate their native buttons. Synchronizing ARIA, focus, and
  native popover targeting across component and shadow boundaries would fragment ownership.
- **Put one native button inside every command item:** rejected because the menu's required item
  roles, focus model, and activation would be split between a host and a nested control. A focusable
  `menuitem` host keeps one interactive node per command.
- **Place roles on all light-DOM hosts:** rejected because one `wg-menu` host cannot simultaneously
  be the invoking button, the popup menu, and the coordinator. Separate public trigger and popup
  elements would add composition flexibility at the cost of invalid intermediate states.
- **Generate command items from an array property:** rejected because it constrains localization,
  rich visible labels, framework composition, mutation, and substantial brand adaptation.
- **Use a generic disclosure instead of menu semantics:** rejected for application command sets
  because it would discard the established composite keyboard model. Disclosure remains preferable
  for navigation or arbitrary content.
- **Build a universal overlay/positioning package now:** rejected because dialogs, tooltips,
  comboboxes, context menus, and media viewers differ in modality, ownership, dismissal, focus, and
  accessible semantics.
- **Require CSS Anchor Positioning with no fallback:** rejected while the specification is still a
  working draft and supported engines must behave consistently.
- **Portal the popup to the document body:** rejected because it complicates ownership, inherited
  theme context, event paths, teardown, and semantic relationships without being necessary when the
  Popover API supplies the top layer.
