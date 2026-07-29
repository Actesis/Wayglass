# Tabs

**Status:** Accepted for Phase 2A on July 28, 2026, together with
[ADR 0009](../architecture/adr/0009-tabs-architecture.md).

**Implementation:** The framework-neutral Custom Elements interaction model and typed React wrappers
and production-backed stories and examples are complete. Automated validation is recorded in the
[Phase 2A tabs validation record](../accessibility/phase-2a-tabs-validation.md), together with the
completed VoiceOver and Safari acceptance review.

## Purpose

The tabs compound component lets people select one peer view from a stable, labeled set while
exposing the established `tablist`, `tab`, and `tabpanel` accessibility pattern.

Selection is composition state. It does not communicate domain value, operational condition,
knowledge, or activity.

## When to Use

Use tabs when:

- the choices are peer views within one context;
- exactly one associated panel is visible at a time;
- switching is inexpensive and reversible;
- hidden content remains honestly represented by its selector;
- the selector set is small and stable enough for spatial memory.

The planned [Function Deck](../patterns/function-deck.md) composes this primitive for peer
operational functions.

## When Not to Use

Do not use tabs:

- for navigation between unrelated destinations;
- to hide information, monitor, and control sections that need to be understood together;
- when switching discards unsaved work or confirmed state;
- when hiding a panel would conceal the only path to a critical response;
- as a replacement for buttons, segmented values, accordions, or static `wg-elbow` headings.

## Anatomy

The compound API contains four elements:

1. `wg-tabs`: selection and keyboard coordinator;
2. `wg-tab-list`: labeled set of peer selectors;
3. `wg-tab`: one focusable selector;
4. `wg-tab-panel`: the view associated with one selector.

Each `wg-tab` and `wg-tab-panel` has the same unique, non-empty `value`. One `wg-tab-list` and at
least one valid tab-panel pair are required.

```html
<wg-tabs value="access" activation="automatic">
  <wg-tab-list aria-label="Operational functions">
    <wg-tab value="access">Access</wg-tab>
    <wg-tab value="communications">
      Communications
      <span slot="summary">Caution · Data stale</span>
    </wg-tab>
    <wg-tab value="processing">
      Processing
      <span slot="summary">Critical · Pause pending</span>
    </wg-tab>
  </wg-tab-list>

  <wg-tab-panel value="access">Access content</wg-tab-panel>
  <wg-tab-panel value="communications">Communications content</wg-tab-panel>
  <wg-tab-panel value="processing">Processing content</wg-tab-panel>
</wg-tabs>
```

## Variants

### Activation

- `automatic`: moving focus to an enabled tab also selects it. This is the default and is
  appropriate only when every panel can be displayed without noticeable latency.
- `manual`: arrow keys move focus without changing the visible panel. Enter or Space selects the
  focused tab.

The Function Deck uses automatic activation while its panel content is local and immediately
available. Applications that fetch content on selection must use manual activation or preload it.

### Orientation

- `horizontal`: Left and Right Arrow move among tabs. Up and Down Arrow retain browser scrolling.
- `vertical`: Up and Down Arrow move among tabs. Left and Right Arrow retain their ordinary
  behavior.

Horizontal movement follows computed text direction so keyboard movement remains visually logical in
both left-to-right and right-to-left contexts.

## States

- default;
- hover;
- active;
- focus-visible;
- selected;
- disabled.

Focus and selection are separate states and must remain separately visible. Disabled tabs are not
selectable and are skipped by roving focus. Selection styling uses shape, position, text, and
contrast rather than hue alone.

The `summary` slot may expose concise domain condition, knowledge, or activity text, but those
states remain consumer-owned content and never become tab selection state.

## Behavior

`wg-tabs` owns selection and the roving tab stop:

- exactly one enabled tab is selected when an enabled pair exists;
- the selected tab has `tabindex="0"` and all other tabs have `tabindex="-1"`;
- only the selected panel is rendered as available; other panels use the platform `hidden` behavior;
- every panel remains in the DOM so selection does not imply data disposal;
- each panel is focusable so Tab moves from the selected tab into the active working surface;
- pointer selection moves selection without moving focus away from the activated tab;
- programmatic selection does not move focus;
- remote content or state changes never move focus or selection.

The `value` on `wg-tabs` is the selection source of truth. Setting it programmatically selects the
matching enabled pair without emitting a user-action event. An absent or invalid value selects the
first enabled valid pair.

Duplicate, empty, unmatched, or misplaced values are invalid authoring. Invalid entries are excluded
from selection and keyboard navigation. Development builds should report a diagnostic; production
behavior must remain deterministic and must not throw during rendering.

When the selected pair is removed or disabled, selection moves to the next enabled pair in source
order, then the previous pair, then becomes empty. If focus was inside the removed pair, focus moves
to the replacement tab. Other DOM or remote-state updates preserve focus.

## Keyboard Interaction

| Key            | Horizontal                                                                | Vertical                                    |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| Tab            | Enters on the selected tab; from the list, proceeds to the selected panel | Same                                        |
| Shift+Tab      | Uses normal reverse page order                                            | Same                                        |
| Right Arrow    | Moves to the visually next enabled tab and wraps                          | Unmodified                                  |
| Left Arrow     | Moves to the visually previous enabled tab and wraps                      | Unmodified                                  |
| Down Arrow     | Unmodified                                                                | Moves to the next enabled tab and wraps     |
| Up Arrow       | Unmodified                                                                | Moves to the previous enabled tab and wraps |
| Home           | Moves to the first enabled tab                                            | Same                                        |
| End            | Moves to the last enabled tab                                             | Same                                        |
| Enter or Space | Selects the focused tab in manual activation mode                         | Same                                        |

