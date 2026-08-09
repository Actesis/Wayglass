import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { defineWgBadge } from '@wayglass/elements/badge';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgEmptyState } from '@wayglass/elements/empty-state';
import { defineWgEventLog } from '@wayglass/elements/event-log';
import { defineWgEventRecord } from '@wayglass/elements/event-record';
import { defineWgMedia } from '@wayglass/elements/media';
import { defineWgOfflineState } from '@wayglass/elements/offline-state';
import { defineWgProgress } from '@wayglass/elements/progress';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { defineWgTimeline } from '@wayglass/elements/timeline';
import { defineWgTimelineItem } from '@wayglass/elements/timeline-item';
import { html, nothing } from 'lit';

import ambientBandsUrl from './assets/ambient-bands.svg?url';
import './temporal-data.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgBadge();
defineWgButton();
defineWgEmptyState();
defineWgOfflineState();
defineWgProgress();
defineWgMedia();
defineWgTimeline();
defineWgTimelineItem();
defineWgEventLog();
defineWgEventRecord();

export type TemporalDataWidth = 'phone' | 'desktop' | 'wall';
export type TemporalDataTheme = 'wayglass-dark' | 'wayglass-light';
export type TemporalDataDensity = 'compact' | 'comfortable';

export interface TemporalDataOptions {
  readonly width: TemporalDataWidth;
  readonly theme: TemporalDataTheme;
  readonly density: TemporalDataDensity;
}

interface TimelineFixture {
  readonly id: string;
  readonly label: string;
  readonly time: string;
  readonly dateTime: string;
  readonly description: string;
  readonly kind?: 'milestone' | 'interval';
  readonly endTime?: string;
  readonly condition?: Condition;
  readonly knowledge?: Knowledge;
  readonly activity?: Activity;
  readonly metadata?: string;
  readonly action?: string;
  readonly media?: boolean;
}

interface EventFixture {
  readonly id: string;
  readonly label: string;
  readonly time: string;
  readonly dateTime: string;
  readonly condition?: Condition;
  readonly knowledge?: Knowledge;
  readonly activity?: Activity;
  readonly receivedTime?: string;
  readonly receivedDateTime?: string;
  readonly source?: string;
  readonly category?: string;
  readonly reference?: string;
  readonly metadata?: string;
  readonly detail?: string;
  readonly action?: string;
}

const timelineFixtures: readonly TimelineFixture[] = [
  {
    id: 'timeline-request',
    label: 'Review request accepted',
    time: '8:40 AM',
    dateTime: '2026-08-09T08:40:00-07:00',
    description: 'The submitted change entered the standard operational review path.',
    condition: 'positive',
    metadata: 'Requested by Coordination · Reference WG-1842',
  },
  {
    id: 'timeline-analysis',
    label: 'Evidence analysis in progress',
    time: '8:44 AM',
    dateTime: '2026-08-09T08:44:00-07:00',
    endTime: 'Ongoing',
    kind: 'interval',
    description:
      'Two confirmed sources and one inferred source are being reconciled before a recommendation is issued.',
    condition: 'informational',
    knowledge: 'inferred',
    activity: 'pending',
    metadata: 'Policy: Standard operational review',
    action: 'Inspect Evidence analysis',
  },
  {
    id: 'timeline-conflict',
    label: 'Conflicting evidence identified',
    time: '9:05 AM',
    dateTime: '2026-08-09T09:05:00-07:00',
    description:
      'The regional response disagrees with the retained baseline. The prior confirmed configuration remains in effect.',
    condition: 'caution',
    knowledge: 'conflicting',
    metadata: 'Difference isolated to the western interval',
    media: true,
  },
  {
    id: 'timeline-resolution',
    label: 'Review completed',
    time: '9:18 AM',
    dateTime: '2026-08-09T09:18:00-07:00',
    description:
      'The reconciled recommendation was recorded and is ready for an authorized decision.',
    condition: 'positive',
    metadata: 'Completed by Operations review',
    action: 'Open Review completed record',
  },
] as const;

