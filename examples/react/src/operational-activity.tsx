import type { WgTabs as WgTabsElement } from '@wayglass/elements/tabs';
import type { TelemetrySample } from '@wayglass/elements/telemetry-strip';
import {
  WgButton,
  WgCanvas,
  WgCommandBar,
  WgDataTable,
  WgElbow,
  WgEmptyState,
  WgEventLog,
  WgEventRecord,
  WgFilterBar,
  WgKeyValue,
  WgMetric,
  WgMetricGroup,
  WgOfflineState,
  WgPanel,
  WgProgress,
  WgScrollRegion,
  WgStatusEntry,
  WgStatusList,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgTelemetryStrip,
  WgThemeProvider,
  WgTimeline,
  WgTimelineItem,
  WgTrendIndicator,
} from '@wayglass/react';
import { useReducer, useRef, type FormEvent, type ReactNode } from 'react';

import {
  createOperationalActivityState,
  operationalActivityFunctions,
  operationalActivityScenarios,
  reduceOperationalActivity,
  selectDeliveryRecords,
  selectFunctionSummaries,
  selectIntakeEvents,
  type OperationalActivityAction,
  type OperationalActivityState,
  type OperationalFunction,
  type OperationalScenario,
} from '../../shared/operational-activity-model.js';

type Composition = 'overview' | 'focused';
type Width = 'phone' | 'desktop' | 'wall';
type Theme = 'wayglass-dark' | 'wayglass-light';
type Density = 'compact' | 'comfortable';
type Dispatch = (action: OperationalActivityAction) => void;

const telemetryWindowStart = Date.parse('2026-08-11T09:00:00-07:00');
const telemetryWindowEnd = Date.parse('2026-08-11T09:25:00-07:00');

function acceptedValue<T extends string>(
  value: string | null,
  accepted: readonly T[],
  fallback: T,
): T {
  return value !== null && accepted.includes(value as T) ? (value as T) : fallback;
}

function readOptions(): {
  composition: Composition;
  width: Width;
  theme: Theme;
  density: Density;
  scenario: OperationalScenario;
  selectedFunction: OperationalFunction;
} {
  const parameters = new URLSearchParams(window.location.search);
  return {
    composition: acceptedValue(parameters.get('composition'), ['overview', 'focused'], 'overview'),
    width: acceptedValue(parameters.get('width'), ['phone', 'desktop', 'wall'], 'desktop'),
    theme: acceptedValue(
      parameters.get('theme'),
      ['wayglass-dark', 'wayglass-light'],
      'wayglass-dark',
    ),
    density: acceptedValue(parameters.get('density'), ['compact', 'comfortable'], 'compact'),
    scenario: acceptedValue(parameters.get('scenario'), operationalActivityScenarios, 'steady'),
    selectedFunction: acceptedValue(
      parameters.get('selected'),
      operationalActivityFunctions.map(({ value }) => value),
      'intake',
    ),
  };
}

