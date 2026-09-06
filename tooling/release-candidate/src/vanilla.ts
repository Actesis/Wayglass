import { fail } from './error.ts';
import { validateConsumerTemplate } from './consumer.ts';
import type { ConsumerScenario, ConsumerTemplate } from './types.ts';

const html = `<!doctype html>
<html lang="en" data-wg-theme="wayglass-dark" data-wg-density="compact">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wayglass Vanilla release probe</title>
  </head>
  <body>
    <main id="app" aria-label="Wayglass Vanilla release probe"></main>
    <script type="module" src="/src/main.ts"></script>
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
import { WgToggle } from '@wayglass/elements';
import { WgBooleanValue } from '@wayglass/elements/boolean-value';
import { WgIcon } from '@wayglass/icons';
import { WgIcon as WgIconSubpath } from '@wayglass/icons/icon';

const known: KnownState = { condition: conditions[0], knowledge: 'confirmed', activity: 'idle' };
const token: TokenName = tokens[0]!.name;
const theme: ThemeName = themeNames[0];
const declarations = [known, token, theme, WgToggle, WgBooleanValue, WgIcon, WgIconSubpath];
void declarations;
`;

const main = `import './style.css';

import { isKnownState, toBooleanValueState, type KnownState } from '@wayglass/core';
import {
  defineWgBooleanValue,
  wgBooleanValueTagName,
  type WgBooleanValue,
} from '@wayglass/elements/boolean-value';
import {
  defineWgToggle,
  wgToggleTagName,
  type WgToggle,
  type WgToggleRequestDetail,
} from '@wayglass/elements/toggle';

const tags = [wgBooleanValueTagName, wgToggleTagName] as const;
if (tags.some((tag) => customElements.get(tag) !== undefined)) {
  throw new Error('WG_VANILLA_IMPORT_REGISTERED');
}

defineWgBooleanValue();
defineWgToggle();
if (tags.some((tag) => customElements.get(tag) === undefined)) {
  throw new Error('WG_VANILLA_EXPLICIT_REGISTRATION_FAILED');
}

const state: KnownState = { condition: 'critical', knowledge: 'stale', activity: 'pending' };
const booleanState = toBooleanValueState(true);
if (!isKnownState(state) || booleanState !== 'asserted' || String(state.condition) === booleanState) {
  throw new Error('WG_VANILLA_STATE_AXES_FAILED');
}

const app = document.querySelector<HTMLElement>('#app');
if (app === null) throw new Error('WG_VANILLA_ROOT_MISSING');

const value = document.createElement(wgBooleanValueTagName) as WgBooleanValue;
value.label = 'Channel open';
value.asserted = true;
value.assertedLabel = 'Open';
value.notAssertedLabel = 'Closed';
value.knowledge = state.knowledge;

const toggle = document.createElement(wgToggleTagName) as WgToggle;
toggle.label = 'Channel control';
toggle.asserted = false;
toggle.assertedLabel = 'Open';
toggle.notAssertedLabel = 'Closed';

let request: WgToggleRequestDetail | undefined;
toggle.addEventListener('wg-toggle-request', (event) => {
  request = (event as CustomEvent<WgToggleRequestDetail>).detail;
  document.documentElement.dataset.wgVanillaRequest = JSON.stringify(request);
});
app.append(value, toggle);

await Promise.all([value.updateComplete, toggle.updateComplete]);
toggle.click();
if (
  request?.requestedAsserted !== true ||
  request.confirmedAsserted !== false ||
  request.trigger !== 'keyboard' ||
  toggle.shadowRoot?.querySelector('[role="switch"]')?.getAttribute('aria-checked') !== 'false'
) {
  throw new Error('WG_VANILLA_INTERACTION_FAILED');
}

document.documentElement.dataset.wgVanillaProbe = 'WG_VANILLA_PROBE_READY';
document.documentElement.dataset.wgCondition = state.condition;
document.documentElement.dataset.wgKnowledge = state.knowledge;
document.documentElement.dataset.wgActivity = state.activity;
document.documentElement.dataset.wgBoolean = booleanState;
`;

const tsconfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": false,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "verbatimModuleSyntax": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["src"]
}
`;

export const vanillaCompileOnlyPackage = '@wayglass/icons';
export const vanillaPackageSurfacePath = 'src/package-surface.ts';

export function vanillaConsumerTemplate(scenario: ConsumerScenario): ConsumerTemplate {
  if (scenario.kind !== 'vanilla' || scenario.react !== undefined) {
    fail('WG_RC_VANILLA_SCENARIO', 'Vanilla template requires an accepted Vanilla scenario.');
  }
  const template = Object.freeze({
    scenario,
    files: Object.freeze([
      Object.freeze({ path: 'index.html', contents: html }),
      Object.freeze({ path: 'src/main.ts', contents: main }),
      Object.freeze({ path: 'src/package-surface.ts', contents: packageSurface }),
      Object.freeze({ path: 'src/style.css', contents: style }),
      Object.freeze({ path: 'tsconfig.json', contents: tsconfig }),
    ]),
  });
  validateConsumerTemplate(template);
  return template;
}
