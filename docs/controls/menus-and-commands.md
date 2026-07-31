# Phase 2D-C menu and command contracts

**Status:** Accepted for Phase 2D-C on July 31, 2026. Ownership and popup architecture are recorded
in [ADR 0017](../architecture/adr/0017-menu-command-architecture.md). Tokens and implementation
remain the next milestone.

This milestone defines one application-style command menu composed from `wg-menu` and
`wg-command-item`. It provides compact access to secondary commands without turning ordinary
navigation, selection, forms, or arbitrary content into menu widgets.

## Scope and vocabulary

A **menu** is a temporary popup containing commands. Its trigger is a button. Opening the menu
changes local interface state; it does not change domain truth. A **command item** represents one
immediate action and has no persistent selected, checked, or confirmed value.

Use this pattern for secondary commands such as refresh data, copy an identifier, export a report,
or reveal application-owned details. Keep a primary or time-sensitive response visible outside the
menu. Do not hide the only response to a caution or critical condition behind an overflow trigger.

This first contract does not cover:

- site or application navigation, which keeps native links and navigation landmarks;
- a disclosure containing arbitrary controls or information;
- listbox or select behavior;
- checked or radio menu items;
- nested submenus, menubars, context menus, toolbars, keyboard shortcuts, or command palettes;
- confirmation dialogs, destructive-action policy, or a reusable overlay service.

Those patterns may reuse lessons from this milestone, but they do not reuse its semantics by
default.

## Composition and ownership

`wg-menu` owns the complete menu-button relationship:

- one internal native `<button type="button">`;
- one internal popup with `role="menu"`;
- the trigger's `aria-haspopup="menu"` and synchronized `aria-expanded` state;
- popup visibility, top-layer participation, placement, dismissal, focus entry, focus return,
  keyboard coordination, typeahead, and direct-child mutation handling.

The trigger and popup stay in the same shadow tree so their optional ID reference never crosses a
shadow boundary. Direct, consumer-authored `wg-command-item` and `wg-divider` children are projected
into the popup's menu slot. Their roles remain in the flattened accessibility tree beneath the
internal menu.

`wg-command-item` owns `menuitem` semantics on its host. It remains a focusable custom-element host
and does not contain a second native button. The parent menu owns item tab indices and movement; the
item owns activation, disabled suppression, and the typed command event.

Only direct children participate. Unsupported interactive descendants, nested menus, or arbitrary
focusable content are authoring errors. Registration remains explicit and imports remain side-effect
free.

### Proposed markup

```html
<wg-menu placement="block-end-end">
  <span slot="trigger">Report actions</span>

  <wg-command-item value="refresh">
    Refresh report
    <span slot="detail">Fetch the latest confirmed values</span>
  </wg-command-item>
  <wg-command-item value="copy-id">Copy report identifier</wg-command-item>
  <wg-divider></wg-divider>
  <wg-command-item value="export">Export report</wg-command-item>
</wg-menu>
```

The trigger should contain a visible label by default. The compact icon-only overflow pattern is an
explicit exception: it requires a stable `label` such as “Report actions” and may be used only where
the surrounding context makes that trigger understandable. It may not hide the only route to a
critical or primary command.

## Menu behavior

### Opening

- Pointer activation, Enter, or Space on the trigger opens the menu and focuses its first item.
- Arrow Down opens and focuses the first item.
- Arrow Up opens and focuses the last item.
- Opening one auto-dismiss menu closes an unrelated open auto-dismiss menu through the platform
  popover stack.
- A menu with no valid command items does not open and emits a development diagnostic.
- Programmatic `show()` defaults to no focus movement unless its `focus` option requests the first
  or last item.

The trigger remains the invoker even if the menu later moves in the top layer. It exposes expanded
state but not pressed, selected, checked, busy, or domain condition.

### Movement and activation

While focus is in the menu:

| Input                | Behavior                                                                       |
| -------------------- | ------------------------------------------------------------------------------ |
| Arrow Down           | Move to the next item and wrap                                                 |
| Arrow Up             | Move to the previous item and wrap                                             |
| Home                 | Move to the first item                                                         |
| End                  | Move to the last item                                                          |
| Printable characters | Move to the next item whose visible label begins with the buffered text        |
| Enter or Space       | Activate the focused enabled item, close the menu, and return focus to trigger |
| Escape               | Close without activation and return focus to trigger                           |
| Tab or Shift+Tab     | Close and allow native focus order to continue outside the menu                |

