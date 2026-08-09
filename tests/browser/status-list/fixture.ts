import { defineWgBooleanValue } from '/packages/elements/dist/boolean-value.js';
import { defineWgKeyValue } from '/packages/elements/dist/key-value.js';
import { defineWgStatusEntry } from '/packages/elements/dist/status-entry.js';
import { defineWgStatusList } from '/packages/elements/dist/status-list.js';

type Activity = 'idle' | 'pending';
type Condition = 'neutral' | 'informational' | 'positive' | 'caution' | 'critical';
type Knowledge = 'confirmed' | 'inferred' | 'stale' | 'unknown' | 'conflicting' | 'unavailable';

declare global {
  interface Window {
    statusListConstructionDuration?: number;
  }
}

const parameters = new URLSearchParams(window.location.search);
document.body.dataset.wgTheme = parameters.get('theme') ?? 'wayglass-dark';
document.body.dataset.wgDensity = parameters.get('density') ?? 'compact';
document.documentElement.dir = parameters.get('dir') ?? 'ltr';

const conditions: readonly Condition[] = [
  'neutral',
  'informational',
  'positive',
  'caution',
  'critical',
];
const knowledgeStates: readonly Knowledge[] = [
  'confirmed',
  'inferred',
  'stale',
  'unknown',
  'conflicting',
  'unavailable',
];

function renderEnvelope(): void {
  const fixture = document.querySelector<HTMLElement>('#fixture');
  if (!fixture) return;
  fixture.replaceChildren();

  const list = document.createElement('wg-status-list');
  list.id = 'status-envelope';
  list.setAttribute('label', 'Delivery source envelope');

  const heading = document.createElement('h1');
  heading.slot = 'heading';
  heading.textContent = 'Delivery source envelope';
  list.append(heading);

  const description = document.createElement('p');
  description.slot = 'description';
  description.textContent = 'One hundred stable entries in authored priority order.';
  list.append(description);

  for (let index = 1; index <= 100; index += 1) {
    const suffix = String(index).padStart(3, '0');
    const entry = document.createElement('wg-status-entry');
    entry.id = `status-entry-${suffix}`;
    entry.setAttribute('label', `Source ${suffix}`);
    entry.setAttribute('condition', conditions[(index - 1) % conditions.length]!);
    entry.setAttribute('knowledge', knowledgeStates[(index - 1) % knowledgeStates.length]!);
    const activity: Activity = index % 7 === 0 ? 'pending' : 'idle';
    entry.setAttribute('activity', activity);

    const summary = document.createElement('span');
    summary.slot = 'description';
    summary.textContent =
      index === 37
        ? 'Regional coordination — western interval with a deliberately long current summary.'
        : `Current authored summary ${suffix}.`;
    entry.append(summary);

    if (index % 4 === 0) {
      const value = document.createElement('span');
      value.slot = 'value';
      value.textContent = index === 40 ? '١٬٢٨٤ records' : `${index * 3} records`;
      entry.append(value);
    }

    if (index % 5 === 0) {
      const time = document.createElement('time');
      time.slot = 'time';
      time.dateTime = `2026-08-09T${String(12 + (index % 8)).padStart(2, '0')}:00:00-07:00`;
      time.textContent = `Observed at ${12 + (index % 8)}:00`;
      entry.append(time);
    }

    if (index % 6 === 0) {
      const metadata = document.createElement('span');
      metadata.slot = 'metadata';
      metadata.textContent = `Reference WG-STATUS-${suffix}`;
      entry.append(metadata);
    }

    if (index % 10 === 0) {
      const action = document.createElement('button');
      action.slot = 'actions';
      action.id = `status-action-${suffix}`;
      action.type = 'button';
      action.textContent = `Inspect Source ${suffix}`;
      entry.append(action);
    }

    list.append(entry);
  }

  fixture.append(list);
}

const started = performance.now();
if (parameters.get('fixture') === 'envelope') renderEnvelope();

if (parameters.get('upgrade') !== 'false') {
  defineWgKeyValue();
  defineWgBooleanValue();
  defineWgStatusEntry();
  defineWgStatusList();
}
window.statusListConstructionDuration = performance.now() - started;
