import { defineWgTimeline } from '/packages/elements/dist/timeline.js';
import { defineWgTimelineItem } from '/packages/elements/dist/timeline-item.js';

type Activity = 'idle' | 'pending';
type Condition = 'neutral' | 'informational' | 'positive' | 'caution' | 'critical';
type Knowledge = 'confirmed' | 'inferred' | 'stale' | 'unknown' | 'conflicting' | 'unavailable';

declare global {
  interface Window {
    timelineConstructionDuration?: number;
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

  const timeline = document.createElement('wg-timeline');
  timeline.id = 'timeline-envelope';
  timeline.setAttribute('label', 'Processing timeline envelope');
  timeline.setAttribute('chronology', 'ascending');
  timeline.setAttribute('chronology-label', 'Oldest to newest');

  const heading = document.createElement('h1');
  heading.slot = 'heading';
  heading.textContent = 'Processing timeline envelope';
  timeline.append(heading);

  for (let index = 1; index <= 100; index += 1) {
    const suffix = String(index).padStart(3, '0');
    const item = document.createElement('wg-timeline-item');
    item.id = `timeline-item-${suffix}`;
    item.setAttribute('label', `Milestone ${suffix}`);
    item.setAttribute('kind', index % 8 === 0 ? 'interval' : 'milestone');
    item.setAttribute('condition', conditions[(index - 1) % conditions.length]!);
    item.setAttribute('knowledge', knowledgeStates[(index - 1) % knowledgeStates.length]!);
    const activity: Activity = index % 9 === 0 ? 'pending' : 'idle';
    item.setAttribute('activity', activity);

    const time = document.createElement('time');
    time.slot = 'time';
    time.dateTime = `2026-08-09T${String(8 + Math.floor(index / 60)).padStart(2, '0')}:${String(
      index % 60,
    ).padStart(2, '0')}:00-07:00`;
    time.textContent = `Occurred at ${8 + Math.floor(index / 60)}:${String(index % 60).padStart(
      2,
      '0',
    )}`;
    item.append(time);

    const description = document.createElement('p');
    description.textContent =
      index === 37
        ? 'Localized-looking milestone — معالجة إقليمية with deliberately long authored context.'
        : `Authored milestone context ${suffix}.`;
    item.append(description);

    if (index % 8 === 0) {
      const endTime = document.createElement('time');
      endTime.slot = 'end-time';
      endTime.dateTime = time.dateTime;
      endTime.textContent = index % 16 === 0 ? 'Ongoing' : 'Ended after authored review';
      item.append(endTime);
    }

    if (index % 10 === 0) {
      const action = document.createElement('button');
      action.slot = 'actions';
      action.id = `timeline-action-${suffix}`;
      action.type = 'button';
      action.textContent = `Inspect Milestone ${suffix}`;
      item.append(action);
    }

    timeline.append(item);
  }

  fixture.append(timeline);
}

const started = performance.now();
if (parameters.get('fixture') === 'envelope') renderEnvelope();

if (parameters.get('upgrade') !== 'false') {
  defineWgTimelineItem();
  defineWgTimeline();
}
window.timelineConstructionDuration = performance.now() - started;
