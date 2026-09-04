# `@wayglass/react`

Typed React bindings for Wayglass Custom Elements. The wrappers preserve native Wayglass contracts
and expose typed properties and Custom Events without creating a separate component model.

```tsx
import { WgButton } from '@wayglass/react/button';

export function ContinueAction() {
  return <WgButton appearance="primary">Continue</WgButton>;
}
```

Wrappers register their corresponding element only when `customElements` is available and retain a
client-only fallback for server rendering. See the
[React contract](https://wayglass.hoagsoftworks.com/frameworks/react) for event, registration, and
rendering details.

Compatibility: React `>=19.0.0 <20`, `@wayglass/elements` `^0.1.0`, Node `>=22.13.0 <27`, and
TypeScript `>=5.9.0 <6.1.0`. Browser and assistive-technology support is release-specific.

Repository builds are private release candidates; only versions published through an approved
Wayglass release are public artifacts. Before using a released version, review its
[support](https://wayglass.hoagsoftworks.com/maintenance/support),
[security](https://wayglass.hoagsoftworks.com/maintenance/security), and
[migration](https://wayglass.hoagsoftworks.com/maintenance/migration) guidance.

Apache-2.0 © Wayglass contributors.
