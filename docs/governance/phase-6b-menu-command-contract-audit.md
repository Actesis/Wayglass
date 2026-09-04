# Phase 6B menu and command contract audit

**Status:** Accepted by the project owner on September 3, 2026. This record reconciles `wg-menu` and
`wg-command-item` against their implementation, architecture decision, documentation, React
bindings, stories, and browser evidence. It changes no package version, privacy, registry, or
deployment state.

## Scope

The audit covers popup and trigger ownership, fields and defaults, slots, CSS parts and custom
properties, public methods, typed events, command provenance, keyboard movement, dismissal and focus
return, placement and fallback behavior, direct-child mutation, explicit registration, and React
event adaptation.

`wg-command-bar` remains in the later filtering-and-command family. Dialogs, media viewers, and
other overlays retain their own contracts; the menu-private geometry fallback does not become a
general overlay service.

## Result

The runtime contract remains aligned with ADR 0017. The authoritative document now records the
implemented API rather than retaining proposal headings and adds the two styling hooks that the
rendered elements already expose: the menu `indicator` part and command-item `content` part.

The document also records property defaults, the bubbling and composed menu-toggle event, the
completed confirmation-dialog ownership boundary, and current command-bar status. Validation and
excluded behavior now appear as present-tense coverage and continuing v1 boundaries rather than an
outdated implementation gate or deferred phase list.

The browser import proof already loads both element modules and confirms neither registers as an
import side effect. Existing browser evidence covers the Popover and client-fallback paths,
menu-button semantics, keyboard movement and typeahead, command provenance, disabled suppression,
dismissal and focus behavior, direct-child mutation recovery, theme and forced-color accessibility,
and narrow-viewport containment across Chromium, Firefox, and WebKit.

## Frozen contract

- `wg-menu` owns `label`, `disabled`, `placement`, and read-only reflected `open` state; trigger and
  default slots; five CSS parts; eleven component styling hooks; and `focus()`, `show()`, `hide()`,
  and `toggle()` methods.
- `wg-menu` emits one bubbling, composed `wg-menu-toggle` event for each open-state transition with
  `open` and one of seven closed reason values.
- `wg-command-item` owns `value` and `disabled`; four slots; six CSS parts; `menuitem` semantics; a
  guarded `click()` path; and one bubbling, composed `wg-command` event with stable value and
  keyboard, pointer, or programmatic provenance.
- `defineWgMenu()` explicitly registers the command-item dependency. Element module imports remain
  side-effect free, while the React wrappers register and adapt the two typed Custom Events without
  reproducing interaction behavior.
- The v1 menu remains one flat, application-command popup. Navigation, arbitrary popup content,
  checked/radio items, nested menus, context menus, command palettes, confirmation, and other
  overlays are outside this component contract.

## Remaining release evidence

The completed VoiceOver/Safari review remains valid. NVDA with Firefox on Windows remains an open
pre-public-release evidence item, consistent with the existing deferred Windows-access decision;
this audit makes no unsupported Windows screen-reader claim.

## Project-owner decision

On September 3, 2026, the project owner accepted the menu and command contract audit and directed
its merge and continuation to the form-foundation family. This freezes the listed contract for v1;
later changes require explicit compatibility review. It does not authorize package publication.
