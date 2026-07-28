# Theme Provider

## Purpose

`wg-theme-provider` establishes Wayglass theme and density context for its descendants.

## When to Use

Use one provider around an application or isolated themed region. Nest a provider only when a
contained preview intentionally needs another theme or density.

## When Not to Use

Do not use it as a visual container or application-state provider.

## Anatomy

A context host and one default content slot.

## Variants

Official Phase 1 themes are `wayglass-dark` and `wayglass-light`. Theme selection may also be
`system`. Density is `compact` or `comfortable`.

## States

Theme resolution is synchronous. Invalid names fall back to `system`; invalid density falls back to
`compact`.

## Behavior

The provider reflects resolved theme and density to data attributes on its host. `system` follows
`prefers-color-scheme` without changing consumer attributes.

## Keyboard Interaction

None.

## Accessibility

The provider contributes no role and does not alter reading or focus order. Theme and density must
preserve contrast and target sizes.

## Responsive Behavior

None; descendants respond to their own containers.

## Content Guidance

None.

## API

### Attributes

- `theme`: `system | wayglass-dark | wayglass-light`; default `system`.
- `density`: `compact | comfortable`; default `compact`.

### Properties

- `theme: Phase1ThemeName | 'system'`
- `density: DensityName`
- `readonly resolvedTheme: Phase1ThemeName`

### Slots

- default: themed content.

### Events

- `wg-theme-change`: emitted only when `resolvedTheme` changes; detail is
  `{ theme, resolvedTheme, source: 'attribute' | 'system' }`.

### Methods

None.

### CSS Custom Properties

The provider assigns the documented semantic and component tokens. Consumers should override theme
inputs on the provider rather than private implementation values.

### CSS Parts

None.

## Examples

System theme, explicit dark, explicit light, nested preview, compact, and comfortable.

## Testing Requirements

Reflection, system preference changes, event detail, nesting, dark/light contrast, density target
sizes, and no flash caused by asynchronous resolution.

## Open Questions

High-contrast and dim themes remain compatible future additions but are not Phase 1 deliverables.
