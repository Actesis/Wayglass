import { validateConsumerTemplate } from './consumer.ts';
import { fail } from './error.ts';
import type { ConsumerScenario, ConsumerTemplate } from './types.ts';

const html = `<!doctype html>
<html lang="en" data-wg-theme="wayglass-dark" data-wg-density="compact">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wayglass React release probe</title>
  </head>
  <body>
    <header role="banner"><h1>Wayglass React release probe</h1></header>
    <main id="root" aria-label="Wayglass React release probe"><p data-client-fallback>Loading</p></main>
    <aside id="direct" aria-label="Direct element parity"></aside>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const style = `@import '@wayglass/tokens/tokens.css';
@import '@wayglass/themes/themes.css';
@import '@wayglass/elements/foundations.css';

body {
  margin: 0;
  color: var(--wg-color-semantic-text-primary);
  background: var(--wg-color-semantic-surface-canvas);
  font-family: var(--wg-typography-family-body);
}
`;

const packageSurface = `import { conditions, type KnownState } from '@wayglass/core';
import { tokens, type TokenName } from '@wayglass/tokens';
import { themeNames, type ThemeName } from '@wayglass/themes';
import { WgToggle as WgToggleElement } from '@wayglass/elements';
import { WgBooleanValue as WgBooleanValueElement } from '@wayglass/elements/boolean-value';
import { WgToggle, type WgToggleProps } from '@wayglass/react';
import { WgToggle as WgToggleSubpath } from '@wayglass/react/toggle';

const known: KnownState = { condition: conditions[0], knowledge: 'confirmed', activity: 'idle' };
const token: TokenName = 'color.semantic.text.primary';
const tokenDefinition = tokens[token];
const theme: ThemeName = themeNames[0];
const props: WgToggleProps = { label: 'Declaration check' };
const declarations = [
  known,
  token,
  tokenDefinition,
  theme,
  props,
  WgToggleElement,
  WgBooleanValueElement,
  WgToggle,
  WgToggleSubpath,
];
void declarations;
`;

const main = `import './style.css';

import { defineWgBooleanValue, wgBooleanValueTagName } from '@wayglass/elements/boolean-value';
import { WgToggle as WgToggleElement, wgToggleTagName } from '@wayglass/elements/toggle';
import { WgToggle, type WgToggleRequestEvent } from '@wayglass/react/toggle';
import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

if (customElements.get(wgToggleTagName) === undefined) {
  throw new Error('WG_REACT_RETAINED_WRAPPER_NOT_REGISTERED');
}
if (customElements.get(wgBooleanValueTagName) !== undefined) {
  throw new Error('WG_REACT_UNUSED_ELEMENT_REGISTERED');
}
defineWgBooleanValue();

const directHost = document.querySelector<HTMLElement>('#direct');
if (directHost === null) throw new Error('WG_REACT_DIRECT_ROOT_MISSING');
const direct = document.createElement(wgToggleTagName) as WgToggleElement;
direct.label = 'Channel control';
direct.asserted = false;
direct.assertedLabel = 'Open';
direct.notAssertedLabel = 'Closed';
directHost.append(direct);

function Probe() {
  const reference = useRef<WgToggleElement>(null);
  useEffect(() => {
    const verify = async () => {
      const wrapper = reference.current;
      if (wrapper === null) throw new Error('WG_REACT_WRAPPER_REF_MISSING');
      await Promise.all([wrapper.updateComplete, direct.updateComplete]);
      if (
        wrapper.label !== direct.label ||
        wrapper.asserted !== direct.asserted ||
        wrapper.assertedLabel !== direct.assertedLabel ||
        wrapper.notAssertedLabel !== direct.notAssertedLabel
      ) {
        throw new Error('WG_REACT_DIRECT_PARITY_FAILED');
      }
      wrapper.click();
      const request = document.documentElement.dataset.wgReactRequest;
      if (request === undefined || !request.includes('"requestedAsserted":true')) {
        throw new Error('WG_REACT_EVENT_ADAPTATION_FAILED');
      }
      document.documentElement.dataset.wgReactProbe = 'WG_REACT_CLIENT_FALLBACK_READY';
    };
    void verify();
  }, []);
  const onRequest = (event: WgToggleRequestEvent) => {
    document.documentElement.dataset.wgReactRequest = JSON.stringify(event.detail);
  };
  return (
    <WgToggle
      ref={reference}
      label="Channel control"
      asserted={false}
      assertedLabel="Open"
      notAssertedLabel="Closed"
      onWgToggleRequest={onRequest}
    />
  );
}

const root = document.querySelector<HTMLElement>('#root');
if (root === null) throw new Error('WG_REACT_ROOT_MISSING');
root.replaceChildren();
createRoot(root).render(
  <StrictMode>
    <Probe />
  </StrictMode>,
);
`;

export const reactDirectMain = `import './style.css';

import {
  defineWgBooleanValue,
  wgBooleanValueTagName,
  type WgBooleanValue,
} from '@wayglass/elements/boolean-value';

if (customElements.get(wgBooleanValueTagName) !== undefined) {
  throw new Error('WG_REACT_REMOVAL_IMPORT_REGISTERED');
}
defineWgBooleanValue();
const root = document.querySelector<HTMLElement>('#root');
if (root === null) throw new Error('WG_REACT_REMOVAL_ROOT_MISSING');
root.replaceChildren();
const value = document.createElement(wgBooleanValueTagName) as WgBooleanValue;
value.label = 'Binding removed';
value.asserted = true;
value.assertedLabel = 'Direct element operational';
root.append(value);
await value.updateComplete;
document.documentElement.dataset.wgReactRemoval = 'WG_REACT_BINDING_REMOVED';
document.documentElement.dataset.wgBoolean = 'asserted';
`;

const tsconfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": false,
    "moduleResolution": "Bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
`;

export const reactPackageSurfacePath = 'src/package-surface.ts';
export const reactMainPath = 'src/main.tsx';
export const reactRemovalPackages = Object.freeze([
  '@wayglass/react',
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
] as const);

export function reactConsumerTemplate(scenario: ConsumerScenario): ConsumerTemplate {
  if (scenario.kind !== 'react' || scenario.react === undefined) {
    fail('WG_RC_REACT_SCENARIO', 'React template requires an accepted React scenario.');
  }
  const template = Object.freeze({
    scenario,
    files: Object.freeze([
      Object.freeze({ path: 'index.html', contents: html }),
      Object.freeze({ path: reactMainPath, contents: main }),
      Object.freeze({ path: reactPackageSurfacePath, contents: packageSurface }),
      Object.freeze({ path: 'src/style.css', contents: style }),
      Object.freeze({ path: 'tsconfig.json', contents: tsconfig }),
    ]),
  });
  validateConsumerTemplate(template);
  return template;
}
