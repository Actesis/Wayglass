# Install Wayglass

Wayglass 0.1.0 is the first public feedback release. Pin exact versions for your first integration
so you can reproduce and report any issues.

## Web Components

In an application that can bundle JavaScript and CSS imports:

```sh
npm install --save-exact @wayglass/elements@0.1.0 @wayglass/tokens@0.1.0 @wayglass/themes@0.1.0
```

Load the shared styles and explicitly register the elements you use in your browser entry:

```ts
import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import { defineWgButton } from '@wayglass/elements/button';

defineWgButton();
```

```html
<wg-button>Refresh</wg-button>
```

## React

Use the [React bindings guide](/frameworks/react) for installation and wrapper behavior. Keep the
same stylesheet imports; the wrappers handle their own guarded client registration.

The released compatibility ranges are Node `>=22.13.0 <27`, TypeScript `>=5.9.0 <6.1.0`, and React
`>=19.0.0 <20` for the React binding. See the [support policy](/maintenance/support) for browser and
accessibility evidence.

Next: [build an application](/guides/application-authoring), explore
[Storybook](https://wayglass.hoagsoftworks.com/storybook/), or read the
[0.1.0 release notes](/maintenance/release-0.1.0).