const eventFixtures: readonly EventFixture[] = [
  {
    id: 'event-decision',
    label: 'Reconciled recommendation recorded',
    time: '9:18:42 AM',
    dateTime: '2026-08-09T09:18:42-07:00',
    condition: 'positive',
    source: 'Review service',
    category: 'Decision support',
    reference: 'WG-1842-R4',
  },
  {
    id: 'event-delay',
    label: 'Regional evidence response received after the expected window',
    time: '9:14:50 AM',
    dateTime: '2026-08-09T09:14:50-07:00',
    receivedTime: 'Received at 9:16:28 AM',
    receivedDateTime: '2026-08-09T09:16:28-07:00',
    condition: 'caution',
    knowledge: 'stale',
    source: 'Regional coordination',
    category: 'Delivery timing',
    reference: 'WG-1842-E17',
    metadata: 'Expected receipt window: 90 seconds',
    detail:
      'The event occurrence time remains primary. Receipt time is shown because the delay changes how the sequence should be interpreted.',
    action: 'Inspect Delayed regional evidence response',
  },
  {
    id: 'event-rule-confirmed',
    label: 'Policy evaluation completed',
    time: '9:14:11 AM',
    dateTime: '2026-08-09T09:14:11-07:00',
    source: 'Policy evaluator A',
    category: 'Rule evaluation',
    reference: 'WG-1842-E18',
  },
  {
    id: 'event-rule-inferred',
    label: 'Policy evaluation completed',
    time: '9:14:09 AM',
    dateTime: '2026-08-09T09:14:09-07:00',
    condition: 'informational',
    knowledge: 'inferred',
    source: 'Policy evaluator B',
    category: 'Rule evaluation',
    reference: 'WG-1842-E16',
    metadata: 'Duplicate summary; distinct occurrence and source',
  },
  {
    id: 'event-unavailable',
    label: 'External capacity observation unavailable',
    time: '9:12:01 AM',
    dateTime: '2026-08-09T09:12:01-07:00',
    condition: 'critical',
    knowledge: 'unavailable',
    source: 'External capacity service',
    category: 'Observation',
    reference: 'WG-1842-E15',
    detail:
      'No current capacity observation was available. The application retained the last confirmed recommendation and exposed an explicit recovery action.',
    action: 'Retry External capacity observation',
  },
] as const;

function markActionPending(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const temporalRecord = button.closest<HTMLElement>('wg-timeline-item, wg-event-record');
  temporalRecord?.setAttribute('activity', 'pending');
  button.setAttribute('pending', '');
}

function jumpToNewest(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const eventLog = button.closest('wg-event-log');
  eventLog?.querySelector('wg-event-record')?.scrollIntoView({ block: 'nearest' });
  const summary = eventLog?.querySelector<HTMLElement>('[data-unseen-summary]');
  if (summary) summary.textContent = 'Newest records are now in view.';
}

function renderTimelineItem(item: TimelineFixture) {
  return html`
    <wg-timeline-item
      id=${item.id}
      label=${item.label}
      kind=${item.kind ?? 'milestone'}
      condition=${item.condition ?? 'neutral'}
      knowledge=${item.knowledge ?? 'confirmed'}
      activity=${item.activity ?? 'idle'}
    >
      <time slot="time" datetime=${item.dateTime}>${item.time}</time>
      ${item.endTime ? html`<span slot="end-time">${item.endTime}</span>` : nothing}
      <h3 slot="heading">${item.label}</h3>
      <p>${item.description}</p>
      ${item.metadata ? html`<span slot="metadata">${item.metadata}</span>` : nothing}
      ${
        item.media
          ? html`
              <details slot="details">
                <summary>Inspect evidence relationship</summary>
                <figure class="wg-temporal-media">
                  <wg-media aspect="wide" fit="contain" state="ready" boundary="strong">
                    <img
                      src=${ambientBandsUrl}
                      width="1200"
                      height="900"
                      alt="Two evidence paths converging at the reviewed interval"
                    />
                  </wg-media>
                  <figcaption>
                    Authored reference media remains supporting detail, not a replacement for the
                    written finding.
                  </figcaption>
                </figure>
              </details>
            `
          : nothing
      }
      ${
        item.action
          ? html`<wg-button slot="actions" appearance="secondary" @click=${markActionPending}
              >${item.action}</wg-button
            >`
          : nothing
      }
    </wg-timeline-item>
  `;
}