function displayState(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function displayTime(value: string): string {
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

function FunctionHeading({ value, focused }: { value: OperationalFunction; focused: boolean }) {
  const definition = operationalActivityFunctions.find((item) => item.value === value)!;
  const heading = <h2 id={`operational-${value}-heading`}>{definition.label}</h2>;
  return focused ? heading : <WgElbow weight="strong">{heading}</WgElbow>;
}

function FunctionFeedback({
  state,
  value,
}: {
  state: OperationalActivityState;
  value: OperationalFunction;
}) {
  const presentation = state.presentation[value];
  if (presentation.dataState === 'loading') {
    return (
      <WgProgress className="wg-operational-feedback">
        <label htmlFor={`operational-${value}-progress`}>{presentation.feedback}</label>
        <progress id={`operational-${value}-progress`} aria-label={presentation.feedback} />
        <output>{presentation.feedback}</output>
      </WgProgress>
    );
  }
  if (presentation.dataState === 'unavailable') {
    return (
      <WgOfflineState
        className="wg-operational-feedback"
        label={`${displayState(value)} data unavailable`}
      >
        <h3 slot="heading">{displayState(value)} data unavailable</h3>
        <p>{presentation.feedback}</p>
        <time slot="last-known" dateTime="2026-08-11T09:20:00-07:00">
          Last confirmed at 09:20
        </time>
      </WgOfflineState>
    );
  }
  return (
    <p
      className={`wg-operational-feedback wg-operational-feedback--${presentation.dataState}`}
      aria-busy={presentation.busy}
    >
      <strong>{displayState(presentation.dataState)}.</strong> {presentation.feedback}
    </p>
  );
}

function Intake({ state, dispatch }: { state: OperationalActivityState; dispatch: Dispatch }) {
  const presentation = state.presentation.intake;
  const events = selectIntakeEvents(state);
  const samples: readonly TelemetrySample[] = state.intake.telemetry.map((sample) => ({
    observedAt: Date.parse(sample.timestamp),
    value: sample.value ?? null,
    knowledge: sample.knowledge,
  }));

  return (
    <>
      <FunctionFeedback state={state} value="intake" />
      {presentation.retainedData ? (
        <>
          <div className="wg-operational-summary-grid">
            <WgMetric
              label="Current Intake throughput"
              value={state.intake.throughput === null ? '' : String(state.intake.throughput)}
              unit="records/min"
              condition="caution"
              knowledge="stale"
            />
            <WgTelemetryStrip
              label="Intake queue depth"
              condition="caution"
              knowledge="stale"
              samples={samples}
              windowStart={telemetryWindowStart}
              windowEnd={telemetryWindowEnd}
              scaleMinimum={0}
              scaleMaximum={80}
            >
              <h3 slot="heading">Queue depth</h3>
              <p slot="current">Last known observation: 49 records</p>
              <time slot="window-start" dateTime="2026-08-11T09:00:00-07:00">
                09:00
              </time>
              <time slot="window-end" dateTime="2026-08-11T09:25:00-07:00">
                09:25
              </time>
              <p slot="summary">
                Queue depth rose from 42 to 51 records, includes one deliberate gap, and the latest
                retained sample is stale.
              </p>
            </WgTelemetryStrip>
          </div>

          <WgStatusList
            label="Intake sources"
            busy={presentation.busy}
            className="wg-operational-collection"
          >
            <h3 slot="heading">Intake sources</h3>
            <p slot="description">Source condition and knowledge remain independent.</p>
            {state.intake.sources.map((source) => (
              <WgStatusEntry
                key={source.key}
                data-record-key={source.key}
                label={source.label}
                condition={source.state.condition}
                knowledge={source.state.knowledge}
                activity={source.state.activity}
              >
                <h4 slot="heading">{source.label}</h4>
                <p slot="description">{source.detail}</p>
              </WgStatusEntry>
            ))}
          </WgStatusList>

          <div className="wg-operational-tools">
            <WgFilterBar label="Intake event filters">
              <h3 slot="heading">Intake event filters</h3>
              <p slot="description">Narrow retained events without changing source truth.</p>
              <form
                onSubmit={(event: FormEvent) => {
                  event.preventDefault();
                  dispatch({ type: 'apply-intake-filter' });
                }}
              >
                <label htmlFor="operational-intake-query">Event text</label>
                <input
                  id="operational-intake-query"
                  name="query"
                  value={state.intake.filter.draft.query}
                  onChange={(event) =>
                    dispatch({
                      type: 'edit-intake-filter',
                      value: {
                        ...state.intake.filter.draft,
                        query: event.currentTarget.value,
                      },
                    })
                  }
                />
                <label htmlFor="operational-intake-category">Category</label>
                <select
                  id="operational-intake-category"
                  name="category"
                  value={state.intake.filter.draft.category}
                  onChange={(event) =>
                    dispatch({
                      type: 'edit-intake-filter',
                      value: {
                        ...state.intake.filter.draft,
                        category: event.currentTarget.value as
                          'all' | 'arrival' | 'validation' | 'routing',
                      },
                    })
                  }
                >
                  {['all', 'arrival', 'validation', 'routing'].map((category) => (
                    <option key={category} value={category}>
                      {displayState(category)}
                    </option>
                  ))}
                </select>
                <div className="wg-operational-form-actions">
                  <button type="submit">Apply Intake event filters</button>
                  <button type="button" onClick={() => dispatch({ type: 'reset-intake-filter' })}>
                    Clear Intake filters
                  </button>
                </div>
              </form>
              <p slot="summary">{events.length} Intake events shown.</p>
            </WgFilterBar>
          </div>

          <WgEventLog
            label="Filtered Intake events"
            chronology="descending"
            chronologyLabel="Newest occurrence to oldest"
            className="wg-operational-collection"
          >
            <h3 slot="heading">Intake events</h3>
            <p slot="description">Repeated messages retain distinct application record identity.</p>
            {events.length === 0 ? (
              <WgEmptyState slot="status" label="No Intake events match the applied filters">
                <h4 slot="heading">No Intake events match the applied filters</h4>
                <p>Clear the filters to restore the retained events.</p>
              </WgEmptyState>
            ) : null}
            {events.map((event) => (
              <WgEventRecord
                key={event.key}
                data-record-key={event.key}
                label={event.message}
                condition={event.state.condition}
                knowledge={event.state.knowledge}
                activity={event.state.activity}
              >
                <time slot="time" dateTime={event.timestamp}>
                  {displayTime(event.timestamp)}
                </time>
                <span slot="summary">{event.message}</span>
                <span slot="source">Source: {event.source}</span>
                <span slot="category">Category: {displayState(event.category)}</span>
              </WgEventRecord>
            ))}
          </WgEventLog>
        </>
      ) : null}
    </>
  );
}

function Processing({ state, dispatch }: { state: OperationalActivityState; dispatch: Dispatch }) {
  const presentation = state.presentation.processing;
  return (
    <>
      <FunctionFeedback state={state} value="processing" />
      {presentation.retainedData ? (
        <>
          <WgMetricGroup label="Processing interval" busy={presentation.busy}>
            <h3 slot="heading">Processing interval</h3>
            {state.processing.metrics.map((metric) => (
              <WgMetric
                key={metric.key}
                label={metric.label}
                value={metric.value}
                unit={metric.unit ?? ''}
                condition={metric.state.condition}
                knowledge={metric.state.knowledge}
                activity={metric.state.activity}
              >
                <WgTrendIndicator
                  slot="trend"
                  direction={metric.trend}
                  label={metric.comparison}
                  condition={metric.state.condition}
                  knowledge={metric.state.knowledge}
                  activity={metric.state.activity}
                />
              </WgMetric>
            ))}
          </WgMetricGroup>

          <WgTimeline
            label="Processing milestones"
            chronology="ascending"
            chronologyLabel="Oldest to newest"
            busy={presentation.busy}
            className="wg-operational-collection"
          >
            <h3 slot="heading">Processing milestones</h3>
            <p slot="description">Curated milestones explain the current processing state.</p>
            {state.processing.timeline.map((item) => (
              <WgTimelineItem
                key={item.key}
                data-record-key={item.key}
                label={item.title}
                kind={item.kind === 'interval' ? 'interval' : 'milestone'}
                condition={item.state.condition}
                knowledge={item.state.knowledge}
                activity={item.state.activity}
              >
                <time slot="time" dateTime={item.timestamp}>
                  {displayTime(item.timestamp)}
                </time>
                <span slot="heading">{item.title}</span>
                <p>{item.detail}</p>
              </WgTimelineItem>
            ))}
          </WgTimeline>

          <WgCommandBar label="Processing intake commands">
            <h3 slot="heading">Processing intake commands</h3>
            <p slot="description">Request state never replaces the confirmed gate value.</p>
            <WgButton
              appearance="primary"
              pending={state.processing.request.state === 'pending'}
              onClick={() => dispatch({ type: 'request-processing-pause' })}
            >
              Request Processing intake pause
            </WgButton>
            <WgButton
              slot="secondary"
              appearance="secondary"
              onClick={() => dispatch({ type: 'resolve-processing-pause', outcome: 'accepted' })}
            >
              Confirm Processing pause result
            </WgButton>
            <p slot="status" data-processing-request-status>
              {state.processing.request.message}
            </p>
          </WgCommandBar>
        </>
      ) : null}
    </>
  );
}

function Delivery({ state, dispatch }: { state: OperationalActivityState; dispatch: Dispatch }) {
  const presentation = state.presentation.delivery;
  const records = selectDeliveryRecords(state);
  return (
    <>
      <FunctionFeedback state={state} value="delivery" />
      {presentation.retainedData ? (
        <>
          <WgMetricGroup label="Delivery context" busy={presentation.busy}>
            <h3 slot="heading">Delivery context</h3>
            {state.delivery.details.map((detail) => (
              <WgKeyValue
                key={detail.key}
                label={detail.label}
                value={detail.value ?? ''}
                condition={detail.state.condition}
                knowledge={detail.state.knowledge}
                activity={detail.state.activity}
              />
            ))}
          </WgMetricGroup>

          <WgStatusList
            label="Delivery destinations"
            busy={presentation.busy}
            className="wg-operational-collection"
          >
            <h3 slot="heading">Delivery destinations</h3>
            <p slot="description">Destination status remains in application-authored order.</p>
            {state.delivery.statuses.map((status) => (
              <WgStatusEntry
                key={status.key}
                data-record-key={status.key}
                label={status.label}
                condition={status.state.condition}
                knowledge={status.state.knowledge}
                activity={status.state.activity}
              >
                <h4 slot="heading">{status.label}</h4>
                <p slot="description">{status.detail}</p>
                <time slot="time" dateTime={status.updatedAt}>
                  {displayTime(status.updatedAt)}
                </time>
                <WgButton slot="actions" appearance="secondary">
                  Inspect {status.label}
                </WgButton>
              </WgStatusEntry>
            ))}
          </WgStatusList>

          <div className="wg-operational-tools">
            <WgFilterBar label="Delivery record filters">
              <h3 slot="heading">Delivery record filters</h3>
              <p slot="description">Narrow the retained table without changing record truth.</p>
              <form
                onSubmit={(event: FormEvent) => {
                  event.preventDefault();
                  dispatch({ type: 'apply-delivery-filter' });
                }}
              >
                <label htmlFor="operational-delivery-query">Record text</label>
                <input
                  id="operational-delivery-query"
                  name="query"
                  value={state.delivery.filter.draft.query}
                  onChange={(event) =>
                    dispatch({
                      type: 'edit-delivery-filter',
                      value: {
                        ...state.delivery.filter.draft,
                        query: event.currentTarget.value,
                      },
                    })
                  }
                />
                <label htmlFor="operational-delivery-condition">Condition</label>
                <select
                  id="operational-delivery-condition"
                  name="condition"
                  value={state.delivery.filter.draft.condition}
                  onChange={(event) =>
                    dispatch({
                      type: 'edit-delivery-filter',
                      value: {
                        ...state.delivery.filter.draft,
                        condition: event.currentTarget.value as
                          'all' | 'neutral' | 'informational' | 'positive' | 'caution' | 'critical',
                      },
                    })
                  }
                >
                  {['all', 'neutral', 'positive', 'caution', 'critical'].map((condition) => (
                    <option key={condition} value={condition}>
                      {displayState(condition)}
                    </option>
                  ))}
                </select>
                <div className="wg-operational-form-actions">
                  <button type="submit">Apply Delivery filters</button>
                  <button type="button" onClick={() => dispatch({ type: 'reset-delivery-filter' })}>
                    Clear Delivery filters
                  </button>
                </div>
              </form>
              <p slot="summary">{records.length} Delivery records shown.</p>
            </WgFilterBar>

            <WgCommandBar label="Delivery record commands">
              <h3 slot="heading">Delivery record commands</h3>
              <p slot="description">Commands remain scoped to Delivery records.</p>
              <WgButton appearance="primary">Review selected Delivery records</WgButton>
              <WgButton slot="secondary" appearance="secondary">
                Export visible Delivery records
              </WgButton>
              <p slot="status">No Delivery command is pending.</p>
            </WgCommandBar>
          </div>

          <WgDataTable className="wg-operational-table">
            <p slot="context">{records.length} records in the applied Delivery result.</p>
            <WgScrollRegion axis="inline" label="Delivery records table">
              <table>
                <caption>Delivery records</caption>
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
                      aria-sort={
                        state.delivery.sort === 'updated-descending' ? 'descending' : 'ascending'
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'sort-delivery',
                            value:
                              state.delivery.sort === 'updated-descending'
                                ? 'updated-ascending'
                                : 'updated-descending',
                          })
                        }
                      >
                        Updated,{' '}
                        {state.delivery.sort === 'updated-descending' ? 'newest' : 'oldest'} first
                      </button>
                    </th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.key} data-record-key={record.key}>
                      <th scope="row">{record.reference}</th>
                      <td>{record.destination}</td>
                      <td>{record.owner}</td>
                      <td>{displayState(record.state.condition)}</td>
                      <td>{displayState(record.state.knowledge)}</td>
                      <td>{displayState(record.state.activity)}</td>
                      <td>
                        <time dateTime={record.updatedAt}>{displayTime(record.updatedAt)}</time>
                      </td>
                      <td>
                        <WgButton appearance="secondary">Inspect {record.reference}</WgButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </WgScrollRegion>
            {records.length === 0 ? (
              <WgEmptyState slot="feedback" label="No Delivery records match the applied filters">
                <h3 slot="heading">No Delivery records match the applied filters</h3>
                <p>Clear the Delivery filters to restore the retained table rows.</p>
              </WgEmptyState>
            ) : (
              <p slot="feedback">{presentation.feedback}</p>
            )}
          </WgDataTable>
        </>
      ) : null}
    </>
  );
}

