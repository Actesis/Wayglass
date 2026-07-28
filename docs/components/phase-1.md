# Phase 1 component contracts

These contracts define the public surface required by the Operations Overview vertical slice.
Implementation may reveal a need to amend a contract, but changes require documentation, tests, and
review because public attributes, properties, events, slots, parts, and tokens are stability
commitments.

## Shared conventions

- Element imports are side-effect free. Each module exports its class and an explicit registration
  function.
- Public element names use the `wg-` prefix.
- Reflected enumerated attributes ignore invalid values and fall back to the documented default.
- Components use Shadow DOM unless the component contract explicitly requires light-DOM layout.
- Content slots accept text or safe consumer-provided markup; components never interpret arbitrary
  HTML strings.
- State-bearing components consume the shared `Condition`, `Knowledge`, and `Activity` types.
- Domain value remains independent from condition, knowledge, and activity.
- User-action events represent intent rather than confirmed domain-state changes. Change
  notifications are emitted only when their component contract requires them.
- Structural components do not create keyboard stops.
- Components use logical CSS properties and container-compatible responsive rules.
- All CSS custom properties listed by a component map to approved component tokens.

## Initial set

- [`wg-theme-provider`](./theme-provider.md)
- [`wg-canvas`](./canvas.md)
- [`wg-rail`](./rail.md)
- [`wg-elbow`](./elbow.md)
- [`wg-panel`](./panel.md)
- [`wg-button`](./button.md)
- [`wg-status-indicator`](./status-indicator.md)
- [`wg-boolean-value`](./boolean-value.md)
- [`wg-metric`](./metric.md)
- [`wg-value-tile`](./value-tile.md)

## Registration shape

Every element module follows this pattern:

```ts
export class WgExample extends WayglassElement {}

export function defineWgExample(registry?: CustomElementRegistry): void;
```

The optional registry supports scoped test registries and future platform usage. Repeated
registration of the same constructor is safe; a name collision with another constructor throws.