Items use roving `tabindex="-1"`: they are focused only after the menu opens and never add stops to
the closed page. Separators and hidden items are skipped. Disabled items remain focusable so their
presence and label can be discovered, but activation is suppressed and movement does not treat them
as separators.

Typeahead is case-insensitive, ignores leading whitespace, uses the required visible item label, and
searches from the item after the current one. Repeated characters cycle matching labels. It does not
run during composition or with Control, Alt, or Meta modifiers.

### Dismissal and focus return

Dismissal behavior is reason-specific:

- Escape, trigger reactivation, command activation, and an explicit `hide({ restoreFocus: true })`
  return focus to the trigger when it is still connected and enabled.
- Tab and Shift+Tab close without forcing focus back, preserving ordinary page traversal.
- An outside pointer action light-dismisses the popup without stealing focus from the element the
  user chose.
- Programmatic hiding does not move focus unless the caller explicitly requests it.
- If focus would remain in content being hidden for any other reason, the coordinator restores it to
  the trigger.

Removing the focused item moves focus to the next item, then the previous item. If no item remains,
the menu closes and restores the trigger. Disabling a focused item does not move focus because
disabled menu items remain discoverable.

## Popup architecture

The implementation uses `popover="auto"` as its primary visibility and top-layer primitive. Native
light dismissal and close requests are observed rather than duplicated. The component still owns the
semantic keyboard model and synchronizes its reflected, read-only `open` state from platform toggle
events.

Placement is logical and collision-aware:

- the preferred default is `block-end-end` relative to the trigger;
- `block-end-start`, `block-end-end`, `block-start-start`, and `block-start-end` are accepted
  preferences, not guarantees;
- the popup first flips in the block axis, then the inline axis, to remain inside the viewport;
- writing mode and direction determine logical start and end;
- a viewport inset, maximum block size, and internal scrolling keep every item reachable at zoom;
- placement changes never change DOM order, command order, or keyboard behavior.

CSS Anchor Positioning may supply the preferred and fallback placement when supported. Because its
Level 1 specification remains a working draft, a small menu-private geometry adapter provides the
same four logical placements when it is unavailable or incomplete. That adapter observes only the
open menu, its trigger, viewport, scroll, and resize changes. It is not exported as a general
floating-element or overlay API.

If the Popover API is unavailable, a client-only fallback reproduces visibility, Escape, outside
pointer dismissal, stacking, and placement for this menu only. The fallback does not promise
server-rendered interactivity, Declarative Shadow DOM, portal ownership, modal behavior, or nested
popup stacks.

## Command behavior

`wg-command-item` requires a non-empty `value` and visible default-slot label. User activation emits
one bubbling, composed `wg-command` event:

```ts
interface WgCommandDetail {
  readonly value: string;
  readonly trigger: 'keyboard' | 'pointer' | 'programmatic';
}
```

The event reports intent only. The application owns authorization, effects, asynchronous progress,
failure, retry, and confirmation. Programmatic `click()` follows the same disabled guard, identifies
its trigger accurately, and closes the containing menu without pretending to be trusted user input.

An activated item normally closes its menu. If an application needs several persistent choices,
checked values, or form editing, it needs a different pattern. Long-running command state must be
shown in the owning function after dismissal; hidden menu content is not the sole progress or error
surface.

Consequential command labels repeat the target: “Refresh intake data,” not “Refresh.” Critical or
destructive actions require the later proportional-friction policy and are not visually inferred
from an item value.

## Proposed public API

### `wg-menu`

Attributes and properties:

- `label: string`: optional accessible-name override, required for an icon-only trigger;
- `disabled: boolean`: disables the trigger and closes an open menu without moving focus unless
  focus would otherwise be hidden;
- `placement: 'block-end-start' | 'block-end-end' | 'block-start-start' | 'block-start-end'`;
- `readonly open: boolean`: reflected component-owned visibility state.

Methods:

