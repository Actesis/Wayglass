import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import {
  defineWgConfirmationDialog,
  type WgConfirmationDialog,
} from '@wayglass/elements/confirmation-dialog';
import { defineWgDataTable } from '@wayglass/elements/data-table';
import '@wayglass/elements/data-table.css';
import { defineWgProgress } from '@wayglass/elements/progress';
import { defineWgScrollRegion } from '@wayglass/elements/scroll-region';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { html } from 'lit';

import './data-table.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgButton();
defineWgProgress();
defineWgScrollRegion();
defineWgDataTable();
defineWgConfirmationDialog();

export type DataTableWidth = 'phone' | 'desktop' | 'wall';
export type DataTableTheme = 'wayglass-dark' | 'wayglass-light';
export type DataTableDensity = 'compact' | 'comfortable';

export interface DataTableOptions {
  readonly width: DataTableWidth;
  readonly theme: DataTableTheme;
  readonly density: DataTableDensity;
}

interface OperationalRecord {
  readonly id: string;
  readonly record: string;
  readonly owner: string;
  readonly condition: 'Positive' | 'Caution' | 'Critical' | 'Neutral';
  readonly knowledge: 'Confirmed' | 'Inferred' | 'Stale' | 'Unavailable';
  readonly activity: 'Idle' | 'Pending';
  readonly updated: string;
  readonly dateTime: string;
}

const sparseRecords: readonly OperationalRecord[] = [
  {
    id: 'WG-1842',
    record: 'Regional evidence review',
    owner: 'Coordination',
    condition: 'Caution',
    knowledge: 'Confirmed',
    activity: 'Idle',
    updated: '2:24 PM',
    dateTime: '2026-08-10T14:24:00-07:00',
  },
  {
    id: 'WG-1847',
    record: 'Capacity reconciliation',
    owner: 'Analysis',
    condition: 'Positive',
    knowledge: 'Confirmed',
    activity: 'Idle',
    updated: '2:18 PM',
    dateTime: '2026-08-10T14:18:00-07:00',
  },
  {
    id: 'WG-1851',
    record: 'External route check',
    owner: 'Delivery',
    condition: 'Neutral',
    knowledge: 'Stale',
    activity: 'Pending',
    updated: '2:03 PM',
    dateTime: '2026-08-10T14:03:00-07:00',
  },
  {
    id: 'WG-1854',
    record: 'Authorization review',
    owner: 'Governance',
    condition: 'Critical',
    knowledge: 'Inferred',
    activity: 'Idle',
    updated: '1:56 PM',
    dateTime: '2026-08-10T13:56:00-07:00',
  },
] as const;

function conditionClass(condition: OperationalRecord['condition']): string {
  return `wg-data-table-state wg-data-table-state--${condition.toLowerCase()}`;
}

function renderRecordRow(record: OperationalRecord) {
  return html`
    <tr data-record-id=${record.id}>
      <th scope="row">
        ${record.record}
        <small>${record.id}</small>
      </th>
      <td>${record.owner}</td>
      <td><span class=${conditionClass(record.condition)}>${record.condition}</span></td>
      <td>${record.knowledge}</td>
      <td>${record.activity}</td>
      <td><time datetime=${record.dateTime}>${record.updated}</time></td>
      <td>
        <wg-button appearance="secondary">Inspect ${record.record}</wg-button>
      </td>
    </tr>
  `;
}

function toggleUpdatedSort(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const table = button.closest('table');
  const header = button.closest('th');
  const body = table?.tBodies.item(0);
  if (!table || !header || !body) return;

  const descending = header.getAttribute('aria-sort') === 'descending';
  const nextDirection = descending ? 'ascending' : 'descending';
  const rows = Array.from(body.rows);
  rows.reverse().forEach((row) => body.append(row));
  header.setAttribute('aria-sort', nextDirection);
  button.textContent = `Updated, ${nextDirection === 'descending' ? 'newest' : 'oldest'} first`;
  const context = table.closest('wg-data-table')?.querySelector<HTMLElement>('[slot="context"]');
  if (context) {
    context.textContent = `${String(rows.length)} records shown; sorted by ${nextDirection === 'descending' ? 'newest' : 'oldest'} update.`;
  }
}

function showRemovalConfirmation(event: Event): void {
  const invoker = event.currentTarget as HTMLElement;
  const provider = invoker.closest('wg-theme-provider');
  provider?.querySelector<WgConfirmationDialog>('#table-removal-confirmation')?.show({ invoker });
}

