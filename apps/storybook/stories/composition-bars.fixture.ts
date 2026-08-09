import '@wayglass/elements/forms.css';

import { defineWgAlert } from '@wayglass/elements/alert';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgCheckbox } from '@wayglass/elements/checkbox';
import { defineWgCommandBar } from '@wayglass/elements/command-bar';
import { defineWgEmptyState } from '@wayglass/elements/empty-state';
import { defineWgEventLog } from '@wayglass/elements/event-log';
import { defineWgEventRecord } from '@wayglass/elements/event-record';
import { defineWgFilterBar } from '@wayglass/elements/filter-bar';
import { defineWgMenu } from '@wayglass/elements/menu';
import { defineWgProgress } from '@wayglass/elements/progress';
import { defineWgSelect } from '@wayglass/elements/select';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { html } from 'lit';

import './composition-bars.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgAlert();
defineWgButton();
defineWgCheckbox();
defineWgSelect();
defineWgProgress();
defineWgEmptyState();
defineWgMenu();
defineWgFilterBar();
defineWgCommandBar();
defineWgEventLog();
defineWgEventRecord();

export type CompositionWidth = 'phone' | 'desktop' | 'wall';
export type CompositionTheme = 'wayglass-dark' | 'wayglass-light';
export type CompositionDensity = 'compact' | 'comfortable';

export interface CompositionOptions {
  readonly width: CompositionWidth;
  readonly theme: CompositionTheme;
  readonly density: CompositionDensity;
}

interface EventFixture {
  readonly id: string;
  readonly label: string;
  readonly time: string;
  readonly dateTime: string;
  readonly condition: 'neutral' | 'informational' | 'positive' | 'caution' | 'critical';
  readonly source: 'north' | 'central' | 'south';
  readonly sourceLabel: string;
  readonly detail: string;
}

const events: readonly EventFixture[] = [
  {
    id: 'composition-event-01',
    label: 'North intake batch accepted',
    time: '2:24:18 PM',
    dateTime: '2026-08-09T14:24:18-07:00',
    condition: 'positive',
    source: 'north',
    sourceLabel: 'North intake',
    detail: '184 records entered the confirmed review queue.',
  },
  {
    id: 'composition-event-02',
    label: 'Central policy evaluation completed',
    time: '2:23:52 PM',
    dateTime: '2026-08-09T14:23:52-07:00',
    condition: 'neutral',
    source: 'central',
    sourceLabel: 'Central review',
    detail: 'The standard review policy remains active.',
  },
  {
    id: 'composition-event-03',
    label: 'South response exceeded its expected window',
    time: '2:22:41 PM',
    dateTime: '2026-08-09T14:22:41-07:00',
    condition: 'caution',
    source: 'south',
    sourceLabel: 'South coordination',
    detail: 'Retained confirmed results remain visible while the response is checked.',
  },
  {
    id: 'composition-event-04',
    label: 'North retry request accepted',
    time: '2:21:09 PM',
    dateTime: '2026-08-09T14:21:09-07:00',
    condition: 'informational',
    source: 'north',
    sourceLabel: 'North intake',
    detail: 'The request is pending; no successful completion is implied.',
  },
  {
    id: 'composition-event-05',
    label: 'South capacity observation unavailable',
    time: '2:19:37 PM',
    dateTime: '2026-08-09T14:19:37-07:00',
    condition: 'critical',
    source: 'south',
    sourceLabel: 'South coordination',
    detail: 'The last confirmed capacity remains the application baseline.',
  },
] as const;

function renderEvent(event: EventFixture) {
  return html`
    <wg-event-record
      id=${event.id}
      data-condition=${event.condition}
      data-source=${event.source}
      label=${event.label}
      condition=${event.condition}
    >
      <time slot="time" datetime=${event.dateTime}>${event.time}</time>
      <span slot="summary">${event.label}</span>
      <span slot="source">Source: ${event.sourceLabel}</span>
      <span slot="category">Category: Operational event</span>
      <details slot="details">
        <summary>Inspect ${event.label}</summary>
        <p>${event.detail}</p>
      </details>
    </wg-event-record>
  `;
}

function updateResults(form: HTMLFormElement, conditions: readonly string[], source: string): void {
  const workspace = form.closest<HTMLElement>('[data-composition-workspace]');
  const records = Array.from(workspace?.querySelectorAll<HTMLElement>('wg-event-record') ?? []);
  const visible = records.filter((record) => {
    const conditionMatches =
      conditions.length === 0 || conditions.includes(record.dataset.condition ?? '');
    const sourceMatches = source === 'all' || source === record.dataset.source;
    record.hidden = !(conditionMatches && sourceMatches);
    return !record.hidden;
  });
  const summary = form.closest('wg-filter-bar')?.querySelector<HTMLElement>('[slot="summary"]');
  const context = workspace?.querySelector<HTMLElement>('[data-result-context]');
  const empty = workspace?.querySelector<HTMLElement>('[data-empty-results]');
  const values = [
    ...conditions.map((condition) => condition[0]!.toUpperCase() + condition.slice(1)),
    ...(source === 'all'
      ? []
      : [
          form.querySelector<HTMLOptionElement>(`option[value="${source}"]`)?.textContent ?? source,
        ]),
  ];
  if (summary) {
    summary.textContent =
      values.length === 0
        ? 'No filters applied.'
        : `${values.length} ${values.length === 1 ? 'filter' : 'filters'} applied: ${values.join(', ')}.`;
  }
  if (context) {
    context.textContent = `${visible.length} ${visible.length === 1 ? 'event' : 'events'}, filtered from ${records.length}.`;
  }
  if (empty) empty.hidden = visible.length !== 0;
}

