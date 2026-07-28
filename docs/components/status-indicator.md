# Status Indicator

## Purpose

`wg-status-indicator` presents labeled condition, knowledge, and activity without conflating their
meanings.

## When to Use

Use for a current operational state that benefits from compact, glanceable reinforcement.

## When Not to Use

Do not use for a plain Boolean domain value, decorate informational content, or create unlabeled
activity lights.

## Anatomy

A rounded-square signal, required label, optional detail, freshness text, and activity text.

## Variants

Size is `compact` or `prominent`. Compact is the default; prominent supports distance reading.

## States

Condition is `neutral`, `informational`, `positive`, `caution`, or `critical`. Knowledge is
`confirmed`, `inferred`, `stale`, `unknown`, `conflicting`, or `unavailable`. Activity is `idle` or
`pending`.

## Behavior

All axes render independently. Condition controls stoplight emphasis. Knowledge and activity add
text and geometry; they do not overwrite condition. Updates retain stable space.

## Keyboard Interaction

None.

## Accessibility

The component exposes one text-equivalent status. The accessible summary includes the label and all
non-default axes. Color and animation are redundant. Consumers choose a live-region context when an
update warrants announcement; the component is not live by default.

## Responsive Behavior

Compact may become prominent only through explicit consumer configuration, not viewport inference.
Supporting detail wraps without separating from the label.

## Content Guidance

Use a domain label and concise state words such as “Primary link, caution, data stale.”

## API

### Attributes

- `label`: required accessible and visible fallback label.
- `condition`: `Condition`; default `neutral`.
- `knowledge`: `Knowledge`; default `confirmed`.
- `activity`: `Activity`; default `idle`.
- `size`: `compact | prominent`; default `compact`.

### Properties

- `label: string`
- `condition: Condition`
- `knowledge: Knowledge`
- `activity: Activity`
- `size: StatusIndicatorSize`

### Slots

- `label`: overrides visible label while `label` remains the accessible fallback.
- `detail`

### Events

None.

### Methods

None.

### CSS Custom Properties

- `--wg-status-indicator-color-condition`
- `--wg-status-indicator-color-border`
- `--wg-status-indicator-size-compact`
- `--wg-status-indicator-size-prominent`
- `--wg-status-indicator-radius`
- `--wg-status-indicator-space`

### CSS Parts

- `base`
- `signal`
- `label`
- `detail`
- `knowledge`
- `activity`

## Examples

Every condition, every knowledge state, pending activity, mixed axes, icon-free compact cluster,
prominent wall display, and live-region host.

## Testing Requirements

Axis reflection, accessible summary, all combinations used by the reference slice, stable width,
grayscale, color-vision checks, forced colors, reduced motion, and no tab stop.

## Open Questions

None.
