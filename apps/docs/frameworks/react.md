# React bindings

`@wayglass/react` provides typed React components backed by the production Custom Elements. The
wrappers add React property, event, and ref integration without duplicating component behavior.

## Installation boundary

The package remains private during Phase 2. Applications in this workspace consume it as a workspace
dependency alongside `react` and `@wayglass/elements`.

Every wrapper module registers its element when `customElements` is available. Importing a wrapper
in a server environment is safe: registration is skipped, markup can render, and the element
upgrades when the client module loads. Full server-side rendering and hydration remain later
compatible work.

## Imports

Import from the root:

```tsx
import { WgBooleanValue, WgMetric, WgThemeProvider, WgValueTile } from '@wayglass/react';
```

Or use a side-effect-minimal component entry point:

```tsx
import { WgMetric } from '@wayglass/react/metric';
```

Wrappers are available for all Phase 1 elements and the Phase 2A tabs compound elements:

- `WgThemeProvider`
- `WgCanvas`
- `WgRail`
- `WgElbow`
- `WgPanel`
- `WgButton`
- `WgStatusIndicator`
- `WgBooleanValue`
- `WgMetric`
- `WgValueTile`
- `WgTabs`
- `WgTabList`
- `WgTab`
- `WgTabPanel`

Each module also exports its corresponding `Props` type.

## Properties and composition

Element properties become typed React props. Boolean properties use real Booleans, and semantic
vocabularies remain closed unions.

```tsx
<WgValueTile label="Communications primary link">
  <h2 slot="heading">Communications primary link</h2>
  <WgMetric
    slot="value"
    label="Latency"
    value="184"
    unit="ms"
    condition="caution"
    knowledge="stale"
  />
  <WgBooleanValue
    label="Primary link"
    asserted
    assertedLabel="Connected"
    notAssertedLabel="Disconnected"
  />
</WgValueTile>
```

Named Web Component slots use the standard `slot` prop. The wrapper does not reinterpret children or
create a second composition model.

Compound components preserve the production light-DOM structure:

```tsx
<WgTabs value="overview" activation="automatic" onWgTabChange={handleTabChange}>
  <WgTabList aria-label="Account views">
    <WgTab value="overview">Overview</WgTab>
    <WgTab value="security">Security</WgTab>
  </WgTabList>
  <WgTabPanel value="overview">Overview content</WgTabPanel>
  <WgTabPanel value="security">Security content</WgTabPanel>
</WgTabs>
```

## Events

Custom Events become camel-cased callback props. `WgThemeProvider` exposes `onWgThemeChange`, and
`WgTabs` exposes `onWgTabChange`. Both preserve the production detail and current-target types.

```tsx
<WgThemeProvider
  theme="system"
  onWgThemeChange={(event) => {
    console.log(event.detail.resolvedTheme);
  }}
/>
```

`WgTabChangeEvent` exposes the selected `value`, `previousValue`, and the keyboard or pointer
`trigger`. React bindings do not emit a second event or reproduce selection behavior.

Native events such as button clicks continue to use React's native callback props.

## Refs

Forwarded refs resolve to the production element instance rather than an intermediate React
component.

```tsx
import type { WgButton as WgButtonElement } from '@wayglass/elements/button';
import { useRef } from 'react';
import { WgButton } from '@wayglass/react/button';

const retryButton = useRef<WgButtonElement>(null);

<WgButton ref={retryButton}>Retry Communications primary link</WgButton>;
```

Use the element ref only for platform behavior such as focus. Domain state remains
application-owned.