function renderEventRecord(event: EventFixture) {
  return html`
    <wg-event-record
      id=${event.id}
      label=${event.label}
      condition=${event.condition ?? 'neutral'}
      knowledge=${event.knowledge ?? 'confirmed'}
      activity=${event.activity ?? 'idle'}
    >
      <time slot="time" datetime=${event.dateTime}>${event.time}</time>
      <span slot="summary">${event.label}</span>
      ${
        event.receivedTime
          ? html`<span slot="received-time"
              >Received:
              <time datetime=${event.receivedDateTime ?? event.dateTime}
                >${event.receivedTime.replace('Received at ', '')}</time
              ></span
            >`
          : nothing
      }
      ${event.source ? html`<span slot="source">Source: ${event.source}</span>` : nothing}
      ${event.category ? html`<span slot="category">Category: ${event.category}</span>` : nothing}
      ${
        event.reference
          ? html`<span slot="reference">Reference: ${event.reference}</span>`
          : nothing
      }
      ${
        event.metadata
          ? html`<span slot="metadata"><wg-badge>${event.metadata}</wg-badge></span>`
          : nothing
      }
      ${
        event.detail
          ? html`<details slot="details">
              <summary>Inspect ${event.label}</summary>
              <p>${event.detail}</p>
            </details>`
          : nothing
      }
      ${
        event.action
          ? html`<wg-button slot="actions" appearance="secondary" @click=${markActionPending}
              >${event.action}</wg-button
            >`
          : nothing
      }
    </wg-event-record>
  `;
}

function renderTimeline(items: readonly TimelineFixture[] = timelineFixtures) {
  return html`
    <wg-timeline
      label="Operational review history"
      chronology="ascending"
      chronology-label="Oldest to newest"
    >
      <h2 slot="heading">Operational review history</h2>
      <p slot="description">
        Selected milestones explain how the current recommendation developed; omission is
        intentional.
      </p>
      <wg-button slot="actions" appearance="secondary">Open complete review</wg-button>
      ${items.map(renderTimelineItem)}
    </wg-timeline>
  `;
}

function renderEventLog(events: readonly EventFixture[] = eventFixtures) {
  return html`
    <wg-event-log
      label="Review event stream"
      chronology="descending"
      chronology-label="Newest occurrence to oldest"
    >
      <h2 slot="heading">Review event stream</h2>
      <p slot="description">
        Dense application-authored records are ordered by occurrence time, not receipt time.
      </p>
      <div slot="status" class="wg-temporal-status">
        <span data-unseen-summary>3 newer records retained above this reading position.</span>
        <wg-button appearance="secondary" @click=${jumpToNewest}>Jump to newest record</wg-button>
      </div>
      ${events.map(renderEventRecord)}
    </wg-event-log>
  `;
}

