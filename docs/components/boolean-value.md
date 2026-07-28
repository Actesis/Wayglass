# Boolean Value

## Purpose

`wg-boolean-value` presents a genuinely Boolean domain value as asserted or not asserted without
assigning health meaning.

## When to Use

Use for paired domain values such as On/Off, Open/Closed, Verified/Unverified, or
Connected/Disconnected.

## When Not to Use

Do not flatten finite states such as moving, obstructed, partial, expired, or pending into a
Boolean. Do not use `false` to represent unknown or unavailable.

## Anatomy

A required label, attached value signal, domain value text, and optional knowledge detail.

## Variants

Presentation is `rail` or `field`. Rail is the compact default; field is prominent for wall-panel
and at-distance use.

## States

Value role is asserted or not asserted. Knowledge is independently confirmed, inferred, stale,
unknown, conflicting, or unavailable. Loading applies before any value has been received.

## Behavior

`asserted` controls fill and luminance. The domain labels remain consumer supplied. Knowledge never
changes `asserted`. When unavailable or stale, the last known value remains visible with explicit
knowledge text.

## Keyboard Interaction

None. This is a display, not a toggle.

## Accessibility

The accessible text includes label, current domain value label, and non-confirmed knowledge.
Asserted and not asserted differ without hue or icons. Loading exposes busy state without announcing
a false value.

## Responsive Behavior

Presentation changes only through the property or a consumer-authored responsive rule. Text remains
adjacent to its signal.

## Content Guidance

Provide domain labels, never raw `true`, `false`, `yes`, or `no` when domain terms are known.

## API

### Attributes

- `label`: required accessible and visible fallback label.
- `asserted`: Boolean; absent means not asserted, not unknown.
- `asserted-label`: required domain label for asserted.
- `not-asserted-label`: required domain label for not asserted.
- `knowledge`: `Knowledge`; default `confirmed`.
- `presentation`: `rail | field`; default `rail`.
- `loading`: Boolean.

### Properties

- `label: string`
- `asserted: boolean`
- `assertedLabel: string`
- `notAssertedLabel: string`
- `knowledge: Knowledge`
- `presentation: BooleanValuePresentation`
- `loading: boolean`

### Slots

- `label`: overrides visible label.
- `detail`

### Events

None.

### Methods

None.

### CSS Custom Properties

- `--wg-boolean-value-color-asserted`
- `--wg-boolean-value-color-not-asserted`
- `--wg-boolean-value-color-text`
- `--wg-boolean-value-size-rail`
- `--wg-boolean-value-size-field`
- `--wg-boolean-value-radius`
- `--wg-boolean-value-space`

### CSS Parts

- `base`
- `signal`
- `label`
- `value`
- `knowledge`
- `detail`

## Examples

The production Storybook catalog covers On/Off, Open/Closed, Verified/Unverified, stale and
unavailable knowledge, loading, rail, and field presentations.

```ts
import { defineWgBooleanValue } from '@wayglass/elements/boolean-value';

defineWgBooleanValue();
```

```html
<wg-boolean-value
  label="Email address"
  asserted
  asserted-label="Verified"
  not-asserted-label="Unverified"
></wg-boolean-value>
```

## Testing Requirements

Boolean reflection, domain labels, retained last-known value, unknown not coerced false, accessible
summary, loading semantics, grayscale, forced colors, icon-free recognition, and no tab stop.

## Open Questions

None.
