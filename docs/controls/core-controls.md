# Phase 2D-B core-control contracts

**Status:** Accepted and implemented for Phase 2D-B on July 31, 2026. Semantic and implementation
ownership is recorded in [ADR 0016](../architecture/adr/0016-core-control-semantics.md). Operational
request behavior follows the accepted [control-state contract](./control-state.md). Automated and
visual evidence is recorded in the
[Phase 2D-B validation record](../accessibility/phase-2d-core-controls-validation.md);
representative screen-reader acceptance remains open.

These contracts define `wg-icon-button`, `wg-toggle`, `wg-segmented-control`, `wg-segment`, and
`wg-navigation-rail` before tokens or implementation are locked.

## Shared requirements

All Phase 2D-B controls:

- import without registering themselves and expose explicit registration functions;
- retain a minimum 44 by 44 CSS-pixel target for each interactive item;
- use visible `:focus-visible` treatment and ordinary source-order entry;
- preserve meaning in dark, light, forced-colors, reduced-motion, grayscale, and without icons;
- distinguish disabled, unavailable, pending, checked, selected, current, and focused states;
- add no condition color unless a separate condition genuinely warrants it;
- preserve stable focus during remote updates and programmatic state changes;
- expose no viewport-specific semantics or automatic reordering;
- use the same production element classes through typed React wrappers.

## `wg-icon-button`

### Purpose

`wg-icon-button` exposes a compact immediate command through a familiar optional icon and a required
accessible name. Use it where space is constrained and the command remains clear in context, such as
dismiss, reveal more actions, or refresh a nearby named region.

Do not use it when visible text materially reduces ambiguity, for primary workflow actions, for
navigation, for persistent Boolean values, or as the only representation of a consequential action.

### Anatomy and semantics

The component contains one internal native `<button type="button">`, a decorative icon slot, and
pending presentation. The internal button owns focus, activation, accessible name, disabled state,
and busy state. The host is not a second control.

The `label` remains stable while state changes. The icon never supplies the accessible name. An
official `wg-icon` inside the default slot uses no label; consumer-authored SVG uses
`aria-hidden="true"` and `focusable="false"`.

### States and behavior

- `default`, `hover`, `active`, and `focus-visible` are ordinary native-button states.
- `pending` retains focus, preserves the accessible name, exposes busy state, and suppresses repeat
  activation.
- `disabled` uses native disabled behavior and suppresses activation.

User activation emits the native `click` event. No Wayglass event duplicates it. Programmatic
`click()` is suppressed while pending or disabled.

### Keyboard interaction

Enter and Space follow native button behavior. No arrow keys or shortcuts are captured.

### API

#### Attributes and properties

- `label: string`: required accessible name.
- `appearance: quiet | secondary`; default `quiet`.
- `disabled: boolean`; default `false`.
- `pending: boolean`; default `false`.
- `pending-label: string`; default `Working on {label}`.

Critical and primary icon-only appearances are intentionally absent. Those actions require visible
text through `wg-button` or a later confirmation pattern.

#### Slots

- default: exactly one decorative icon.
- `pending`: optional stable nonessential pending graphic; it cannot replace the accessible pending
  text.

#### Methods and events

- `focus(options?: FocusOptions): void`
- `click(): void`
- native `click` after user or allowed programmatic activation

#### CSS parts

- `button`
- `icon`
- `pending`

#### CSS custom properties

- `--wg-icon-button-color-background`
- `--wg-icon-button-color-background-hover`
- `--wg-icon-button-color-border`
- `--wg-icon-button-color-text`
- `--wg-icon-button-radius`
- `--wg-icon-button-size`

### Content and fallback

The accessible label names the action and target, not the glyph: “Dismiss account notice,” not
“Close icon.” Repeated icon buttons in different regions include distinct targets.

Before upgrade, an icon button is not interactive. Its command must not be the only route to a
critical or required action. Missing or failed icon rendering leaves the upgraded button named and
operable.

## `wg-toggle`

### Purpose

`wg-toggle` requests one of two domain values while preserving confirmed truth until the application
confirms a change. It is suitable for On/Off, Enabled/Disabled, Open/Closed, or other genuinely
Boolean operational values.

Do not use it for local view selection, independent pressed commands, tri-state values, unknown as
false, or finite values with more than two meaningful states.

### Anatomy and semantics

The component contains one native `<button type="button" role="switch">`, a visible stable label, an
icon-free asserted/not-asserted signal, confirmed domain-value text, optional request text, and an
associated feedback region.

`aria-checked` always reflects the confirmed `asserted` value. The accessible label does not change
between states. Confirmed domain terms remain visible so a person can scan without interpreting raw
“checked” language.

### Attributes and properties

- `label: string`: required stable control label.
- `asserted: boolean`: confirmed value; default `false`.
- `asserted-label: string`: required confirmed asserted term.
- `not-asserted-label: string`: required confirmed not-asserted term.
- `requested: none | asserted | not-asserted`; default `none`.
- `request-state: idle | pending | rejected`; default `idle`.
- `availability: available | unavailable`; default `available`.
- `disabled: boolean`; default `false`.