function FunctionRegion({
  value,
  state,
  dispatch,
  focused,
}: {
  value: OperationalFunction;
  state: OperationalActivityState;
  dispatch: Dispatch;
  focused: boolean;
}) {
  let contents: ReactNode;
  if (value === 'intake') contents = <Intake state={state} dispatch={dispatch} />;
  else if (value === 'processing') contents = <Processing state={state} dispatch={dispatch} />;
  else contents = <Delivery state={state} dispatch={dispatch} />;

  return (
    <section
      className="wg-operational-function"
      data-function={value}
      aria-labelledby={`operational-${value}-heading`}
    >
      <FunctionHeading value={value} focused={focused} />
      <div className="wg-operational-function__body">{contents}</div>
    </section>
  );
}

function Overview({ state, dispatch }: { state: OperationalActivityState; dispatch: Dispatch }) {
  return (
    <main className="wg-operational-overview" aria-label="Operational Activity overview">
      {operationalActivityFunctions.map(({ value }) => (
        <FunctionRegion
          key={value}
          value={value}
          state={state}
          dispatch={dispatch}
          focused={false}
        />
      ))}
    </main>
  );
}

function Focused({ state, dispatch }: { state: OperationalActivityState; dispatch: Dispatch }) {
  const tabsRef = useRef<WgTabsElement>(null);
  const summaries = selectFunctionSummaries(state);
  const response = summaries.find(({ consequential }) => consequential);

  function openResponse(): void {
    if (!response) return;
    dispatch({ type: 'select-function', value: response.value });
    requestAnimationFrame(() => tabsRef.current?.focusSelected());
  }

  return (
    <main className="wg-operational-focused" aria-label="Focused Operational Activity functions">
      {response ? (
        <aside aria-labelledby="operational-response-heading">
          <WgPanel purpose="control" emphasis="strong">
            <h2 id="operational-response-heading" slot="heading">
              Consequential state · {response.label}
            </h2>
            <p>
              <strong>{response.summary}</strong>
            </p>
            <WgButton slot="actions" appearance="secondary" onClick={openResponse}>
              {response.responseLabel ?? `Open ${response.label}`}
            </WgButton>
          </WgPanel>
        </aside>
      ) : null}
      <WgTabs
        ref={tabsRef}
        value={state.selectedFunction}
        activation="automatic"
        onWgTabChange={(event) =>
          dispatch({ type: 'select-function', value: event.detail.value as OperationalFunction })
        }
      >
        <WgTabList aria-label="Operational Activity functions">
          {summaries.map((summary) => (
            <WgTab key={summary.value} value={summary.value}>
              {summary.label}
              <span slot="summary">{summary.summary}</span>
            </WgTab>
          ))}
        </WgTabList>
        {operationalActivityFunctions.map(({ value }) => (
          <WgTabPanel key={value} value={value}>
            <div className="wg-operational-focused__surface">
              <FunctionRegion value={value} state={state} dispatch={dispatch} focused />
            </div>
          </WgTabPanel>
        ))}
      </WgTabs>
    </main>
  );
}

