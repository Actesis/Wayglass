# Button

## Purpose

`wg-button` communicates and submits a user action with native button semantics.

## When to Use

Use for immediate commands and explicit state-change requests.

## When Not to Use

Do not use for navigation, persistent Boolean state display, form submission during Phase 1, or
actions whose target is ambiguous.

## Anatomy

A native button containing optional leading content, label content, optional trailing content, and
pending feedback.

## Variants

Appearance is `primary`, `secondary`, or `critical`. `critical` is reserved for destructive,
irreversible, or high-impact actions and does not mean the surrounding system is critical.

## States

Default, hover, active, focus-visible, pending, and disabled.

## Behavior

Click and keyboard activation use the internal native button with `type="button"`. Pending
suppresses repeat activation and preserves the label and width. The component reports user intent;
it does not optimistically change domain state.

Importing the module does not register the element:

```ts
import { defineWgButton } from '@wayglass/elements/button';

defineWgButton();
```

## Keyboard Interaction

Enter and Space activate according to native button behavior. Disabled and pending buttons do not
activate.

## Accessibility

The slotted label provides the accessible name. Pending maps to `aria-disabled` and `aria-busy`
while retaining focus. Visible pending text is available to assistive technology. Icon-only usage is
not supported by this component.

## Responsive Behavior

The target remains at least 44 by 44 CSS pixels. Labels wrap only when the consumer allows a
full-width narrow layout.

## Content Guidance

Use a verb and, for consequential actions, repeat the owning function or target.

## API

### Attributes

- `appearance`: `primary | secondary | critical`; default `secondary`.
- `disabled`: Boolean.
- `pending`: Boolean.

### Properties

- `appearance: ButtonAppearance`
- `disabled: boolean`
- `pending: boolean`

### Slots

- `leading`: optional decorative or labeled content.
- default: required visible label.
- `trailing`: optional supporting content.
- `pending-label`: defaults to “Working”.

### Events

Native `click` from user activation. No separate Wayglass event duplicates it.

### Methods

- `focus(options?: FocusOptions): void`
- `click(): void`

### CSS Custom Properties

- `--wg-button-color-background`
- `--wg-button-color-background-hover`
- `--wg-button-color-text`
- `--wg-button-color-border`
- `--wg-button-radius`
- `--wg-button-space-block`
- `--wg-button-space-inline`
- `--wg-button-size-minimum`

### CSS Parts

- `button`
- `label`
- `leading`
- `trailing`
- `pending`

## Examples

```html
<wg-button appearance="secondary"> Retry Communications primary link </wg-button>
```

Storybook includes all appearances, pending, disabled, long scoped labels, keyboard activation,
compact density, and comfortable density.

## Testing Requirements

Native activation, focus delegation, disabled and pending suppression, retained focus, accessible
name, pending announcement, touch target, forced colors, and reduced motion.

## Open Questions

Form participation belongs to the Phase 2 form-control contract and must not be approximated through
Shadow DOM in Phase 1.
