# `@wayglass/icons`

Generated, direction-aware icons for Wayglass interfaces. The package provides reviewed icon data
and an explicitly registered `wg-icon` Custom Element.

```ts
import { defineWgIcon } from '@wayglass/icons/icon';

defineWgIcon();
```

```html
<wg-icon name="refresh" label="Refresh"></wg-icon>
```

Omit `label` only when adjacent content supplies the accessible meaning. Imports have no
registration or global side effects. The v1 catalog is intentionally small and is not a general
application icon library.

Compatibility: Node `>=22.13.0 <27` and TypeScript `>=5.9.0 <6.1.0`. Browser and
assistive-technology support is release-specific.

Repository builds are private release candidates; only versions published through an approved
Wayglass release are public artifacts. Before using a released version, review its
[support](https://wayglass.hoagsoftworks.com/maintenance/support),
[security](https://wayglass.hoagsoftworks.com/maintenance/security), and
[migration](https://wayglass.hoagsoftworks.com/maintenance/migration) guidance.

Apache-2.0 © Wayglass contributors.