- `focus(options?: FocusOptions): void`: delegates to the internal trigger;
- `show(options?: { focus?: 'first' | 'last' | 'none' }): void`;
- `hide(options?: { restoreFocus?: boolean }): void`;
- `toggle(options?: { focus?: 'first' | 'last' | 'none' }): void`.

Slots:

- `trigger`: required visible trigger content;
- default: direct `wg-command-item` and semantic `wg-divider` children.

Events:

- `wg-menu-toggle`, with `{ open, reason }`, where reason is `trigger`, `keyboard`, `command`,
  `escape`, `tab`, `outside`, or `programmatic`.

CSS parts:

- `trigger`, `trigger-content`, `popup`, and `menu`.

### `wg-command-item`

Attributes and properties:

- `value: string`: required stable application identifier;
- `disabled: boolean`: maps to `aria-disabled` while remaining focusable inside an open menu.

Slots:

- default: required visible label;
- `leading`: optional reinforcing content;
- `detail`: optional short visible explanation or consequence;
- `trailing`: optional reinforcing content.

Events:

- `wg-command`, with `WgCommandDetail`.

CSS parts:

- `item`, `leading`, `label`, `detail`, and `trailing`.

Methods:

- `click(): void`: emits a programmatic command when enabled.

## Presentation requirements

- Trigger and items retain at least 44 by 44 CSS-pixel targets.
- The popup is a neutral raised surface with a strong boundary and separation from the function
  underneath it; it does not look like a condition panel or folder selector.
- Visible command-item labels carry meaning. Icons and trailing hints reinforce but never replace
  command labels.
- Focus, disabled state, boundaries, and item grouping survive forced colors and grayscale.
- Hover, open, focused, and condition states remain distinct.
- Opening and placement require no motion. Any optional opacity or position transition is removed
  under reduced motion and never delays focus or interaction.
- Item labels and details wrap at text enlargement. The popup scrolls rather than clipping commands.
- Themes may substantially adapt typography, surfaces, corners, bands, and spacing while preserving
  semantics, target sizes, focus, grouping, and calm hierarchy.

## Client-only and failure behavior

Before upgrade, consumer baseline CSS should keep menu content hidden while leaving a visible,
non-interactive trigger. A critical or primary command must therefore have a visible non-menu route.
Failed registration, an unsupported child, a missing value, or an empty accessible label produces a
development diagnostic and never silently invents a command.

React wrappers type properties, methods, and custom-event callbacks but do not reproduce popup,
focus, or command behavior. The same production classes back vanilla examples, React examples, and
Storybook.

## Validation requirements

Implementation acceptance requires:

- native trigger activation, accessible name, `aria-haspopup`, expanded state, and menu ownership;
- focus entry from pointer, Enter, Space, Arrow Down, and Arrow Up;
- wrapping arrows, Home, End, buffered typeahead, composition handling, disabled discovery, and
  separators;
- one typed command event with accurate value and user trigger, plus disabled suppression;
- Escape, command, trigger, Tab, Shift+Tab, outside pointer, programmatic, disconnect, and mutation
  dismissal paths with correct focus behavior;
- Popover API and client fallback parity without duplicate events or listeners;
- logical placement, collision fallback, nested scrolling containers, viewport resize, text
  enlargement, 200% and 400% zoom, and mobile visual viewport behavior;
- dark and light themes, compact and comfortable density, forced colors, reduced motion, grayscale,
  touch targets, and pointer cancellation;
- dynamic insertion, removal, hiding, disabling, and label changes while open;
- explicit registration, failed upgrade guidance, typed React parity, and no import side effects;
- Chromium, Firefox, and WebKit automation plus representative VoiceOver/Safari review before API
  acceptance; NVDA/Firefox remains required before public release.

## Deferred decisions

- Navigation disclosure and navigation menus retain native-link-first contracts.
- Checked and radio menu items wait for a controlled local-choice contract.
- Nested menus wait for evidence that their complexity is justified on keyboard and touch inputs.
- Context menus require an invocation-context and focus-return contract.
- Command bars and command palettes belong to later operational patterns.
- General overlay, tooltip, combobox, dialog, toast, and viewer positioning are not inferred from
  the menu-private adapter.
- Confirmation dialogs and destructive-action policy remain in Phase 2E.
