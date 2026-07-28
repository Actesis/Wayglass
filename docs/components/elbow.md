# Elbow

## Purpose

`wg-elbow` joins a heading band to a structural rail so function identity and content ownership
remain visually connected.

## When to Use

Use at the heading edge of a function zone when a simple boundary does not communicate ownership
strongly enough.

## When Not to Use

Do not recreate franchise-specific framing, use an elbow without a function label, or assign
condition color to it. Do not use `wg-elbow` as a tab, selector, button, or substitute for the
planned Function Deck.

## Anatomy

A labeled heading region and an inert joining band.

## Variants

Placement is `start` or `end` using logical direction. Weight is `standard` or `strong`.

## States

Elbow has no domain or interaction states.

## Behavior

The label remains normal slotted content; the joining geometry is decorative. The component never
acquires hover, focus, pressed, selected, or pointer behavior. Its continuous heading-to-rail
geometry distinguishes static ownership from the discrete selectors of an interactive
[Function Deck](../patterns/function-deck.md).

Importing the module does not register the element:

```ts
import { defineWgElbow } from '@wayglass/elements/elbow';

defineWgElbow();
```

## Keyboard Interaction

None.

## Accessibility

The label should contain or reference the function heading. Geometry is hidden from assistive
technology.

## Responsive Behavior

At narrow widths the join may flatten into a block-edge heading band without changing content order.

## Content Guidance

Use a concise domain function name, not a condition or action.

## API

### Attributes

- `placement`: `start | end`; default `start`.
- `weight`: `standard | strong`; default `standard`.

### Properties

- `placement: ElbowPlacement`
- `weight: ElbowWeight`

### Slots

- default: function heading content.

### Events

None.

### Methods

None.

### CSS Custom Properties

- `--wg-elbow-color-background`
- `--wg-elbow-color-text`
- `--wg-elbow-size-band`
- `--wg-elbow-radius`
- `--wg-elbow-space-inline`

### CSS Parts

- `base`
- `label`
- `join`

## Examples

```html
<wg-elbow weight="strong">
  <h2>Communications</h2>
</wg-elbow>
```

Storybook includes start, end, narrow-container flattening, and long-label production fixtures.

## Testing Requirements

Slot semantics, logical placement, narrow recomposition, forced colors, 200% zoom, and no tab stop.

## Open Questions

None.