`pending` or `rejected` authoring requires a non-`none` requested value and useful feedback. Invalid
combinations receive development diagnostics and normalize presentation to confirmed truth; they do
not invent a request.

### Slots

- `label`: overrides the visible label while `label` remains the accessible fallback.
- `detail`: persistent supporting context.
- `feedback`: request or availability feedback. Consumers add `role="status"` only when an
  asynchronous change warrants announcement.

### Behavior and event

Available, enabled, idle, or rejected activation proposes the opposite of confirmed `asserted`.
Pending activation is suppressed by default. Unavailable and disabled activation are suppressed.

User activation emits one bubbling, composed `wg-toggle-request` event:

```ts
interface WgToggleRequestDetail {
  readonly requestedAsserted: boolean;
  readonly confirmedAsserted: boolean;
  readonly trigger: 'keyboard' | 'pointer';
}
```

The event does not mutate any public property. Programmatic property updates do not emit it or move
focus. A rejected request may be retried by activating the control again; the application returns it
to pending if the retry begins.

### Keyboard interaction

- Space emits a request when allowed.
- Enter also emits a request, following the internal native button convention.
- No arrow keys are captured.

### Accessibility

- `role="switch"` and `aria-checked` expose the confirmed value.
- Pending uses busy and disabled-like semantics without removing the focused control from the tab
  sequence.
- Unavailable presentation exposes disabled semantics and a useful reason.
- Rejection is associated feedback, not `aria-invalid`.
- Signal luminance, shape, domain-value text, request text, and feedback remain distinguishable
  without hue or icons.

### CSS parts

- `button`
- `signal`
- `label`
- `confirmed-value`
- `request`
- `detail`
- `feedback`

### CSS custom properties

- `--wg-toggle-color-background`
- `--wg-toggle-color-border`
- `--wg-toggle-color-text`
- `--wg-toggle-color-asserted`
- `--wg-toggle-color-not-asserted`
- `--wg-toggle-radius`
- `--wg-toggle-size-signal`
- `--wg-toggle-space`

### Example

```html
<wg-toggle
  label="Notifications"
  asserted-label="On"
  not-asserted-label="Off"
  requested="asserted"
  request-state="pending"
>
  <span slot="feedback" role="status"> Enabling notifications; confirmed state remains Off. </span>
</wg-toggle>
```

## `wg-segmented-control` and `wg-segment`

### Purpose

The segmented compound control selects exactly one local option from a small, stable set. Use it for
immediate presentation or scope choices such as Compact/Comfortable or Day/Week/Month when selection
does not navigate, submit a form, or claim remote domain truth.

Do not use it for independent toggles, multiple selection, tabs with associated panels, application
navigation, form radio groups, or consequential operational changes.

### Anatomy and semantics

`wg-segmented-control` is the named `radiogroup` coordinator. Each direct `wg-segment` is one
focusable `radio`. The hosts carry roles, checked state, disabled state, and roving tab indices in
one light-DOM relationship graph. Shadow DOM owns presentation only and contains no nested buttons.

Exactly one enabled valid segment is selected when an enabled segment exists. Duplicate, empty, or
misplaced values are invalid and excluded deterministically.

### Coordinator API

#### Attributes and properties

- `value: string`: selected segment value.
- `orientation: horizontal | vertical`; default `horizontal`.

The coordinator requires an accessible name through consumer-authored `aria-label` or
`aria-labelledby`.

#### Slots

- default: two or more direct `wg-segment` children.

#### Event

User selection emits one bubbling, composed `wg-segment-change` event:

```ts
interface WgSegmentChangeDetail {
  readonly value: string;
  readonly previousValue: string;
  readonly trigger: 'keyboard' | 'pointer';
}
```

Programmatic selection is synchronous and silent.

#### Methods

- `focusSelected(options?: FocusOptions): void`

### Segment API

- `value: string`: required unique selection value.
- `disabled: boolean`; default `false`.
- default slot: required visible label.
- `detail` slot: optional concise supporting text that remains part of the segment's description,
  not its accessible name.

Managed `aria-checked`, `tabindex`, and selected presentation are coordinator-owned and are not
independent author properties.

### Keyboard interaction

| Key                | Behavior                                                   |
| ------------------ | ---------------------------------------------------------- |
| Tab / Shift+Tab    | Enter or leave through the selected segment                |
| Right / Down Arrow | Focus and select the next enabled segment, wrapping        |
| Left / Up Arrow    | Focus and select the previous enabled segment, wrapping    |
| Home               | Focus and select the first enabled segment                 |
| End                | Focus and select the last enabled segment                  |
| Space              | Select the focused segment when it is not already selected |

