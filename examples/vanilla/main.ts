import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';

import {
  mountOperationalActivity,
  type OperationalActivityComposition,
  type OperationalActivityDensity,
  type OperationalActivityTheme,
  type OperationalActivityWidth,
} from './operational-activity.js';
import {
  operationalActivityFunctions,
  operationalActivityScenarios,
  type OperationalFunction,
  type OperationalScenario,
} from '../shared/operational-activity-model.js';

function acceptedValue<T extends string>(
  value: string | null,
  accepted: readonly T[],
  fallback: T,
): T {
  return value !== null && accepted.includes(value as T) ? (value as T) : fallback;
}

const parameters = new URLSearchParams(window.location.search);
const composition = acceptedValue<OperationalActivityComposition>(
  parameters.get('composition'),
  ['overview', 'focused'],
  'overview',
);
const scenario = acceptedValue<OperationalScenario>(
  parameters.get('scenario'),
  operationalActivityScenarios,
  'steady',
);
const selectedFunction = acceptedValue<OperationalFunction>(
  parameters.get('selected'),
  operationalActivityFunctions.map(({ value }) => value),
  'intake',
);
const width = acceptedValue<OperationalActivityWidth>(
  parameters.get('width'),
  ['phone', 'desktop', 'wall'],
  'desktop',
);
const theme = acceptedValue<OperationalActivityTheme>(
  parameters.get('theme'),
  ['wayglass-dark', 'wayglass-light'],
  'wayglass-dark',
);
const density = acceptedValue<OperationalActivityDensity>(
  parameters.get('density'),
  ['compact', 'comfortable'],
  'compact',
);

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Vanilla example root was not found.');
}

const fixture = mountOperationalActivity({
  composition,
  scenario,
  selectedFunction,
  width,
  theme,
  density,
  implementationLabel: 'Vanilla Custom Elements · Phase 3 integration',
});
fixture.dataset.example = 'vanilla';
app.append(fixture);