function applyFilters(event: SubmitEvent): void {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const submitter = event.submitter as HTMLButtonElement | null;
  if (submitter?.value === 'clear') {
    form.reset();
    updateResults(form, [], 'all');
    return;
  }
  const data = new FormData(form, submitter);
  updateResults(form, data.getAll('condition').map(String), String(data.get('source') ?? 'all'));
}

function describeDraftReset(event: Event): void {
  const form = event.currentTarget as HTMLFormElement;
  queueMicrotask(() => {
    const status = form.closest('wg-filter-bar')?.querySelector<HTMLElement>('[slot="status"]');
    if (status)
      status.textContent = 'Draft controls reset. Applied filters and results are unchanged.';
  });
}

function beginCommand(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const bar = button.closest('wg-command-bar');
  button.setAttribute('pending', '');
  const status = bar?.querySelector<HTMLElement>('[slot="status"]');
  if (status) {
    status.textContent =
      'Acknowledging 2 selected Event records. Confirmed record state is unchanged.';
  }
}

function reportOverflowCommand(event: CustomEvent<{ readonly value: string }>): void {
  const status = (event.currentTarget as HTMLElement)
    .closest('wg-command-bar')
    ?.querySelector<HTMLElement>('[slot="status"]');
  if (status)
    status.textContent = `Requested ${event.detail.value}; completion remains application-owned.`;
}

function renderFilterBar() {
  return html`
    <wg-filter-bar label="Event filters">
      <h2 slot="heading">Event filters</h2>
      <p slot="description">Narrow the retained operational event records.</p>
      <form class="wg-composition-filter-form" @submit=${applyFilters} @reset=${describeDraftReset}>
        <fieldset>
          <legend>Condition</legend>
          <wg-checkbox>
            <input id="composition-caution" name="condition" type="checkbox" value="caution" />
            <label for="composition-caution">Caution</label>
          </wg-checkbox>
          <wg-checkbox>
            <input id="composition-critical" name="condition" type="checkbox" value="critical" />
            <label for="composition-critical">Critical</label>
          </wg-checkbox>
        </fieldset>
        <label for="composition-source">Source</label>
        <wg-select>
          <select id="composition-source" name="source">
            <option value="all">All sources</option>
            <option value="north">North intake</option>
            <option value="central">Central review</option>
            <option value="south">South coordination</option>
          </select>
        </wg-select>
        <div class="wg-composition-filter-actions">
          <button class="wg-form-action" name="intent" value="apply" type="submit">
            Apply Event filters
          </button>
          <button class="wg-form-action wg-form-action--quiet" type="reset">
            Reset filter draft
          </button>
          <button
            class="wg-form-action wg-form-action--quiet"
            name="intent"
            value="clear"
            type="submit"
          >
            Clear filters
          </button>
        </div>
      </form>
      <p slot="summary">No filters applied.</p>
      <p slot="status">Draft values match the currently applied filters.</p>
    </wg-filter-bar>
  `;
}

function renderCommandBar() {
  return html`
    <wg-command-bar label="Selected Event record commands">
      <h2 slot="heading">Selected Event record commands</h2>
      <p slot="description">Two selected records in the current filtered result.</p>
      <wg-button appearance="primary" @click=${beginCommand}>
        Acknowledge 2 selected Event records
      </wg-button>
      <wg-button slot="secondary" appearance="secondary">
        Assign 2 selected Event records
      </wg-button>
      <wg-menu
        slot="overflow"
        label="More selected Event record commands"
        @wg-command=${reportOverflowCommand}
      >
        <span slot="trigger">More Event commands</span>
        <wg-command-item value="export selected Event records">
          Export selected Event records
        </wg-command-item>
        <wg-command-item value="archive selected Event records" disabled>
          Archive selected Event records
          <span slot="detail">Unavailable while operational review is open</span>
        </wg-command-item>
      </wg-menu>
      <p slot="status">2 records selected; no command is pending.</p>
    </wg-command-bar>
  `;
}

