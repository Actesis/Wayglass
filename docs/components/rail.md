# Rail

## Purpose

`wg-rail` creates a neutral structural band that reinforces continuity or a function boundary.

## When to Use

Use beside or between content regions when the band materially clarifies ownership or hierarchy.

## When Not to Use

Do not use it as decoration, a Boolean-value indicator, a condition indicator, or a navigation
control. State signals belong to the component that labels the state.

## Anatomy

One inert band.

## Variants

Orientation is `block` or `inline`; weight is `standard` or `strong`.

## States

Rail has no domain, selection, or interaction states.

## Behavior

The rail is hidden from the accessibility tree and stretches along its assigned layout axis.

## Keyboard Interaction

None.

## Accessibility

It has no role, accessible name, or focus behavior. Meaningful grouping must exist in semantic HTML
without the rail.

## Responsive Behavior

Consumers may change orientation during recomposition. The rail never conveys ordering by itself.

## Content Guidance

Rail accepts no content.

## API

### Attributes

- `orientation`: `block | inline`; default `block`.
- `weight`: `standard | strong`; default `standard`.

### Properties

- `orientation: RailOrientation`
- `weight: RailWeight`

### Slots

None.

### Events

None.

### Methods

None.

### CSS Custom Properties

- `--wg-rail-color`
- `--wg-rail-size-standard`
- `--wg-rail-size-strong`
- `--wg-rail-radius`

### CSS Parts

- `band`

## Examples

Function boundary, horizontal recomposition, standard, and strong.

## Testing Requirements

Orientation, logical sizing, hidden accessibility semantics, forced colors, and absence from tab
order.

## Open Questions

None.