Horizontal direction follows computed text direction for Left and Right Arrow. Up and Down retain
next/previous logical order in both text directions. No manual activation mode is provided because
local selection must be inexpensive and immediately available.

When the selected segment is removed or disabled, selection falls to the next enabled segment, then
the previous, then empty. Focus moves only when the focused segment itself becomes invalid.

### Responsive behavior

Visible labels remain intact. Segments may wrap only when visual order and arrow-key order remain
obvious; the default implementation uses one row and an explicitly labeled horizontal scroll region
when needed. The component never changes its value or orientation because of viewport size.

### CSS parts and properties

Coordinator parts:

- `group`

Segment parts:

- `segment`
- `label`
- `detail`

Custom properties:

- `--wg-segmented-color-background`
- `--wg-segmented-color-border`
- `--wg-segmented-color-selected`
- `--wg-segmented-color-text`
- `--wg-segmented-radius`
- `--wg-segmented-space`
- `--wg-segmented-size-minimum`

## `wg-navigation-rail`

### Purpose

`wg-navigation-rail` presents a stable set of primary or contextual destinations in a banded rail.
It reinforces orientation without becoming a router, tablist, toolbar, or operational function
selector.

Use it inside a consumer-authored, labeled `<nav>` for native links that change URL, history entry,
or application destination. Use tabs or Function Deck selection for peer panels in one context.

### Anatomy and ownership

The component is an inert presentation wrapper. Its direct children are consumer-authored native
links. Each link owns `href`, target behavior, download and relationship attributes, framework
routing interception, accessible name, focus, activation, and optional `aria-current="page"`.

The surrounding native `<nav>` owns landmark semantics and its accessible name. The rail adds no
role, selection value, roving focus, keyboard event handling, or navigation event.

```html
<nav aria-label="Primary">
  <wg-navigation-rail orientation="vertical">
    <a href="/overview" aria-current="page">Overview</a>
    <a href="/activity">Activity</a>
    <a href="/settings">Settings</a>
  </wg-navigation-rail>
</nav>
```

### API

#### Attributes and properties

- `orientation: vertical | horizontal`; default `vertical`.

Orientation controls layout only. It adds no `aria-orientation` because navigation is not a
composite widget.

#### Slots

- default: one or more direct native links with visible text labels.

Icon-only and automatically collapsed navigation are not part of the initial contract. Optional
decorative icons may reinforce visible labels.

#### Events and methods

None. Native link events and methods remain on the links.

#### CSS parts

- `rail`

#### CSS custom properties

- `--wg-navigation-rail-color-background`
- `--wg-navigation-rail-color-border`
- `--wg-navigation-rail-color-current`
- `--wg-navigation-rail-color-text`
- `--wg-navigation-rail-radius`
- `--wg-navigation-rail-space`
- `--wg-navigation-rail-link-size-minimum`

### Keyboard and responsive behavior

Tab and Shift+Tab follow ordinary link order. Enter follows native link activation. Arrow keys,
Home, End, and Space are not captured.

Applications author horizontal navigation deliberately for a compact composition. The component does
not automatically move, collapse, hide labels, or become a menu at a breakpoint. Overflow must
remain locally scrollable without causing page overflow, and the current link remains discoverable.

## Icon dependency

`wg-icon-button` is the first required consumer of the accepted `wg-icon` foundation contract. The
implementation milestone will establish `@wayglass/icons` and lock a minimal domain-neutral catalog
needed by production fixtures. The catalog will not add home-automation assets, brand marks, or
franchise-specific glyphs merely to fill out a showcase.

## Validation requirements

Implementation must cover:

- explicit registration, failed upgrade, missing icons, and React wrapper parity;
- icon-button naming, native activation, pending focus retention, and disabled suppression;
- toggle confirmed/requested separation, pending and rejected requests, retry, unavailable target,
  unknown knowledge, typed events, and remote updates;
- segmented radio relationships, accessible group name, roving focus, keyboard selection, disabled
  skipping, right-to-left direction, mutation fallback, and silent programmatic updates;
- navigation landmarks, native links, current-page state, modified-click behavior, source-order
  focus, framework routing, and overflow;
- visible labels and state without hue or icons;
- 44-by-44 targets, dark/light themes, compact/comfortable density, forced colors, reduced motion,
  grayscale, 200% and 400% zoom, and text enlargement;
- phone, desktop, and wall-display fixtures in Chromium, Firefox, and WebKit;
- representative screen-reader review for switch and custom radio-host interoperability.

## Deferred decisions

- Menus, menu buttons, command items, popup positioning, and dismissal belong to Phase 2D-C.
- Form radio groups remain consumer-authored native controls under Phase 2D-D/E.
- Toolbars and their specialized nested-radio keyboard behavior are not part of this milestone.
- Icon-only navigation, automatic rail collapse, and responsive destination migration are deferred.
- Operational finite-value requests require a future contract and do not reuse segmented selection.
- Confirmation dialogs and destructive icon actions remain in Phase 2E.
