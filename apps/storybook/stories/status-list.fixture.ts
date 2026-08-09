import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { defineWgBooleanValue } from '@wayglass/elements/boolean-value';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgEmptyState } from '@wayglass/elements/empty-state';
import { defineWgKeyValue } from '@wayglass/elements/key-value';
import { defineWgOfflineState } from '@wayglass/elements/offline-state';
import { defineWgProgress } from '@wayglass/elements/progress';
import { defineWgStatusEntry } from '@wayglass/elements/status-entry';
import { defineWgStatusList } from '@wayglass/elements/status-list';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { html } from 'lit';

import './status-list.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgButton();
defineWgBooleanValue();
defineWgKeyValue();
defineWgEmptyState();
defineWgOfflineState();
defineWgProgress();
defineWgStatusEntry();
defineWgStatusList();

export type StatusListWidth = 'phone' | 'desktop' | 'wall';
export type StatusListTheme = 'wayglass-dark' | 'wayglass-light';
export type StatusListDensity = 'compact' | 'comfortable';

export interface StatusListOptions {
  readonly width: StatusListWidth;
  readonly theme: StatusListTheme;
  readonly density: StatusListDensity;
}

interface StatusEntryFixture {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly condition?: Condition;
  readonly knowledge?: Knowledge;
  readonly activity?: Activity;
  readonly valueLabel?: string;
  readonly value?: string;
  readonly booleanLabel?: string;
  readonly asserted?: boolean;
  readonly assertedLabel?: string;
  readonly notAssertedLabel?: string;
  readonly observedAt?: string;
  readonly observedText?: string;
  readonly metadata?: string;
  readonly action?: string;
}

interface StatusListFixture {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly entries: readonly StatusEntryFixture[];
  readonly busy?: boolean;
  readonly status?: string;
  readonly action?: string;
}

const statusLists: readonly StatusListFixture[] = [
  {
    id: 'status-intake',
    label: 'Intake sources',
    description: 'Current source summaries in application-authored priority order.',
    entries: [
      {
        id: 'status-intake-primary',
        label: 'Primary source',
        summary: 'Delivery is operating inside its expected range.',
        condition: 'positive',
        valueLabel: 'Queue',
        value: '18 records',
        observedAt: '2026-08-09T14:22:00-07:00',
        observedText: 'Observed at 2:22 PM',
        metadata: 'Priority 1 · Regional intake',
        action: 'Inspect Primary source',
      },
      {
        id: 'status-intake-secondary',
        label: 'Secondary source',
        summary: 'The last confirmed route remains active while a refresh completes.',
        condition: 'caution',
        knowledge: 'stale',
        activity: 'pending',
        valueLabel: 'Last batch',
        value: '1,284 records',
        observedAt: '2026-08-09T14:12:00-07:00',
        observedText: 'Observed at 2:12 PM',
        metadata: 'Priority 2 · Remote coordination',
        action: 'Inspect Secondary source',
      },
      {
        id: 'status-intake-manual',
        label: 'Manual intake',
        summary: 'Available on request; no condition is currently asserted.',
        booleanLabel: 'Verified',
        asserted: true,
        assertedLabel: 'Yes',
        notAssertedLabel: 'No',
        metadata: 'Owner: Review team',
      },
    ],
  },
  {
    id: 'status-processing',
    label: 'Processing agents',
    description: 'Agent condition remains separate from current work and data confidence.',
    busy: true,
    status: 'Refreshing retained agent summaries.',
    action: 'Refresh Processing agents',
    entries: [
      {
        id: 'status-processing-a',
        label: 'Agent A',
        summary: 'Current assignments are progressing normally.',
        condition: 'positive',
        valueLabel: 'Assigned',
        value: '24 tasks',
        metadata: 'Policy: Standard review',
      },
      {
        id: 'status-processing-b',
        label: 'Agent B',
        summary: 'Work is inside limits; the source estimate is inferred.',
        condition: 'informational',
        knowledge: 'inferred',
        valueLabel: 'Assigned',
        value: '11 tasks',
        metadata: 'Estimate from partial observations',
        action: 'Review Agent B',
      },
      {
        id: 'status-processing-c',
        label: 'Agent C',
        summary: 'Two current records disagree; confirmed work remains visible.',
        condition: 'caution',
        knowledge: 'conflicting',
        valueLabel: 'Confirmed',
        value: '7 tasks',
        metadata: 'Reference WG-OPS-000184',
        action: 'Resolve Agent C conflict',
      },
    ],
  },
  {
    id: 'status-delivery',
    label: 'Delivery channels',
    description:
      'Channel summaries demonstrate unavailable and pending state without hidden icons.',
    entries: [
      {
        id: 'status-delivery-west',
        label: 'West channel',
        summary: 'Confirmed delivery is operating normally.',
        condition: 'positive',
        booleanLabel: 'Enabled',
        asserted: true,
        assertedLabel: 'Yes',
        notAssertedLabel: 'No',
        observedAt: '2026-08-09T14:24:00-07:00',
        observedText: 'Confirmed at 2:24 PM',
      },
      {
        id: 'status-delivery-east',
        label: 'East channel',
        summary: 'No current channel summary is available.',
        condition: 'critical',
        knowledge: 'unavailable',
        metadata: 'Last confirmed route retained by the application',
        action: 'Inspect East channel',
      },
      {
        id: 'status-delivery-archive',
        label: 'Archive channel',
        summary: 'A requested transfer is pending; confirmed configuration is unchanged.',
        activity: 'pending',
        booleanLabel: 'Enabled',
        asserted: false,
        assertedLabel: 'Yes',
        notAssertedLabel: 'No',
        metadata: 'Request awaiting authorization',
      },
    ],
  },
] as const;

