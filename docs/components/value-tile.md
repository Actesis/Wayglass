# Value Tile

## Purpose

`wg-value-tile` composes a labeled primary value, supporting state, context, and optional local
action into one stable monitoring surface.

## When to Use

Use when one value deserves stronger hierarchy than an inline Boolean value or metric.

## When Not to Use

Do not use as a generic card, combine unrelated values, or make the entire tile clickable when it
contains distinct actions.

## Anatomy

Heading, primary-value slot, optional status, description, metadata, and actions.

## Variants

Emphasis is `standard` or `prominent`. Purpose is always monitor; informational and control sections
remain separate panels even when composed nearby.

## States

Loading, available, warning, critical, stale, unavailable, disabled actions, and pending action.
State comes from the slotted production value component rather than a duplicate tile status model.

## Behavior

The tile provides layout and accessible grouping. It does not infer or copy domain value, condition,
knowledge, or activity from slotted children. Actions remain visibly local and preserve the primary
value during pending updates.

## Keyboard Interaction

The tile is not focusable. Slotted controls follow native order after the value and context.

## Accessibility

The heading labels the grouped region. Slotted state components provide their own text equivalents.
The tile avoids duplicate announcements.

## Responsive Behavior

Actions move below value context in narrow containers. Prominent wall-panel layout increases signal
and type size without changing reading order.

## Content Guidance

Use one primary question per tile. Supporting copy should explain freshness, cause, or consequence.

## API

### Attributes

- `label`: accessible fallback when the heading slot cannot label the region.
- `emphasis`: `standard | prominent`; default `standard`.
- `busy`: Boolean; default `false`.

### Properties

- `label: string`
- `emphasis: ValueTileEmphasis`
- `busy: boolean`

### Slots

- `heading`
- `value`: required `wg-boolean-value`, `wg-metric`, or compatible value component.
- `status`: optional `wg-status-indicator`.
- default: supporting context.
- `metadata`
- `actions`
- `progress`

### Events

None. Slotted controls emit their native or documented events.

### Methods

None.

### CSS Custom Properties

- `--wg-value-tile-color-background`
- `--wg-value-tile-color-border`
- `--wg-value-tile-radius`
- `--wg-value-tile-space`
- `--wg-value-tile-space-section`

### CSS Parts

- `base`
- `header`
- `heading`
- `value`
- `status`
- `content`
- `metadata`
- `actions`
- `progress`

## Examples

The production Storybook composition covers Boolean rails and fields, metrics, mixed condition and
knowledge, pending actions, and phone, desktop, and wall-panel widths.

```ts
import { defineWgValueTile } from '@wayglass/elements/value-tile';

defineWgValueTile();
```

```html
<wg-value-tile>
  <h2 slot="heading">Communications primary link</h2>
  <wg-status-indicator slot="status" label="Primary link" condition="caution">
  </wg-status-indicator>
  <wg-metric slot="value" label="Latency" value="184" unit="ms"></wg-metric>
  <p>The primary link remains connected.</p>
</wg-value-tile>
```

## Testing Requirements

Accessible grouping, slot restrictions or guidance, no duplicate state model, busy semantics, focus
order, stable loading layout, responsive actions, 200% zoom, forced colors, and reduced motion.

## Open Questions

None. Phase 1 documents preferred value elements but does not enforce tag names at runtime.
Compatible value components remain composable without creating a closed allowlist.
