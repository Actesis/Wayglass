# `@wayglass/tokens`

Semantic design tokens for Wayglass. TypeScript definitions are the authoring source; the package
also provides generated CSS custom properties and flat JSON.

```ts
import { tokenNameToCssCustomProperty, tokens } from '@wayglass/tokens';

const property = tokenNameToCssCustomProperty('color.semantic.text.primary');
const value = tokens['color.semantic.text.primary'].value;
```

```css
@import '@wayglass/tokens/tokens.css';
```

See the [token contract](https://wayglass.hoagsoftworks.com/foundations/tokens) for authority,
semantics, and customization boundaries. Imports do not register Custom Elements.

Compatibility: Node `>=22.13.0 <27` and TypeScript `>=5.9.0 <6.1.0`. Browser and
assistive-technology support is release-specific.

Repository builds are private release candidates; only versions published through an approved
Wayglass release are public artifacts. Before using a released version, review its
[support](https://wayglass.hoagsoftworks.com/maintenance/support),
[security](https://wayglass.hoagsoftworks.com/maintenance/security), and
[migration](https://wayglass.hoagsoftworks.com/maintenance/migration) guidance.

Apache-2.0 © Wayglass contributors.