function requestEntryRefresh(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const entry = button.closest<HTMLElement>('wg-status-entry');
  const list = button.closest<HTMLElement>('wg-status-list');
  if (entry) entry.setAttribute('activity', 'pending');
  if (list) list.setAttribute('busy', '');
}

function renderEntry(entry: StatusEntryFixture) {
  return html`
    <wg-status-entry
      id=${entry.id}
      label=${entry.label}
      condition=${entry.condition ?? 'neutral'}
      knowledge=${entry.knowledge ?? 'confirmed'}
      activity=${entry.activity ?? 'idle'}
    >
      <h3 slot="heading">${entry.label}</h3>
      <p slot="description">${entry.summary}</p>
      ${
        entry.valueLabel
          ? html`<wg-key-value
              slot="value"
              label=${entry.valueLabel}
              value=${entry.value ?? ''}
            ></wg-key-value>`
          : undefined
      }
      ${
        entry.booleanLabel
          ? html`<wg-boolean-value
              slot="value"
              label=${entry.booleanLabel}
              ?asserted=${entry.asserted}
              asserted-label=${entry.assertedLabel ?? 'Yes'}
              not-asserted-label=${entry.notAssertedLabel ?? 'No'}
            ></wg-boolean-value>`
          : undefined
      }
      ${
        entry.observedAt
          ? html`<time slot="time" datetime=${entry.observedAt}>${entry.observedText}</time>`
          : undefined
      }
      ${entry.metadata ? html`<span slot="metadata">${entry.metadata}</span>` : undefined}
      ${
        entry.action
          ? html`<wg-button slot="actions" appearance="secondary" @click=${requestEntryRefresh}
              >${entry.action}</wg-button
            >`
          : undefined
      }
    </wg-status-entry>
  `;
}

function renderList(list: StatusListFixture) {
  return html`
    <wg-status-list id=${list.id} label=${list.label} ?busy=${list.busy}>
      <h2 slot="heading">${list.label}</h2>
      <p slot="description">${list.description}</p>
      ${list.status ? html`<p slot="status">${list.status}</p>` : undefined}
      ${
        list.action
          ? html`<wg-button slot="actions" appearance="secondary" @click=${requestEntryRefresh}
              >${list.action}</wg-button
            >`
          : undefined
      }
      ${list.entries.map(renderEntry)}
    </wg-status-list>
  `;
}

