import '@wayglass/elements/data-table.css';
import '@wayglass/elements/forms.css';

import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgCommandBar } from '@wayglass/elements/command-bar';
import { defineWgDataTable } from '@wayglass/elements/data-table';
import { defineWgElbow } from '@wayglass/elements/elbow';
import { defineWgEmptyState } from '@wayglass/elements/empty-state';
import { defineWgEventLog } from '@wayglass/elements/event-log';
import { defineWgEventRecord } from '@wayglass/elements/event-record';
import { defineWgFilterBar } from '@wayglass/elements/filter-bar';
import { defineWgKeyValue } from '@wayglass/elements/key-value';
import { defineWgMetric } from '@wayglass/elements/metric';
import { defineWgMetricGroup } from '@wayglass/elements/metric-group';
import { defineWgOfflineState } from '@wayglass/elements/offline-state';
import { defineWgPanel } from '@wayglass/elements/panel';
import { defineWgProgress } from '@wayglass/elements/progress';
import { defineWgScrollRegion } from '@wayglass/elements/scroll-region';
import { defineWgStatusEntry } from '@wayglass/elements/status-entry';
import { defineWgStatusList } from '@wayglass/elements/status-list';
import { defineWgTabs, type WgTabChangeDetail, type WgTabs } from '@wayglass/elements/tabs';
import { defineWgTelemetryStrip, type TelemetrySample } from '@wayglass/elements/telemetry-strip';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { defineWgTimeline } from '@wayglass/elements/timeline';
import { defineWgTimelineItem } from '@wayglass/elements/timeline-item';
import { defineWgTrendIndicator } from '@wayglass/elements/trend-indicator';
import { html, nothing, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import {
  createOperationalActivityState,
  operationalActivityFunctions,
  reduceOperationalActivity,
  selectDeliveryRecords,
  selectFunctionSummaries,
  selectIntakeEvents,
  type DeliveryFilter,
  type OperationalActivityAction,
  type OperationalActivityState,
  type OperationalFunction,
  type OperationalScenario,
} from '../../../examples/shared/operational-activity-model.js';
import './operational-activity.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgElbow();
defineWgPanel();
defineWgButton();
defineWgProgress();
defineWgEmptyState();
defineWgOfflineState();
defineWgMetric();
defineWgMetricGroup();
defineWgKeyValue();
defineWgTrendIndicator();
defineWgTelemetryStrip();
defineWgStatusList();
defineWgStatusEntry();
defineWgTimeline();
defineWgTimelineItem();
defineWgEventLog();
defineWgEventRecord();
defineWgFilterBar();
defineWgCommandBar();
defineWgScrollRegion();
defineWgDataTable();
defineWgTabs();

export type OperationalActivityComposition = 'overview' | 'focused';
export type OperationalActivityWidth = 'phone' | 'desktop' | 'wall';
export type OperationalActivityTheme = 'wayglass-dark' | 'wayglass-light';
export type OperationalActivityDensity = 'compact' | 'comfortable';

export interface OperationalActivityOptions {
  readonly composition: OperationalActivityComposition;
  readonly width: OperationalActivityWidth;
  readonly theme: OperationalActivityTheme;
  readonly density: OperationalActivityDensity;
  readonly scenario: OperationalScenario;
  readonly selectedFunction?: OperationalFunction;
}

type Dispatch = (action: OperationalActivityAction) => void;

const telemetryWindowStart = Date.parse('2026-08-11T09:00:00-07:00');
const telemetryWindowEnd = Date.parse('2026-08-11T09:25:00-07:00');

function displayState(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function displayTime(value: string): string {
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

function renderFunctionHeading(value: OperationalFunction, focused: boolean) {
  const definition = operationalActivityFunctions.find((item) => item.value === value)!;
  const heading = html`<h2 id=${`operational-${value}-heading`}>${definition.label}</h2>`;
  return focused ? heading : html`<wg-elbow weight="strong">${heading}</wg-elbow>`;
}

function renderFunctionFeedback(state: OperationalActivityState, value: OperationalFunction) {
  const presentation = state.presentation[value];
  if (presentation.dataState === 'loading') {
    return html`
      <wg-progress class="wg-operational-feedback">
        <label for=${`operational-${value}-progress`}>${presentation.feedback}</label>
        <progress
          id=${`operational-${value}-progress`}
          aria-label=${presentation.feedback}
        ></progress>
        <output>${presentation.feedback}</output>
      </wg-progress>
    `;
  }
  if (presentation.dataState === 'unavailable') {
    return html`
      <wg-offline-state
        class="wg-operational-feedback"
        label=${`${displayState(value)} data unavailable`}
      >
        <h3 slot="heading">${displayState(value)} data unavailable</h3>
        <p>${presentation.feedback}</p>
        <time slot="last-known" datetime="2026-08-11T09:20:00-07:00">Last confirmed at 09:20</time>
      </wg-offline-state>
    `;
  }
  return html`
    <p
      class=${`wg-operational-feedback wg-operational-feedback--${presentation.dataState}`}
      aria-busy=${presentation.busy ? 'true' : 'false'}
    >
      <strong>${displayState(presentation.dataState)}.</strong> ${presentation.feedback}
    </p>
  `;
}

function renderIntake(state: OperationalActivityState, dispatch: Dispatch) {
  const presentation = state.presentation.intake;
  const visibleEvents = selectIntakeEvents(state);
  const samples: readonly TelemetrySample[] = state.intake.telemetry.map((sample) => ({
    observedAt: Date.parse(sample.timestamp),
    value: sample.value ?? null,
    knowledge: sample.knowledge,
  }));

  function submitFilters(event: SubmitEvent): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    dispatch({
      type: 'edit-intake-filter',
      value: {
        query: String(data.get('query') ?? ''),
        category: String(data.get('category') ?? 'all') as
          'all' | 'arrival' | 'validation' | 'routing',
      },
    });
    dispatch({ type: 'apply-intake-filter' });
  }

  return html`
    ${renderFunctionFeedback(state, 'intake')}
    ${
      presentation.retainedData
        ? html`
            <div class="wg-operational-summary-grid">
              <wg-metric
                label="Current Intake throughput"
                value=${state.intake.throughput === null ? '' : String(state.intake.throughput)}
                unit="records/min"
                condition="caution"
                knowledge="stale"
              ></wg-metric>
              <wg-telemetry-strip
                label="Intake queue depth"
                condition="caution"
                knowledge="stale"
                .samples=${samples}
                .windowStart=${telemetryWindowStart}
                .windowEnd=${telemetryWindowEnd}
                .scaleMinimum=${0}
                .scaleMaximum=${80}
              >
                <h3 slot="heading">Queue depth</h3>
                <p slot="current">Last known observation: 49 records</p>
                <time slot="window-start" datetime="2026-08-11T09:00:00-07:00">09:00</time>
                <time slot="window-end" datetime="2026-08-11T09:25:00-07:00">09:25</time>
                <p slot="summary">
                  Queue depth rose from 42 to 51 records, includes one deliberate gap, and the
                  latest retained sample is stale.
                </p>
              </wg-telemetry-strip>
            </div>

            <wg-status-list
              label="Intake sources"
              ?busy=${presentation.busy}
              class="wg-operational-collection"
            >
              <h3 slot="heading">Intake sources</h3>
              <p slot="description">Source condition and knowledge remain independent.</p>
              ${repeat(
                state.intake.sources,
                (source) => source.key,
                (source) => html`
                  <wg-status-entry
                    data-record-key=${source.key}
                    label=${source.label}
                    condition=${source.state.condition}
                    knowledge=${source.state.knowledge}
                    activity=${source.state.activity}
                  >
                    <h4 slot="heading">${source.label}</h4>
                    <p slot="description">${source.detail}</p>
                  </wg-status-entry>
                `,
              )}
            </wg-status-list>

            <div class="wg-operational-tools">
              <wg-filter-bar label="Intake event filters">
                <h3 slot="heading">Intake event filters</h3>
                <p slot="description">Narrow retained events without changing source truth.</p>
                <form @submit=${submitFilters}>
                  <label for="operational-intake-query">Event text</label>
                  <input
                    id="operational-intake-query"
                    name="query"
                    value=${state.intake.filter.draft.query}
                  />
                  <label for="operational-intake-category">Category</label>
                  <select id="operational-intake-category" name="category">
                    ${['all', 'arrival', 'validation', 'routing'].map(
                      (category) => html`
                        <option
                          value=${category}
                          ?selected=${state.intake.filter.draft.category === category}
                        >
                          ${displayState(category)}
                        </option>
                      `,
                    )}
                  </select>
                  <div class="wg-operational-form-actions">
                    <button type="submit">Apply Intake event filters</button>
                    <button type="button" @click=${() => dispatch({ type: 'reset-intake-filter' })}>
                      Clear Intake filters
                    </button>
                  </div>
                </form>
                <p slot="summary">${visibleEvents.length} Intake events shown.</p>
              </wg-filter-bar>
            </div>

            <wg-event-log
              label="Filtered Intake events"
              chronology="descending"
              chronology-label="Newest occurrence to oldest"
              class="wg-operational-collection"
            >
              <h3 slot="heading">Intake events</h3>
              <p slot="description">
                Repeated messages retain distinct application record identity.
              </p>
              ${
                visibleEvents.length === 0
                  ? html`
                      <wg-empty-state
                        slot="status"
                        label="No Intake events match the applied filters"
                      >
                        <h4 slot="heading">No Intake events match the applied filters</h4>
                        <p>Clear the filters to restore the retained events.</p>
                      </wg-empty-state>
                    `
                  : nothing
              }
              ${repeat(
                visibleEvents,
                (event) => event.key,
                (event) => html`
                  <wg-event-record
                    data-record-key=${event.key}
                    label=${event.message}
                    condition=${event.state.condition}
                    knowledge=${event.state.knowledge}
                    activity=${event.state.activity}
                  >
                    <time slot="time" datetime=${event.timestamp}
                      >${displayTime(event.timestamp)}</time
                    >
                    <span slot="summary">${event.message}</span>
                    <span slot="source">Source: ${event.source}</span>
                    <span slot="category">Category: ${displayState(event.category)}</span>
                  </wg-event-record>
                `,
              )}
            </wg-event-log>
          `
        : nothing
    }
  `;
}

function renderProcessing(state: OperationalActivityState, dispatch: Dispatch) {
  const presentation = state.presentation.processing;
  return html`
    ${renderFunctionFeedback(state, 'processing')}
    ${
      presentation.retainedData
        ? html`
            <wg-metric-group label="Processing interval" ?busy=${presentation.busy}>
              <h3 slot="heading">Processing interval</h3>
              ${state.processing.metrics.map(
                (metric) => html`
                  <wg-metric
                    label=${metric.label}
                    value=${metric.value}
                    unit=${metric.unit ?? ''}
                    condition=${metric.state.condition}
                    knowledge=${metric.state.knowledge}
                    activity=${metric.state.activity}
                  >
                    <wg-trend-indicator
                      slot="trend"
                      direction=${metric.trend}
                      label=${metric.comparison}
                      condition=${metric.state.condition}
                      knowledge=${metric.state.knowledge}
                      activity=${metric.state.activity}
                    ></wg-trend-indicator>
                  </wg-metric>
                `,
              )}
            </wg-metric-group>

            <wg-timeline
              label="Processing milestones"
              chronology="ascending"
              chronology-label="Oldest to newest"
              ?busy=${presentation.busy}
              class="wg-operational-collection"
            >
              <h3 slot="heading">Processing milestones</h3>
              <p slot="description">Curated milestones explain the current processing state.</p>
              ${repeat(
                state.processing.timeline,
                (item) => item.key,
                (item) => html`
                  <wg-timeline-item
                    data-record-key=${item.key}
                    label=${item.title}
                    kind=${item.kind === 'interval' ? 'interval' : 'milestone'}
                    chronology=${item.chronology}
                    condition=${item.state.condition}
                    knowledge=${item.state.knowledge}
                    activity=${item.state.activity}
                  >
                    <time slot="time" datetime=${item.timestamp}
                      >${displayTime(item.timestamp)}</time
                    >
                    <span slot="heading">${item.title}</span>
                    <p>${item.detail}</p>
                  </wg-timeline-item>
                `,
              )}
            </wg-timeline>

            <wg-command-bar label="Processing intake commands">
              <h3 slot="heading">Processing intake commands</h3>
              <p slot="description">Request state never replaces the confirmed gate value.</p>
              <wg-button
                appearance="primary"
                ?pending=${state.processing.request.state === 'pending'}
                @click=${() => dispatch({ type: 'request-processing-pause' })}
              >
                Request Processing intake pause
              </wg-button>
              <wg-button
                slot="secondary"
                appearance="secondary"
                @click=${() => dispatch({ type: 'resolve-processing-pause', outcome: 'accepted' })}
              >
                Confirm Processing pause result
              </wg-button>
              <p slot="status" data-processing-request-status>
                ${state.processing.request.message}
              </p>
            </wg-command-bar>
          `
        : nothing
    }
  `;
}

function renderDelivery(state: OperationalActivityState, dispatch: Dispatch) {
  const presentation = state.presentation.delivery;
  const records = selectDeliveryRecords(state);

  function submitFilters(event: SubmitEvent): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const filter: DeliveryFilter = {
      query: String(data.get('query') ?? ''),
      condition: String(data.get('condition') ?? 'all') as DeliveryFilter['condition'],
    };
    dispatch({ type: 'edit-delivery-filter', value: filter });
    dispatch({ type: 'apply-delivery-filter' });
  }

  return html`
    ${renderFunctionFeedback(state, 'delivery')}
    ${
      presentation.retainedData
        ? html`
            <wg-metric-group label="Delivery context" ?busy=${presentation.busy}>
              <h3 slot="heading">Delivery context</h3>
              ${state.delivery.details.map(
                (detail) => html`
                  <wg-key-value
                    label=${detail.label}
                    value=${detail.value ?? ''}
                    condition=${detail.state.condition}
                    knowledge=${detail.state.knowledge}
                    activity=${detail.state.activity}
                  ></wg-key-value>
                `,
              )}
            </wg-metric-group>

            <wg-status-list
              label="Delivery destinations"
              ?busy=${presentation.busy}
              class="wg-operational-collection"
            >
              <h3 slot="heading">Delivery destinations</h3>
              <p slot="description">Destination status remains in application-authored order.</p>
              ${repeat(
                state.delivery.statuses,
                (status) => status.key,
                (status) => html`
                  <wg-status-entry
                    data-record-key=${status.key}
                    label=${status.label}
                    condition=${status.state.condition}
                    knowledge=${status.state.knowledge}
                    activity=${status.state.activity}
                  >
                    <h4 slot="heading">${status.label}</h4>
                    <p slot="description">${status.detail}</p>
                    <time slot="time" datetime=${status.updatedAt}
                      >${displayTime(status.updatedAt)}</time
                    >
                    <wg-button slot="actions" appearance="secondary">
                      Inspect ${status.label}
                    </wg-button>
                  </wg-status-entry>
                `,
              )}
            </wg-status-list>

            <div class="wg-operational-tools">
              <wg-filter-bar label="Delivery record filters">
                <h3 slot="heading">Delivery record filters</h3>
                <p slot="description">Narrow the retained table without changing record truth.</p>
                <form @submit=${submitFilters}>
                  <label for="operational-delivery-query">Record text</label>
                  <input
                    id="operational-delivery-query"
                    name="query"
                    value=${state.delivery.filter.draft.query}
                  />
                  <label for="operational-delivery-condition">Condition</label>
                  <select id="operational-delivery-condition" name="condition">
                    ${['all', 'neutral', 'positive', 'caution', 'critical'].map(
                      (condition) => html`
                        <option
                          value=${condition}
                          ?selected=${state.delivery.filter.draft.condition === condition}
                        >
                          ${displayState(condition)}
                        </option>
                      `,
                    )}
                  </select>
                  <div class="wg-operational-form-actions">
                    <button type="submit">Apply Delivery filters</button>
                    <button
                      type="button"
                      @click=${() => dispatch({ type: 'reset-delivery-filter' })}
                    >
                      Clear Delivery filters
                    </button>
                  </div>
                </form>
                <p slot="summary">${records.length} Delivery records shown.</p>
              </wg-filter-bar>

              <wg-command-bar label="Delivery record commands">
                <h3 slot="heading">Delivery record commands</h3>
                <p slot="description">Commands remain scoped to Delivery records.</p>
                <wg-button appearance="primary">Review selected Delivery records</wg-button>
                <wg-button slot="secondary" appearance="secondary">
                  Export visible Delivery records
                </wg-button>
                <p slot="status">No Delivery command is pending.</p>
              </wg-command-bar>
            </div>

            <wg-data-table class="wg-operational-table">
              <p slot="context">${records.length} records in the applied Delivery result.</p>
              <wg-scroll-region axis="inline" label="Delivery records table">
                <table>
                  <caption>
                    Delivery records
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Record</th>
                      <th scope="col">Destination</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Condition</th>
                      <th scope="col">Knowledge</th>
                      <th scope="col">Activity</th>
                      <th
                        scope="col"
                        aria-sort=${state.delivery.sort === 'updated-descending' ? 'descending' : 'ascending'}
                      >
                        <button
                          type="button"
                          @click=${() =>
                            dispatch({
                              type: 'sort-delivery',
                              value:
                                state.delivery.sort === 'updated-descending'
                                  ? 'updated-ascending'
                                  : 'updated-descending',
                            })}
                        >
                          Updated,
                          ${state.delivery.sort === 'updated-descending' ? 'newest' : 'oldest'}
                          first
                        </button>
                      </th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${repeat(
                      records,
                      (record) => record.key,
                      (record) => html`
                        <tr data-record-key=${record.key}>
                          <th scope="row">${record.reference}</th>
                          <td>${record.destination}</td>
                          <td>${record.owner}</td>
                          <td>${displayState(record.state.condition)}</td>
                          <td>${displayState(record.state.knowledge)}</td>
                          <td>${displayState(record.state.activity)}</td>
                          <td>
                            <time datetime=${record.updatedAt}
                              >${displayTime(record.updatedAt)}</time
                            >
                          </td>
                          <td>
                            <wg-button appearance="secondary"
                              >Inspect ${record.reference}</wg-button
                            >
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              </wg-scroll-region>
              ${
                records.length === 0
                  ? html`
                      <wg-empty-state
                        slot="feedback"
                        label="No Delivery records match the applied filters"
                      >
                        <h3 slot="heading">No Delivery records match the applied filters</h3>
                        <p>Clear the Delivery filters to restore the retained table rows.</p>
                      </wg-empty-state>
                    `
                  : html`<p slot="feedback">${presentation.feedback}</p>`
              }
            </wg-data-table>
          `
        : nothing
    }
  `;
}

function renderFunction(
  value: OperationalFunction,
  state: OperationalActivityState,
  dispatch: Dispatch,
  focused: boolean,
) {
  return html`
    <section
      class="wg-operational-function"
      data-function=${value}
      aria-labelledby=${`operational-${value}-heading`}
    >
      ${renderFunctionHeading(value, focused)}
      <div class="wg-operational-function__body">
        ${
          value === 'intake'
            ? renderIntake(state, dispatch)
            : value === 'processing'
              ? renderProcessing(state, dispatch)
              : renderDelivery(state, dispatch)
        }
      </div>
    </section>
  `;
}

function renderOverview(state: OperationalActivityState, dispatch: Dispatch) {
  return html`
    <main class="wg-operational-overview" aria-label="Operational Activity overview">
      ${operationalActivityFunctions.map(({ value }) => renderFunction(value, state, dispatch, false))}
    </main>
  `;
}

function renderFocused(state: OperationalActivityState, dispatch: Dispatch, root: HTMLElement) {
  const summaries = selectFunctionSummaries(state);
  const response = summaries.find(({ consequential }) => consequential);

  function handleChange(event: CustomEvent<WgTabChangeDetail>): void {
    dispatch({ type: 'select-function', value: event.detail.value as OperationalFunction });
  }

  function openResponse(): void {
    if (!response) return;
    dispatch({ type: 'select-function', value: response.value });
    queueMicrotask(() => root.querySelector<WgTabs>('wg-tabs')?.focusSelected());
  }

  return html`
    <main class="wg-operational-focused" aria-label="Focused Operational Activity functions">
      ${
        response
          ? html`
              <aside aria-labelledby="operational-response-heading">
                <wg-panel purpose="control" emphasis="strong">
                  <h2 id="operational-response-heading" slot="heading">
                    Consequential state · ${response.label}
                  </h2>
                  <p><strong>${response.summary}</strong></p>
                  <wg-button slot="actions" appearance="secondary" @click=${openResponse}>
                    ${response.responseLabel ?? `Open ${response.label}`}
                  </wg-button>
                </wg-panel>
              </aside>
            `
          : nothing
      }
      <wg-tabs
        value=${state.selectedFunction}
        activation="automatic"
        @wg-tab-change=${handleChange}
      >
        <wg-tab-list aria-label="Operational Activity functions">
          ${summaries.map(
            (summary) => html`
              <wg-tab value=${summary.value}>
                ${summary.label}
                <span slot="summary">${summary.summary}</span>
              </wg-tab>
            `,
          )}
        </wg-tab-list>
        ${operationalActivityFunctions.map(
          ({ value }) => html`
            <wg-tab-panel value=${value}>
              <div class="wg-operational-focused__surface">
                ${renderFunction(value, state, dispatch, true)}
              </div>
            </wg-tab-panel>
          `,
        )}
      </wg-tabs>
    </main>
  `;
}

function renderWorkspace(
  root: HTMLElement,
  state: OperationalActivityState,
  options: OperationalActivityOptions,
  dispatch: Dispatch,
) {
  return html`
    <div
      class=${`wg-operational-viewport wg-operational-viewport--${options.width}`}
      data-operational-composition=${options.composition}
      data-operational-scenario=${state.scenario}
      data-operational-width=${options.width}
    >
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-operational-header">
            <p>Phase 3 · Integrated operational awareness</p>
            <h1>Operational Activity</h1>
            <p>
              Intake, Processing, and Delivery share one application-owned state while every
              component retains its accepted semantic and interaction boundary.
            </p>
          </header>
          ${
            options.composition === 'overview'
              ? renderOverview(state, dispatch)
              : renderFocused(state, dispatch, root)
          }
          <p
            class="wg-operational-announcement"
            data-announcement-owner
            aria-live="polite"
            aria-atomic="true"
          >
            ${state.announcement?.message ?? ''}
          </p>
          <footer slot="footer" class="wg-operational-footer">
            <span>Scenario: ${displayState(state.scenario.replaceAll('-', ' '))}</span>
            <span
              >Composition: ${displayState(options.composition)} ·
              ${displayState(options.width)}</span
            >
          </footer>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export function mountOperationalActivity(
  partial: Partial<OperationalActivityOptions> = {},
): HTMLElement {
  const options: OperationalActivityOptions = {
    composition: partial.composition ?? 'overview',
    width: partial.width ?? 'desktop',
    theme: partial.theme ?? 'wayglass-dark',
    density: partial.density ?? 'compact',
    scenario: partial.scenario ?? 'steady',
    ...(partial.selectedFunction ? { selectedFunction: partial.selectedFunction } : {}),
  };
  const root = document.createElement('div');
  root.dataset.operationalActivityRoot = '';
  let state = createOperationalActivityState(options.scenario);
  if (options.selectedFunction) {
    state = reduceOperationalActivity(state, {
      type: 'select-function',
      value: options.selectedFunction,
    });
  }

  const dispatch: Dispatch = (action) => {
    state = reduceOperationalActivity(state, action);
    render(renderWorkspace(root, state, options, dispatch), root);
  };
  render(renderWorkspace(root, state, options, dispatch), root);
  return root;
}