function renderOperationalTable(records: readonly OperationalRecord[], sticky = false) {
  return html`
    <wg-data-table id="operational-review-table">
      <p slot="context">${records.length} records shown; sorted by newest update.</p>
      <wg-scroll-region axis="inline" label="Operational review records table">
        <table class=${sticky ? 'wg-data-table-sticky' : ''}>
          <caption>
            Operational review records
          </caption>
          <thead>
            <tr>
              <th scope="col">Record</th>
              <th scope="col">Owner</th>
              <th scope="col">Condition</th>
              <th scope="col">Knowledge</th>
              <th scope="col">Activity</th>
              <th scope="col" aria-sort="descending">
                <button type="button" @click=${toggleUpdatedSort}>Updated, newest first</button>
              </th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(renderRecordRow)}
          </tbody>
        </table>
      </wg-scroll-region>
      <p slot="feedback">All shown records are current unless a knowledge label says otherwise.</p>
    </wg-data-table>
  `;
}

function createEnvelopeRecords(batch: number): readonly OperationalRecord[] {
  return Array.from({ length: 25 }, (_, index) => {
    const sequence = index + 1;
    const suffix = String(sequence).padStart(2, '0');
    const changing = sequence > 5;
    return {
      id: `WG-${batch}${suffix}`,
      record: `${changing ? 'Batch record' : 'Retained record'} ${suffix}`,
      owner: ['Coordination', 'Analysis', 'Delivery', 'Governance'][index % 4]!,
      condition: ['Neutral', 'Positive', 'Caution'][index % 3] as OperationalRecord['condition'],
      knowledge: changing && batch === 2 ? 'Inferred' : 'Confirmed',
      activity: changing && index % 6 === 0 ? 'Pending' : 'Idle',
      updated: `${String(2 + Math.floor(index / 12))}:${String((index * 7) % 60).padStart(2, '0')} PM`,
      dateTime: `2026-08-10T${String(14 + Math.floor(index / 12)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00-07:00`,
    };
  });
}

function replaceEnvelopeRows(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const provider = button.closest('wg-theme-provider');
  const body = provider?.querySelector<HTMLTableSectionElement>('#data-table-envelope tbody');
  const feedback = provider?.querySelector<HTMLElement>('#data-table-envelope-feedback');
  if (!body) return;

  const nextRecords = createEnvelopeRecords(2).slice(5);
  Array.from(body.rows)
    .slice(5)
    .forEach((row) => row.remove());
  for (const record of nextRecords) {
    const row = body.insertRow();
    row.dataset.recordId = record.id;
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = record.record;
    row.append(heading);
    for (const value of [
      record.id,
      record.owner,
      record.condition,
      record.knowledge,
      record.activity,
      record.updated,
      'Standard',
      'Regional',
      'Open',
      'Review',
      'Inspect',
    ]) {
      const cell = row.insertCell();
      cell.textContent = value;
    }
  }
  if (feedback) {
    feedback.textContent =
      '20 application-owned rows replaced; five retained rows and focus remained stable.';
  }
}