function renderPage(
  options: TemporalDataOptions,
  title: string,
  description: string,
  content: unknown,
) {
  return html`
    <div
      class="wg-temporal-viewport wg-temporal-viewport--${options.width}"
      data-temporal-width=${options.width}
    >
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-temporal-header">
            <p>Operational Activity · Authored temporal context</p>
            <h1>${title}</h1>
            <p>${description}</p>
          </header>
          ${content}
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export function renderTemporalWorkspace(options: TemporalDataOptions) {
  return renderPage(
    options,
    'Review progression and event detail',
    'A curated narrative and dense inspection stream remain visibly distinct while describing the same operational work.',
    html`<main class="wg-temporal-workspace">
      <section aria-label="Curated review progression">${renderTimeline()}</section>
      <section aria-label="Dense review event stream">${renderEventLog()}</section>
    </main>`,
  );
}

export function renderTemporalFeedback(options: TemporalDataOptions) {
  return renderPage(
    options,
    'Temporal collection feedback states',
    'Initial loading, empty results, and offline retention are authored outside record semantics.',
    html`
      <main class="wg-temporal-feedback">
        <wg-timeline
          label="Loading review history"
          chronology="ascending"
          chronology-label="Oldest to newest"
          busy
        >
          <h2 slot="heading">Loading review history</h2>
          <wg-progress slot="status">
            <label for="temporal-loading-progress">Loading review milestones</label>
            <progress
              id="temporal-loading-progress"
              aria-label="Loading review milestones"
            ></progress>
            <output>Waiting for the first confirmed history response.</output>
          </wg-progress>
        </wg-timeline>

        <wg-timeline
          label="Matching milestones"
          chronology="ascending"
          chronology-label="Oldest to newest"
        >
          <h2 slot="heading">Matching milestones</h2>
          <wg-empty-state slot="status" label="No matching milestones">
            <h3 slot="heading">No matching milestones</h3>
            <p>Clear the current filters to return to the complete authored history.</p>
            <wg-button slot="actions" appearance="secondary">Clear timeline filters</wg-button>
          </wg-empty-state>
        </wg-timeline>

        <wg-event-log
          label="Retained review events"
          chronology="descending"
          chronology-label="Newest occurrence to oldest"
        >
          <h2 slot="heading">Retained review events</h2>
          <wg-offline-state slot="status" label="Review event source is offline">
            <h3 slot="heading">Review event source is offline</h3>
            <p>Retained records remain visible with their last known occurrence state.</p>
            <time slot="last-known" datetime="2026-08-09T09:18:42-07:00"
              >Last confirmed at 9:18 AM</time
            >
          </wg-offline-state>
          ${renderEventRecord({
            ...eventFixtures[0]!,
            id: 'event-retained-offline',
            knowledge: 'stale',
          })}
        </wg-event-log>
      </main>
    `,
  );
}

const timelineEnvelope: readonly TimelineFixture[] = Array.from({ length: 100 }, (_, index) => {
  const ordinal = index + 1;
  const suffix = String(ordinal).padStart(3, '0');
  const conditions: readonly Condition[] = [
    'neutral',
    'informational',
    'positive',
    'caution',
    'critical',
  ];
  const knowledge: readonly Knowledge[] = [
    'confirmed',
    'inferred',
    'stale',
    'unknown',
    'conflicting',
    'unavailable',
  ];
  return {
    id: `timeline-reference-${suffix}`,
    label: `Reference milestone ${suffix}`,
    time: `Minute ${suffix}`,
    dateTime: `2026-08-09T10:${String(index % 60).padStart(2, '0')}:00-07:00`,
    description:
      ordinal === 37
        ? 'A deliberately long authored milestone explains a regional coordination difference without truncating essential context.'
        : `Application-authored milestone summary ${suffix}.`,
    kind: ordinal % 9 === 0 ? 'interval' : 'milestone',
    ...(ordinal % 9 === 0 ? { endTime: 'Ongoing' } : {}),
    condition: conditions[index % conditions.length]!,
    knowledge: knowledge[index % knowledge.length]!,
    activity: ordinal % 7 === 0 ? 'pending' : 'idle',
    ...(ordinal % 8 === 0 ? { metadata: `Reference WG-TIME-${suffix}` } : {}),
  } satisfies TimelineFixture;
});

const eventEnvelope: readonly EventFixture[] = Array.from({ length: 500 }, (_, index) => {
  const ordinal = index + 1;
  const suffix = String(ordinal).padStart(3, '0');
  const conditions: readonly Condition[] = [
    'neutral',
    'informational',
    'positive',
    'caution',
    'critical',
  ];
  const knowledge: readonly Knowledge[] = [
    'confirmed',
    'inferred',
    'stale',
    'unknown',
    'conflicting',
    'unavailable',
  ];
  return {
    id: `event-reference-${suffix}`,
    label:
      ordinal === 211
        ? 'Reference record with deliberately long localized-looking authored summary content'
        : `Reference event ${suffix}`,
    time: `Sequence ${suffix}`,
    dateTime: `2026-08-09T11:${String(index % 60).padStart(2, '0')}:00-07:00`,
    condition: conditions[index % conditions.length]!,
    knowledge: knowledge[index % knowledge.length]!,
    activity: ordinal % 11 === 0 ? 'pending' : 'idle',
    source: `Source ${String((index % 12) + 1).padStart(2, '0')}`,
    category: ordinal % 3 === 0 ? 'Reference evaluation' : 'Reference observation',
    ...(ordinal % 5 === 0 ? { reference: `WG-EVENT-${suffix}` } : {}),
    ...(ordinal % 25 === 0 ? { action: `Inspect Reference event ${suffix}` } : {}),
  } satisfies EventFixture;
});

export function renderTimelineEnvelope(options: TemporalDataOptions) {
  return renderPage(
    options,
    'One hundred stable timeline items',
    'The reference envelope exercises authored order, intervals, mixed state, long content, and optional metadata.',
    html`<main>${renderTimeline(timelineEnvelope)}</main>`,
  );
}

export function renderEventLogEnvelope(options: TemporalDataOptions) {
  return renderPage(
    options,
    'Five hundred stable event records',
    'The reference envelope exercises dense scanning, mixed state, long content, optional fields, and record-local actions.',
    html`<main>${renderEventLog(eventEnvelope)}</main>`,
  );
}