In automatic activation mode, arrow, Home, and End movement also selects the newly focused tab. No
other keystrokes are canceled.

## Accessibility

- `wg-tab-list` exposes `role="tablist"` and requires an accessible name through `aria-label` or
  `aria-labelledby`.
- `wg-tab` exposes `role="tab"`, `aria-selected`, `aria-disabled` when applicable, and
  `aria-controls` referencing its panel.
- `wg-tab-panel` exposes `role="tabpanel"` and `aria-labelledby` referencing its tab.
- Tab and panel relationships use unique IDs in the same document tree.
- The selected panel is available to the accessibility tree; hidden panels are not.
- Roving `tabindex` leaves one tab in the page tab order.
- The panel focus stop provides a predictable path from selection into its working surface.
- Selected, focused, disabled, and consequential summary states remain distinguishable in forced
  colors and without color.

The initial implementation must be checked with browser accessibility trees and representative
screen readers before this contract is accepted.

## Responsive Behavior

Tabs preserve source order, accessible names, summaries, and selection at all widths.

- Selectors may wrap only when the resulting reading and arrow-key order remain obvious.
- Horizontal overflow may use a labeled scroll region, but the selected tab and consequential
  summaries must remain discoverable.
- Truncation must not remove the accessible name or the only visible consequential-state word.
- Targets remain at least 44 by 44 CSS pixels in both density modes.
- The active panel reflows without horizontal page overflow at 200% zoom.

Viewport size alone never changes overview content into tabs or selects a different function.

## Content Guidance

Use short, unique selector labels. Put concise, explicit state words in the `summary` slot when
hidden content needs representation. Do not use “active,” “good,” or selection color as a substitute
for domain state.

## API

### `wg-tabs`

#### Attributes and properties

- `value: string`: selected pair identifier.
- `activation: 'automatic' | 'manual'`: default `automatic`.
- `orientation: 'horizontal' | 'vertical'`: default `horizontal`.

#### Slots

- default: one `wg-tab-list` followed by associated `wg-tab-panel` elements.

#### Events

- `wg-tab-change`: bubbles and is composed after user-initiated selection changes.

```ts
interface WgTabChangeDetail {
  readonly value: string;
  readonly previousValue: string;
  readonly trigger: 'keyboard' | 'pointer';
}
```

Programmatic property or attribute changes do not emit `wg-tab-change`.

#### Methods

- `focusSelected(options?: FocusOptions): void`

### `wg-tab-list`

#### Attributes

The author supplies `aria-label` or `aria-labelledby`. `aria-orientation` is managed from the owning
`wg-tabs`.

#### Slots

- default: `wg-tab` elements.

#### CSS Parts

- `list`

### `wg-tab`

#### Attributes and properties

- `value: string`: required pair identifier.
- `disabled: boolean`: default `false`.

`role`, `aria-selected`, `aria-disabled`, `aria-controls`, and `tabindex` are managed states rather
than author inputs.

#### Slots

- default: required visible label.
- `summary`: optional concise supporting state text.

#### Methods

- `focus(options?: FocusOptions): void`

#### CSS Parts

- `tab`
- `label`
- `summary`
- `selection`

### `wg-tab-panel`

#### Attributes and properties

- `value: string`: required pair identifier.

`role`, `aria-labelledby`, `tabindex`, and `hidden` are managed states rather than author inputs.

#### Slots

- default: panel content.

#### Methods

- `focus(options?: FocusOptions): void`

#### CSS Parts

- `panel`

### Proposed CSS Custom Properties

The names are part of this draft; values are not locked until the Phase 2A token task.

- `--wg-tab-list-gap`
- `--wg-tab-color-background`
- `--wg-tab-color-background-selected`
- `--wg-tab-color-border`
- `--wg-tab-color-text`
- `--wg-tab-color-text-selected`
- `--wg-tab-color-selection`
- `--wg-tab-radius`
- `--wg-tab-space-block`
- `--wg-tab-space-inline`
- `--wg-tab-size-minimum`
- `--wg-tab-size-selection`
- `--wg-tab-panel-color-background`
- `--wg-tab-panel-color-border`
- `--wg-tab-panel-radius`
- `--wg-tab-panel-space`

## Registration Shape

Each element module is side-effect free and exports its class, tag name, types, and explicit
registration function. A convenience `tabs` entry point may define all four elements explicitly:

```ts
import { defineWgTabs } from '@wayglass/elements/tabs';

defineWgTabs();
```

Repeated registration is safe and conflicting constructors throw, consistent with Phase 1.

## Testing Requirements

- normalization and invalid authoring;
- initial, pointer, keyboard, and programmatic selection;
- automatic and manual activation;
- horizontal, vertical, left-to-right, and right-to-left navigation;
- roving tab stop and focus-visible treatment;
- tab-panel names, relationships, hidden state, and accessibility tree;
- disabled, removed, reordered, and dynamically added pairs;
- focus stability during remote updates and deterministic fallback after removal;
- event detail, bubbling, composition, and suppression for programmatic changes;
- touch targets, narrow overflow, 200% zoom, reduced motion, and forced colors;
- dark and light themes;
- Chromium, Firefox, and WebKit;
- vanilla Custom Element and typed React use.

## Open Questions

- Confirm whether wrapping or horizontal scrolling is the safer default for long selector sets after
  testing the Function Deck fixtures.

## References

- [WAI-ARIA Authoring Practices tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [WAI-ARIA 1.2 tab, tablist, and tabpanel roles](https://www.w3.org/TR/wai-aria-1.2/)