function renderEnvelopeTable() {
  const records = createEnvelopeRecords(1);
  return html`
    <div class="wg-data-table-envelope-actions">
      <wg-button id="replace-envelope-rows" appearance="secondary" @click=${replaceEnvelopeRows}>
        Apply next 20-record batch
      </wg-button>
      <p>The application replaces records 6–25 without rebuilding the table or its controls.</p>
    </div>
    <wg-data-table id="data-table-envelope">
      <p slot="context">25 records · 12 columns · one native table.</p>
      <wg-scroll-region axis="inline" label="Wide operational reference table">
        <table class="wg-data-table-wide wg-data-table-sticky">
          <caption>
            Wide operational reference envelope
          </caption>
          <thead>
            <tr>
              ${[
                'Record',
                'Reference',
                'Owner',
                'Condition',
                'Knowledge',
                'Activity',
                'Updated',
                'Policy',
                'Scope',
                'Access',
                'Decision',
                'Actions',
              ].map((heading) => html`<th scope="col">${heading}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${records.map(
              (record) => html`
                <tr data-record-id=${record.id}>
                  <th scope="row">${record.record}</th>
                  <td>${record.id}</td>
                  <td>${record.owner}</td>
                  <td>${record.condition}</td>
                  <td>${record.knowledge}</td>
                  <td>${record.activity}</td>
                  <td>${record.updated}</td>
                  <td>Standard</td>
                  <td>Regional</td>
                  <td>Open</td>
                  <td>Review</td>
                  <td><button type="button">Inspect ${record.record}</button></td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </wg-scroll-region>
      <p id="data-table-envelope-feedback" slot="feedback">All 25 records are current.</p>
    </wg-data-table>
  `;
}

function renderPage(
  options: DataTableOptions,
  title: string,
  description: string,
  content: unknown,
) {
  return html`
    <div class="wg-data-table-viewport wg-data-table-viewport--${options.width}">
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-data-table-header">
            <p>Operational Activity · Tabular comparison</p>
            <h1>${title}</h1>
            <p>${description}</p>
          </header>
          ${content}
        </wg-canvas>
        <wg-confirmation-dialog
          id="table-removal-confirmation"
          dialog-id="remove-operational-record"
          action-label="Remove WG-1854"
          cancel-label="Keep record"
          action-appearance="critical"
          initial-focus="cancel"
        >
          <h2 slot="heading">Remove authorization review WG-1854?</h2>
          <p>The record will leave this review queue. Its audit history remains available.</p>
        </wg-confirmation-dialog>
      </wg-theme-provider>
    </div>
  `;
}

export function renderDataTableWorkspace(options: DataTableOptions) {
  return renderPage(
    options,
    'Operational review table',
    'Native headers, authored state labels, sorting, and row actions stay inside one stable comparison surface.',
    html`
      <main class="wg-data-table-workspace">
        ${renderOperationalTable(sparseRecords)}
        <section class="wg-data-table-guidance" aria-labelledby="table-action-guidance">
          <h2 id="table-action-guidance">Application-owned decisions</h2>
          <p>
            Sorting reorders existing rows and leaves focus on the header control. A consequential
            row action uses the accepted confirmation pattern.
          </p>
          <wg-button appearance="critical" @click=${showRemovalConfirmation}>
            Remove authorization review WG-1854
          </wg-button>
        </section>
      </main>
    `,
  );
}

export function renderDataTableStates(options: DataTableOptions) {
  return renderPage(
    options,
    'Authored collection states',
    'Loading, empty, retained stale, and unavailable data remain explicit application statements—not guesses made from row count.',
    html`
      <main class="wg-data-table-state-grid">
        <wg-data-table id="data-table-loading">
          <wg-scroll-region axis="inline" label="Loading assignment records" hidden>
            <table>
              <caption>
                Assignment records
              </caption>
              <tbody></tbody>
            </table>
          </wg-scroll-region>
          <wg-progress slot="feedback">
            <label for="data-table-loading-progress">Loading assignment records</label>
            <progress id="data-table-loading-progress"></progress>
            <output>Waiting for the first confirmed response.</output>
          </wg-progress>
        </wg-data-table>

        <wg-data-table id="data-table-empty">
          <p slot="context">0 records match the current application filters.</p>
          <wg-scroll-region axis="inline" label="Matching review records table">
            <table>
              <caption>
                Matching review records
              </caption>
              <thead>
                <tr>
                  <th scope="col">Record</th>
                  <th scope="col">Owner</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </wg-scroll-region>
          <div slot="feedback">
            <strong>No matching records</strong>
            <p>Clear the application filters to restore all review records.</p>
          </div>
        </wg-data-table>

        <wg-data-table id="data-table-stale">
          <p slot="context">2 retained records; refresh pending.</p>
          <wg-scroll-region axis="inline" label="Retained delivery records table">
            <table aria-busy="true">
              <caption>
                Retained delivery records
              </caption>
              <thead>
                <tr>
                  <th scope="col">Record</th>
                  <th scope="col">Knowledge</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Primary route</th>
                  <td>Stale · last confirmed 12 minutes ago</td>
                </tr>
                <tr>
                  <th scope="row">Backup route</th>
                  <td>Confirmed</td>
                </tr>
              </tbody>
            </table>
          </wg-scroll-region>
          <p slot="feedback">Refreshing retained records. Confirmed values remain visible.</p>
        </wg-data-table>

        <wg-data-table id="data-table-unavailable">
          <wg-scroll-region axis="inline" label="External capacity records" hidden>
            <table>
              <caption>
                External capacity records
              </caption>
              <tbody></tbody>
            </table>
          </wg-scroll-region>
          <div slot="feedback">
            <strong>External capacity records unavailable</strong>
            <p>No retained records are safe to show. Retry remains application-owned.</p>
          </div>
        </wg-data-table>
      </main>
    `,
  );
}

export function renderDataTableEnvelope(options: DataTableOptions) {
  return renderPage(
    options,
    'Wide and live table envelope',
    'A dense 12-column table uses contained inline overflow, application-authored sticky headers, and stable keyed retention.',
    html`<main class="wg-data-table-workspace">${renderEnvelopeTable()}</main>`,
  );
}
