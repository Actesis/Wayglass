# Metric

## Purpose

`wg-metric` presents one labeled quantitative value with units, freshness, and optional known state.

## When to Use

Use for a current measurement or count whose context fits in a compact field.

## When Not to Use

Do not use for unlabeled numbers, complex trends, editable inputs, or values requiring a chart.

## Anatomy

Label, numeric or textual value, unit, optional description, and state metadata.

## Variants

Size is `compact` or `prominent`.

## States

Loading, available, stale, unavailable, warning, critical, and pending. Condition, knowledge, and
activity remain independent.

## Behavior

Value space is stable across expected updates. Numeric content uses tabular numerals. Loading and
unavailable retain label and unit context.

## Keyboard Interaction

None.

## Accessibility

Label, value, unit, and non-default known state form one text equivalent. Visual alignment does not
determine reading order.

## Responsive Behavior

Prominent values may reduce metadata density at narrow widths, but freshness and critical condition
remain available.

## Content Guidance

Include an unambiguous unit and useful precision. Do not imply certainty beyond the knowledge state.

## API

### Attributes

- `label`: required.
- `value`: string representation supplied by the application.
- `unit`: optional.
- `condition`: `Condition`; default `neutral`.
- `knowledge`: `Knowledge`; default `confirmed`.
- `activity`: `Activity`; default `idle`.
- `size`: `compact | prominent`; default `compact`.
- `loading`: Boolean.

### Properties

- `label: string`
- `value: string`
- `unit: string`
- `condition: Condition`
- `knowledge: Knowledge`
- `activity: Activity`
- `size: MetricSize`
- `loading: boolean`

### Slots

- `label`
- `trend`: Phase 3B extension for one `wg-trend-indicator` or compatible authored presentation; the
  metric does not calculate or copy its state.
- `description`
- `metadata`

### Events

None.

### Methods

None.

### CSS Custom Properties

- `--wg-metric-color-value`
- `--wg-metric-color-label`
- `--wg-metric-font-size-compact`
- `--wg-metric-font-size-prominent`
- `--wg-metric-space`
- `--wg-metric-size-value-minimum`

### CSS Parts

- `base`
- `label`
- `value`
- `unit`
- `trend`
- `description`
- `metadata`
- `knowledge`
- `activity`

## Examples

The production Storybook catalog covers counts, durations, loading, caution, critical, stale,
unavailable, pending, compact, and prominent presentations.

```ts
import { defineWgMetric } from '@wayglass/elements/metric';

defineWgMetric();
```

```html
<wg-metric label="Latency" value="184" unit="ms" condition="caution" knowledge="stale"></wg-metric>
```

## Testing Requirements

Reflection, accessible text, tabular numerals, stable value width, every required state, long units,
200% zoom, forced colors, reduced motion, and no tab stop.

## Open Questions

Locale-aware numeric formatting is consumer-owned in Phase 1 and remains a compatible future
capability.
