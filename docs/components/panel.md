# Panel

## Purpose

`wg-panel` contains one explicitly named information, monitor, or control section within a function.

## When to Use

Use when content needs a visible section boundary and a declared purpose.

## When Not to Use

Do not use a panel solely for decoration, combine unrelated functions, or imply health on an
informational section.

## Anatomy

Heading, optional description, default content, and optional actions.

## Variants

Purpose is `information`, `monitor`, or `control`. Emphasis is `standard` or `strong`; emphasis
changes hierarchy, not condition.

## States

Panels may be busy or disabled only when the entire contained section shares that state. Domain
condition belongs to contained state components.

## Behavior

The heading labels the panel region. A busy panel retains its previous layout and exposes progress
text supplied by the consumer.

## Keyboard Interaction

The panel itself is not focusable. Slotted controls keep native behavior and reading order.

## Accessibility

The host exposes a region only when it has an accessible label. `busy` maps to `aria-busy`.
`disabled` does not disable slotted controls automatically; consumers must disable affected controls
explicitly.

## Responsive Behavior

Actions follow content in narrow containers and may align with the heading in wide containers.
Critical content must not be hidden.

## Content Guidance

Name the local section purpose and retain the owning function in surrounding context. Information
copy is neutral; monitor copy states freshness; control copy identifies target and consequence.

## API

### Attributes

- `purpose`: `information | monitor | control`; required.
- `emphasis`: `standard | strong`; default `standard`.
- `busy`: Boolean.
- `disabled`: Boolean.
- `label`: accessible fallback when no slotted heading can label the region.

### Properties

- `purpose: SectionPurpose`
- `emphasis: PanelEmphasis`
- `busy: boolean`
- `disabled: boolean`
- `label: string`

### Slots

- `heading`
- `description`
- default
- `actions`
- `progress`: visible busy-state text.

### Events

None.

### Methods

None.

### CSS Custom Properties

- `--wg-panel-color-background`
- `--wg-panel-color-border`
- `--wg-panel-color-text`
- `--wg-panel-radius`
- `--wg-panel-space`
- `--wg-panel-space-section`

### CSS Parts

- `base`
- `header`
- `heading`
- `description`
- `content`
- `actions`
- `progress`

## Examples

All three purposes, strong emphasis, busy with retained content, disabled controls, long content,
phone, and wall panel.

## Testing Requirements

Purpose reflection, accessible naming, busy semantics, slots, focus order, responsive actions, 200%
zoom, forced colors, loading, empty content, and disabled-control guidance.

## Open Questions

None.
