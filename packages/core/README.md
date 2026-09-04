# `@wayglass/core`

Framework-neutral state models for operational interfaces. This package keeps condition, knowledge,
activity, section purpose, Boolean value, and controlled-request state explicit and independent.

```ts
import { defaultKnownState, isCondition } from '@wayglass/core';

const state = defaultKnownState;
if (isCondition(state.condition)) console.log(state.condition);
```

Imports have no registration or global side effects. See the
[state model](https://wayglass.hoagsoftworks.com/foundations/state-model) for semantics and scope.

Compatibility: Node `>=22.13.0 <27` and TypeScript `>=5.9.0 <6.1.0`. Browser and
assistive-technology support is release-specific.

Repository builds are private release candidates; only versions published through an approved
Wayglass release are public artifacts. Before using a released version, review its
[support](https://wayglass.hoagsoftworks.com/maintenance/support),
[security](https://wayglass.hoagsoftworks.com/maintenance/security), and
[migration](https://wayglass.hoagsoftworks.com/maintenance/migration) guidance.

Apache-2.0 © Wayglass contributors.
