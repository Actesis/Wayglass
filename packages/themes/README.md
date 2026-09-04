# `@wayglass/themes`

Wayglass dark and light themes plus compact and comfortable density modes. Theme and density
overrides preserve the semantic meaning of the underlying tokens.

```css
@import '@wayglass/tokens/tokens.css';
@import '@wayglass/themes/themes.css';
```

```ts
import { createThemeCss, themeNames } from '@wayglass/themes';
```

See the [token and theme contract](https://wayglass.hoagsoftworks.com/foundations/tokens) for mode
selection and brand-adaptation boundaries. The JavaScript import has no global side effects; the
explicit CSS import intentionally applies styles.

Compatibility: `@wayglass/tokens` `^0.1.0`, Node `>=22.13.0 <27`, and TypeScript `>=5.9.0 <6.1.0`.
Browser and assistive-technology support is release-specific.

Repository builds are private release candidates; only versions published through an approved
Wayglass release are public artifacts. Before using a released version, review its
[support](https://wayglass.hoagsoftworks.com/maintenance/support),
[security](https://wayglass.hoagsoftworks.com/maintenance/security), and
[migration](https://wayglass.hoagsoftworks.com/maintenance/migration) guidance.

Apache-2.0 © Wayglass contributors.
