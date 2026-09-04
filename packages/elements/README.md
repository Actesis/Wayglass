# `@wayglass/elements`

Domain-neutral Wayglass Custom Elements for operational interfaces. Components preserve native
semantics, explicit state axes, application-owned effects, and deliberate registration.

```ts
import { defineWgButton } from '@wayglass/elements/button';

defineWgButton();
```

```html
<wg-button appearance="primary">Continue</wg-button>
```

Importing a module never registers an element. Call the exported `defineWg*` function for every
element the application uses, and import the documented CSS artifacts explicitly. Start with the
[component contracts](https://wayglass.hoagsoftworks.com/components/).

Compatibility: `@wayglass/core` and `@wayglass/themes` `^0.1.0`, Node `>=22.13.0 <27`, and
TypeScript `>=5.9.0 <6.1.0`. Browser and assistive-technology support is release-specific.

Repository builds are private release candidates; only versions published through an approved
Wayglass release are public artifacts. Before using a released version, review its
[support](https://wayglass.hoagsoftworks.com/maintenance/support),
[security](https://wayglass.hoagsoftworks.com/maintenance/security), and
[migration](https://wayglass.hoagsoftworks.com/maintenance/migration) guidance.

Apache-2.0 © Wayglass contributors.