function renderPage(
  options: StatusListOptions,
  title: string,
  description: string,
  content: unknown,
) {
  return html`
    <div
      class="wg-status-viewport wg-status-viewport--${options.width}"
      data-status-width=${options.width}
    >
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-status-header">
            <p>Operational Activity · Current status</p>
            <h1>${title}</h1>
            <p>${description}</p>
          </header>
          ${content}
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export function renderStatusListWorkspace(options: StatusListOptions) {
  return renderPage(
    options,
    'Current operational status',
    'Three named functions remain visually separate while their entries share one status language.',
    html`<main class="wg-status-workspace">${statusLists.map(renderList)}</main>`,
  );
}

export function renderStatusListFeedback(options: StatusListOptions) {
  return renderPage(
    options,
    'Collection feedback states',
    'Loading, empty results, and offline retention remain authored states outside list-item semantics.',
    html`
      <main class="wg-status-feedback-grid">
        <wg-status-list label="Loading sources" busy>
          <h2 slot="heading">Loading sources</h2>
          <wg-progress slot="status">
            <label for="status-loading-progress">Loading current source summaries</label>
            <progress
              id="status-loading-progress"
              aria-label="Loading current source summaries"
            ></progress>
            <output>Waiting for the first confirmed response.</output>
          </wg-progress>
        </wg-status-list>

        <wg-status-list label="Matching sources">
          <h2 slot="heading">Matching sources</h2>
          <wg-empty-state slot="status" label="No matching sources">
            <h3 slot="heading">No matching sources</h3>
            <p>Clear the current filters to return to the authored collection.</p>
            <wg-button slot="actions" appearance="secondary">Clear source filters</wg-button>
          </wg-empty-state>
        </wg-status-list>

        <wg-status-list label="Remote sources">
          <h2 slot="heading">Remote sources</h2>
          <wg-offline-state slot="status" label="Remote source is offline">
            <h3 slot="heading">Remote source is offline</h3>
            <p>Retained entries remain visible and keep their last known state.</p>
            <time slot="last-known" datetime="2026-08-09T14:12:00-07:00"
              >Last confirmed at 2:12 PM</time
            >
          </wg-offline-state>
          ${renderEntry({
            id: 'status-feedback-retained',
            label: 'Retained source',
            summary: 'The last confirmed summary remains visible while the source is offline.',
            condition: 'caution',
            knowledge: 'stale',
            valueLabel: 'Queue',
            value: '18 records',
          })}
        </wg-status-list>
      </main>
    `,
  );
}

const envelopeEntries: readonly StatusEntryFixture[] = Array.from({ length: 100 }, (_, index) => {
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
    id: `status-reference-${suffix}`,
    label: `Reference source ${suffix}`,
    summary:
      ordinal === 37
        ? 'Regional coordination — western interval with deliberately long localized-looking content.'
        : `Current authored summary ${suffix}.`,
    condition: conditions[index % conditions.length]!,
    knowledge: knowledge[index % knowledge.length]!,
    activity: ordinal % 7 === 0 ? 'pending' : 'idle',
    ...(ordinal % 4 === 0
      ? {
          valueLabel: 'Current value',
          value: ordinal === 40 ? '١٬٢٨٤ records' : `${ordinal * 3} records`,
        }
      : {}),
    ...(ordinal % 6 === 0 ? { metadata: `Reference WG-STATUS-${suffix}` } : {}),
    ...(ordinal % 10 === 0 ? { action: `Inspect Reference source ${suffix}` } : {}),
  } satisfies StatusEntryFixture;
});

export function renderStatusListEnvelope(options: StatusListOptions) {
  return renderPage(
    options,
    'One hundred stable status entries',
    'The reference envelope exercises mixed state, optional content, actions, long text, and authored order.',
    html`
      <main>
        ${renderList({
          id: 'status-reference-envelope',
          label: 'Reference status envelope',
          description: 'One hundred application-owned entries in stable DOM order.',
          entries: envelopeEntries,
        })}
      </main>
    `,
  );
}
