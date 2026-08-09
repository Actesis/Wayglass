import { defineWgEventLog } from '/packages/elements/dist/event-log.js';
import { defineWgEventRecord } from '/packages/elements/dist/event-record.js';

type Activity = 'idle' | 'pending';
type Condition = 'neutral' | 'informational' | 'positive' | 'caution' | 'critical';
type Knowledge = 'confirmed' | 'inferred' | 'stale' | 'unknown' | 'conflicting' | 'unavailable';

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

function appendTextSlot(record: HTMLElement, slot: string, text: string): void {
  const element = document.createElement('span');
  element.slot = slot;
  element.textContent = text;
  record.append(element);
}

function renderEnvelope(): void {
  const fixture = document.querySelector<HTMLElement>('#fixture');
  if (!fixture) return;
  fixture.replaceChildren();

  const log = document.createElement('wg-event-log');
  log.id = 'event-envelope';
  log.setAttribute('label', 'Intake event envelope');
  log.setAttribute('chronology', 'descending');
  log.setAttribute('chronology-label', 'Newest to oldest by receipt time');

  const heading = document.createElement('h1');
  heading.slot = 'heading';
  heading.textContent = 'Intake event envelope';
  log.append(heading);

  for (let index = 1; index <= 500; index += 1) {
    const suffix = String(index).padStart(3, '0');
    const record = document.createElement('wg-event-record');
    record.id = `event-record-${suffix}`;
    record.setAttribute('label', index % 17 === 0 ? 'Repeated visible event' : `Event ${suffix}`);
    record.setAttribute('condition', conditions[(index - 1) % conditions.length]!);
    record.setAttribute('knowledge', knowledgeStates[(index - 1) % knowledgeStates.length]!);
    const activity: Activity = index % 19 === 0 ? 'pending' : 'idle';
    record.setAttribute('activity', activity);

    const time = document.createElement('time');
    time.slot = 'time';
    time.dateTime = `2026-08-09T${String(18 - Math.floor(index / 60)).padStart(2, '0')}:${String(
      59 - (index % 60),
    ).padStart(2, '0')}:00-07:00`;
    time.textContent = `Occurred ${suffix}`;
    record.append(time);

    if (index % 5 === 0) appendTextSlot(record, 'source', `Source: Channel ${index % 12}`);
    if (index % 7 === 0) appendTextSlot(record, 'category', `Category: Class ${index % 8}`);
    if (index % 9 === 0) appendTextSlot(record, 'reference', `Reference: EVT-${suffix}`);
    if (index % 11 === 0)
      appendTextSlot(record, 'received-time', `Received after ${index % 6} min`);
    if (index % 13 === 0) {
      appendTextSlot(
        record,
        'metadata',
        index === 195
          ? 'Localized metadata — معالجة إقليمية with a deliberately long authored reference.'
          : `Authored metadata ${suffix}.`,
      );
    }

    if (index % 50 === 0) {
      const action = document.createElement('button');
      action.slot = 'actions';
      action.id = `event-action-${suffix}`;
      action.type = 'button';
      action.textContent = `Inspect Event ${suffix}`;
      record.append(action);
    }

    log.append(record);
  }

  fixture.append(log);
}

if (parameters.get('fixture') === 'envelope') renderEnvelope();

if (parameters.get('upgrade') !== 'false') {
  defineWgEventRecord();
  defineWgEventLog();
}