function renderPage(
  options: CompositionOptions,
  title: string,
  description: string,
  content: unknown,
) {
  return html`
    <div
      class="wg-composition-viewport wg-composition-viewport--${options.width}"
      data-composition-width=${options.width}
    >
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-composition-header">
            <p>Operational Events · Application-owned collection tools</p>
            <h1>${title}</h1>
            <p>${description}</p>
          </header>
          ${content}
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export function renderCompositionWorkspace(options: CompositionOptions) {
  return renderPage(
    options,
    'Filter, understand, then act',
    'Native filter submission and immediate commands remain distinct while sharing stable function-local context.',
    html`
      <main class="wg-composition-workspace" data-composition-workspace>
        <div class="wg-composition-tools">${renderFilterBar()} ${renderCommandBar()}</div>
        <section class="wg-composition-results" aria-labelledby="composition-results-heading">
          <h2 id="composition-results-heading">Operational event results</h2>
          <p
            class="wg-composition-result-context"
            data-result-context
            aria-live="polite"
            aria-atomic="true"
          >
            5 events, unfiltered.
          </p>
          <wg-empty-state data-empty-results label="No events match the applied filters" hidden>
            <h3 slot="heading">No events match the applied filters</h3>
            <p>Change the filter draft or clear filters to restore the retained event records.</p>
          </wg-empty-state>
          <wg-event-log
            label="Filtered operational events"
            chronology="descending"
            chronology-label="Newest occurrence to oldest"
          >
            ${events.map(renderEvent)}
          </wg-event-log>
        </section>
      </main>
    `,
  );
}

export function renderCompositionFeedback(options: CompositionOptions) {
  return renderPage(
    options,
    'Pending work, rejection, and recovery',
    'Durable application-owned status remains outside dismissed menus and identifies what is still true.',
    html`
      <main class="wg-composition-feedback">
        <section class="wg-composition-feedback-card" aria-label="Pending filter request">
          <h2>Pending filter request</h2>
          <p>Retained results stay visible while a newer query is pending.</p>
          <wg-filter-bar label="Pending Event filters">
            <form
              class="wg-composition-filter-form"
              @submit=${(event: SubmitEvent) => event.preventDefault()}
            >
              <label for="pending-source">Source</label>
              <wg-select>
                <select id="pending-source" name="source" disabled>
                  <option>South coordination</option>
                </select>
              </wg-select>
              <button class="wg-form-action" type="submit" disabled>Apply Event filters</button>
            </form>
            <p slot="summary">1 filter applied: All sources.</p>
            <wg-progress slot="status">
              <label for="pending-filter-progress">Applying South coordination filter</label>
              <progress
                id="pending-filter-progress"
                aria-label="Applying South coordination filter"
              ></progress>
              <output>5 retained events remain valid while the request is pending.</output>
            </wg-progress>
          </wg-filter-bar>
        </section>

        <section class="wg-composition-feedback-card" aria-label="Rejected command recovery">
          <h2>Rejected command recovery</h2>
          <p>
            The attempted command is named, confirmed state remains explicit, and retry stays
            visible.
          </p>
          <wg-command-bar label="Rejected Event record command">
            <wg-button appearance="primary">Acknowledge 2 selected Event records</wg-button>
            <div slot="status" class="wg-composition-status-stack">
              <wg-alert label="Acknowledgement failed" condition="critical" announcement="off">
                <strong slot="heading">Acknowledgement was not accepted</strong>
                <p>
                  The 2 Event records remain unacknowledged. Authorization could not be confirmed.
                </p>
              </wg-alert>
              <wg-button appearance="secondary"
                >Retry acknowledging 2 selected Event records</wg-button
              >
            </div>
          </wg-command-bar>
        </section>

        <section class="wg-composition-feedback-card" aria-label="Unavailable command reason">
          <h2>Unavailable command reason</h2>
          <p>Availability is application policy, not a condition-color inference.</p>
          <wg-command-bar label="Event archive commands">
            <wg-button disabled>Archive selected Event records</wg-button>
            <p slot="status">
              Archive is unavailable while operational review WG-1842 remains open. Export remains
              available.
            </p>
          </wg-command-bar>
        </section>
      </main>
    `,
  );
}

export function renderCompositionNoMatches(options: CompositionOptions) {
  return renderPage(
    options,
    'No matching operational events',
    'The applied summary and result context describe committed application state without moving focus.',
    html`
      <main class="wg-composition-workspace">
        <wg-filter-bar label="Event filters with no matches">
          <form
            class="wg-composition-filter-form"
            @submit=${(event: SubmitEvent) => event.preventDefault()}
          >
            <label for="no-match-source">Source</label>
            <wg-select>
              <select id="no-match-source" name="source">
                <option>Archive coordination</option>
              </select>
            </wg-select>
            <button class="wg-form-action" type="submit">Apply Event filters</button>
            <button class="wg-form-action wg-form-action--quiet" type="reset">
              Reset filter draft
            </button>
          </form>
          <p slot="summary">2 filters applied: Critical, Archive coordination.</p>
          <p slot="status">Draft values match the currently applied filters.</p>
        </wg-filter-bar>
        <section class="wg-composition-results" aria-labelledby="no-match-heading">
          <h2 id="no-match-heading">Operational event results</h2>
          <p class="wg-composition-result-context">0 events, filtered from 500.</p>
          <wg-empty-state label="No events match Critical and Archive coordination">
            <h3 slot="heading">No events match the applied filters</h3>
            <p>Change the filter draft, then apply it, or use the clearly labeled clear command.</p>
            <button slot="actions" class="wg-form-action wg-form-action--quiet" type="button">
              Clear Event filters
            </button>
          </wg-empty-state>
        </section>
      </main>
    `,
  );
}