export function OperationalActivity() {
  const options = readOptions();
  const [state, dispatch] = useReducer(
    reduceOperationalActivity,
    options,
    ({ scenario, selectedFunction }) =>
      reduceOperationalActivity(createOperationalActivityState(scenario), {
        type: 'select-function',
        value: selectedFunction,
      }),
  );

  return (
    <div
      className={`wg-operational-viewport wg-operational-viewport--${options.width}`}
      data-example="react"
      data-operational-composition={options.composition}
      data-operational-scenario={state.scenario}
      data-operational-width={options.width}
    >
      <WgThemeProvider theme={options.theme} density={options.density}>
        <WgCanvas width="full">
          <header slot="header" className="wg-operational-header">
            <p>Typed React wrappers · Phase 3 integration</p>
            <h1>Operational Activity</h1>
            <p>
              Intake, Processing, and Delivery share one application-owned state while every
              component retains its accepted semantic and interaction boundary.
            </p>
          </header>
          {options.composition === 'overview' ? (
            <Overview state={state} dispatch={dispatch} />
          ) : (
            <Focused state={state} dispatch={dispatch} />
          )}
          <p
            className="wg-operational-announcement"
            data-announcement-owner
            aria-live="polite"
            aria-atomic="true"
          >
            {state.announcement?.message ?? ''}
          </p>
          <footer slot="footer" className="wg-operational-footer">
            <span>Scenario: {displayState(state.scenario.replaceAll('-', ' '))}</span>
            <span>
              React · {displayState(options.composition)} · {displayState(options.width)}
            </span>
          </footer>
        </WgCanvas>
      </WgThemeProvider>
    </div>
  );
}
