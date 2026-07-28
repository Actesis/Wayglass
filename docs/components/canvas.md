# Canvas

## Purpose

`wg-canvas` establishes the page-level Wayglass surface, content measure, and responsive composition
context.

## When to Use

Use once around a full Wayglass screen or bounded application surface.

## When Not to Use

Do not use it for nested cards, overlays, or function sections.

## Anatomy

An optional header slot, default content region, and optional footer slot.

## Variants

`contained` constrains content to the standard measure; `full` fills the available inline size.

## States

Canvas has no domain or interaction states.

## Behavior

Canvas supplies page padding and a named container. It does not scroll-lock, route, or manage
application state.

## Keyboard Interaction

None.

## Accessibility

The element renders no implicit landmark so applications can choose the correct native `main`
structure. Slotted landmark semantics remain intact.

## Responsive Behavior

Page padding compacts on narrow containers and expands for desktop and wall-panel fixtures.

## Content Guidance

Provide one visible page title in the header or default slot.

## API

### Attributes

- `width`: `contained | full`; default `contained`.

### Properties

- `width: CanvasWidth`

### Slots

- `header`
- default
- `footer`

### Events

None.

### Methods

None.

### CSS Custom Properties

- `--wg-canvas-color-background`
- `--wg-canvas-size-content`
- `--wg-canvas-space-block`
- `--wg-canvas-space-inline`

### CSS Parts

- `base`
- `content`

## Examples

Phone, desktop, wall panel, contained, and full width.

## Testing Requirements

Slot order, logical padding, container behavior, 200% zoom, left-to-right and right-to-left
compatibility, and stable layout.

## Open Questions

None.
