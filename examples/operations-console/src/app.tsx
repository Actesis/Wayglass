import {
  WgAlert,
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgConfirmationDialog,
  WgDataTable,
  WgElbow,
  WgEventLog,
  WgEventRecord,
  WgFilterBar,
  WgKeyValue,
  WgMetric,
  WgPanel,
  WgScrollRegion,
  WgSelect,
  WgStatusEntry,
  WgStatusIndicator,
  WgStatusList,
  WgTelemetryStrip,
  WgThemeProvider,
  WgTimeline,
  WgTimelineItem,
} from '@wayglass/react';
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
  type ComponentRef,
  type Dispatch,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';

import {
  createNorthlineState,
  northlineFunctions,
  reduceNorthline,
  selectDispatchLoads,
  selectDispatchSummary,
  selectFunctionExceptions,
  selectLoad,
  selectLoadTimeline,
  type DispatchFilter,
  type DispatchLoad,
  type DispatchSort,
  type NorthlineAction,
  type NorthlineFunction,
  type NorthlineState,
} from './model.js';
import type { DispatchHoldPort, NorthlineClock } from './ports.js';
import type { NorthlineRoute, NorthlineRouter } from './router.js';

declare global {
  interface Window {
    __northlineFixture?: { receiveMeaningfulUpdate(): void };
    __northlineValidation?: {
      constructionDuration?: number;
      runMutation?: (mutation: NorthlineMutation) => number;
    };
  }
}

type NorthlineMutation =
  'filter-sort' | 'hold-lifecycle' | 'insert-events' | 'replace-rows' | 'telemetry';

function routeTitle(route: NorthlineRoute): string {
  if (route.name === 'overview') return 'Outbound readiness';
  if (route.name === 'load') return `Load ${route.loadId}`;
  return northlineFunctions.find(({ value }) => value === route.value)?.label ?? route.value;
}

interface DispatchCommands {
  requestHold(): Promise<void>;
  showHoldConfirmation(invoker: HTMLElement): void;
}

export function NorthlineApp({
  router,
  controls,
  clock,
  constructionStartedAt,
}: {
  router: NorthlineRouter;
  controls: DispatchHoldPort;
  clock: NorthlineClock;
  constructionStartedAt: number;
}) {
  const routeState = useSyncExternalStore(router.subscribe, router.current);
  const [state, dispatch] = useReducer(reduceNorthline, routeState, (initial) =>
    createNorthlineState(initial.scenario, initial.fixture),
  );
  const requestSequence = useRef(0);
  const holdConfirmation = useRef<ComponentRef<typeof WgConfirmationDialog>>(null);
  const title = routeTitle(routeState.route);
  const representativeLoad = selectLoad(state, 'NL-2048');

  useEffect(() => {
    document.title = `${title} — Northline Cold Storage`;
  }, [title]);
  useEffect(() => {
    dispatch({ type: 'set-scenario', value: routeState.scenario, fixture: routeState.fixture });
  }, [routeState.fixture, routeState.scenario]);
  useEffect(() => {
    window.__northlineFixture = {
      receiveMeaningfulUpdate: () => {
        const scrollPosition = window.scrollY;
        flushSync(() => dispatch({ type: 'receive-meaningful-update' }));
        window.scrollTo({ top: scrollPosition });
      },
    };
    return () => {
      delete window.__northlineFixture;
    };
  }, []);
  useLayoutEffect(() => {
    if (routeState.fixture !== 'maximum') return;
    const validation = (window.__northlineValidation ??= {});
    validation.constructionDuration ??= performance.now() - constructionStartedAt;
  }, [constructionStartedAt, routeState.fixture]);
  useEffect(() => {
    if (routeState.fixture !== 'maximum') return;
    const validation = (window.__northlineValidation ??= {});
    validation.runMutation = (mutation) => {
      const started = performance.now();
      flushSync(() => {
        switch (mutation) {
          case 'filter-sort':
            dispatch({ type: 'set-dispatch-filter', value: 'needs-attention' });
            dispatch({ type: 'set-dispatch-sort', value: 'load-id' });
            break;
          case 'hold-lifecycle':
            dispatch({ type: 'set-scenario', value: 'stale-trailer', fixture: 'maximum' });
            dispatch({
              type: 'request-dispatch-hold',
              requestId: 'validation-hold',
              loadId: 'NL-2048',
              requestedAt: clock(),
            });
            dispatch({
              type: 'resolve-dispatch-hold',
              requestId: 'validation-hold',
              outcome: 'succeeded',
              completedAt: clock(),
            });
            break;
          case 'insert-events':
            dispatch({ type: 'insert-validation-events' });
            break;
          case 'replace-rows':
            dispatch({ type: 'replace-validation-rows' });
            break;
          case 'telemetry':
            dispatch({ type: 'replace-validation-telemetry' });
            break;
        }
      });
      return performance.now() - started;
    };
    return () => {
      delete validation.runMutation;
    };
  }, [clock, routeState.fixture]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, route: NorthlineRoute) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    router.navigate(route);
  }

  const commands: DispatchCommands = {
    async requestHold() {
      if (representativeLoad?.confirmedReleaseState !== 'scheduled') return;
      const requestId = `dispatch-hold-${++requestSequence.current}`;
      dispatch({
        type: 'request-dispatch-hold',
        requestId,
        loadId: representativeLoad.id,
        requestedAt: clock(),
      });
      const result = await controls.requestDispatchHold({
        requestId,
        loadId: representativeLoad.id,
        confirmedReleaseState: 'scheduled',
      });
      dispatch({ type: 'resolve-dispatch-hold', ...result });
    },
    showHoldConfirmation(invoker) {
      holdConfirmation.current?.show({ invoker });
    },
  };

  return (
    <WgThemeProvider
      theme={routeState.theme}
      density={routeState.density}
      dir={routeState.direction}
    >
      <WgCanvas width="full">
        <header slot="header" className="northline-header">
          <div className="northline-identity">
            <p>Wayglass reference application</p>
            <strong>Northline Cold Storage</strong>
          </div>
          <nav aria-label="Northline places">
            <a
              href={router.href({ name: 'overview' })}
              onClick={(event) => navigate(event, { name: 'overview' })}
              aria-current={routeState.route.name === 'overview' ? 'page' : undefined}
            >
              Overview
            </a>
            <a
              href={router.href({ name: 'function', value: 'dispatch' })}
              onClick={(event) => navigate(event, { name: 'function', value: 'dispatch' })}
              aria-current={
                routeState.route.name === 'function' && routeState.route.value === 'dispatch'
                  ? 'page'
                  : undefined
              }
            >
              Dispatch
            </a>
          </nav>
        </header>
        <main id="main-content" data-route={routeState.route.name}>
          <header className="northline-page-heading">
            <p>
              {routeState.route.name === 'overview'
                ? 'Northline Cold Storage / Shift coordination'
                : 'Northline Cold Storage / Outbound readiness'}
            </p>
            <h1>{title}</h1>
            <p>{routeDescription(routeState.route)}</p>
          </header>
          {routeState.route.name === 'overview' ? (
            <Overview state={state} router={router} navigate={navigate} dispatch={dispatch} />
          ) : routeState.route.name === 'function' ? (
            <FocusedFunction
              value={routeState.route.value}
              state={state}
              router={router}
              navigate={navigate}
              dispatch={dispatch}
            />
          ) : (
            <LoadDetail
              state={state}
              router={router}
              navigate={navigate}
              dispatch={dispatch}
              commands={commands}
            />
          )}
        </main>
        <p className="northline-announcement" aria-live="polite" aria-atomic="true">
          {state.announcement?.message ?? ''}
        </p>
        <WgConfirmationDialog
          ref={holdConfirmation}
          dialogId="northline-dispatch-hold"
          actionLabel="Place NL-2048 on dispatch hold"
          cancelLabel="Keep NL-2048 scheduled"
          actionAppearance="primary"
          attention="ordinary"
          initialFocus="cancel"
          onWgConfirmationAction={() => void commands.requestHold()}
        >
          <span slot="heading">Place NL-2048 on dispatch hold?</span>
          <p>{dispatchHoldConfirmationDescription(representativeLoad)}</p>
        </WgConfirmationDialog>
        <footer slot="footer">
          <span>Northline local time · 4:48 PM</span>
          <span>
            Application retention · {state.retention.retainedEventCount} of{' '}
            {state.retention.eventLimit} recent events
          </span>
        </footer>
      </WgCanvas>
    </WgThemeProvider>
  );
}

type Navigate = (event: MouseEvent<HTMLAnchorElement>, route: NorthlineRoute) => void;

function routeDescription(route: NorthlineRoute): string {
  switch (route.name) {
    case 'overview':
      return 'Can today’s outbound loads leave within temperature and schedule limits? Four operating functions share one view.';
    case 'function':
      return 'Focused work with peer-function consequences still visible and reachable.';
    case 'load':
      return 'Inspect one load’s confirmed release state and the freshness of its supporting evidence.';
  }
}

function Overview({
  state,
  router,
  navigate,
  dispatch,
}: {
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
  dispatch: Dispatch<NorthlineAction>;
}) {
  return (
    <>
      <OutboundReadiness state={state} router={router} navigate={navigate} />
      <div className="northline-function-grid">
        {northlineFunctions.map(({ value }) => (
          <FunctionRegion
            key={value}
            value={value}
            state={state}
            router={router}
            navigate={navigate}
            dispatch={dispatch}
            overview
          />
        ))}
      </div>
    </>
  );
}

function OutboundReadiness({
  state,
  router,
  navigate,
}: {
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
}) {
  const summary = selectDispatchSummary(state);
  const representative = selectLoad(state, 'NL-2048');
  const waitingForInitialData = state.presentation.dispatch.dataState === 'loading';
  return (
    <section className="northline-situation" aria-labelledby="northline-readiness-heading">
      <WgElbow weight="strong">
        <h2 id="northline-readiness-heading">Outbound readiness</h2>
      </WgElbow>
      <WgPanel purpose="information" emphasis="strong" label="Outbound readiness summary">
        <div className="northline-readiness-copy">
          <p>
            <strong>
              {waitingForInitialData
                ? 'Waiting for confirmed outbound records.'
                : summary.needsAttention === 0
                  ? 'No outbound load currently needs attention.'
                  : `${summary.needsAttention} outbound load needs review.`}
            </strong>{' '}
            {waitingForInitialData
              ? 'No release decision is shown yet.'
              : `${summary.scheduled} scheduled and ${summary.held} held.`}
          </p>
          {representative?.trailerTemperature.knowledge === 'stale' ? (
            <p>
              NL-2048 remains scheduled, but its latest trailer-temperature evidence is stale near
              cutoff. Northline cannot confirm readiness from that observation.
            </p>
          ) : representative?.trailerTemperature.knowledge === 'unavailable' ? (
            <p>
              NL-2048 remains scheduled while trailer-temperature evidence is unavailable. Northline
              cannot confirm readiness from missing evidence.
            </p>
          ) : null}
          {representative ? (
            <a
              href={router.href({ name: 'load', loadId: 'NL-2048' })}
              onClick={(event) => navigate(event, { name: 'load', loadId: 'NL-2048' })}
            >
              Inspect NL-2048
            </a>
          ) : null}
        </div>
      </WgPanel>
    </section>
  );
}

function FocusedFunction({
  value,
  state,
  router,
  navigate,
  dispatch,
}: {
  value: NorthlineFunction;
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
  dispatch: Dispatch<NorthlineAction>;
}) {
  const dispatchAttention = selectDispatchSummary(state).needsAttention;
  return (
    <div className="northline-focused-layout">
      <nav className="northline-function-selectors" aria-label="Operational functions">
        {northlineFunctions.map((item) => (
          <a
            key={item.value}
            href={router.href({ name: 'function', value: item.value })}
            onClick={(event) => navigate(event, { name: 'function', value: item.value })}
            aria-current={item.value === value ? 'page' : undefined}
          >
            <span>{item.label}</span>
            <small>{functionSummary(item.value, state)}</small>
          </a>
        ))}
      </nav>
      {value !== 'dispatch' && dispatchAttention > 0 ? (
        <aside className="northline-peer-consequence" aria-label="Dispatch consequence">
          <strong>Dispatch still needs attention.</strong>
          <span> NL-2048 has stale trailer-temperature evidence near cutoff.</span>{' '}
          <a
            href={router.href({ name: 'function', value: 'dispatch' })}
            onClick={(event) => navigate(event, { name: 'function', value: 'dispatch' })}
          >
            Open Dispatch
          </a>
        </aside>
      ) : null}
      <div className="northline-focused-surface">
        <FunctionRegion
          value={value}
          state={state}
          router={router}
          navigate={navigate}
          dispatch={dispatch}
          overview={false}
        />
      </div>
    </div>
  );
}

function FunctionRegion({
  value,
  state,
  router,
  navigate,
  dispatch,
  overview,
}: {
  value: NorthlineFunction;
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
  dispatch: Dispatch<NorthlineAction>;
  overview: boolean;
}) {
  const definition = northlineFunctions.find((item) => item.value === value)!;
  const presentation = state.presentation[value];
  return (
    <section
      className="northline-function"
      data-function={value}
      aria-labelledby={`northline-${value}-heading`}
    >
      <WgElbow weight={overview ? 'standard' : 'strong'}>
        <h2 id={`northline-${value}-heading`}>{definition.label}</h2>
      </WgElbow>
      {presentation.dataState !== 'ready' ? (
        <p className="northline-data-state">{presentation.message}</p>
      ) : null}
      <FunctionContent
        value={value}
        state={state}
        router={router}
        navigate={navigate}
        dispatch={dispatch}
        overview={overview}
      />
      {overview ? (
        <a
          className="northline-function-link"
          href={router.href({ name: 'function', value })}
          onClick={(event) => navigate(event, { name: 'function', value })}
        >
          Open {definition.label}
        </a>
      ) : null}
    </section>
  );
}

function FunctionContent({
  value,
  state,
  router,
  navigate,
  dispatch,
  overview,
}: {
  value: NorthlineFunction;
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
  dispatch: Dispatch<NorthlineAction>;
  overview: boolean;
}) {
  switch (value) {
    case 'receiving':
      return <Receiving state={state} prominent={!overview} />;
    case 'cold-storage':
      return <ColdStorage state={state} prominent={!overview} />;
    case 'order-preparation':
      return <OrderPreparation state={state} prominent={!overview} />;
    case 'dispatch':
      return overview ? (
        <DispatchSummary state={state} />
      ) : (
        <DispatchWorkspace state={state} router={router} navigate={navigate} dispatch={dispatch} />
      );
  }
}

function MonitorPanel({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <WgPanel purpose="monitor" emphasis="strong" label={heading}>
      <h3 slot="heading">{heading}</h3>
      <div className="northline-values">{children}</div>
    </WgPanel>
  );
}

function Receiving({ state, prominent }: { state: NorthlineState; prominent: boolean }) {
  const exceptions = selectFunctionExceptions(state, 'receiving');
  return (
    <MonitorPanel heading="Inbound flow">
      <WgMetric
        label="Loads received"
        value={state.throughput.receivedLoads?.toString() ?? ''}
        unit="today"
        loading={state.throughput.receivedLoads === null}
        size={prominent ? 'prominent' : 'compact'}
      />
      <WgStatusIndicator
        label={exceptions.length > 0 ? 'Inbound delay under review' : 'Receiving on plan'}
        condition={exceptions.length > 0 ? 'caution' : 'positive'}
        knowledge="confirmed"
      />
      <p>{exceptions[0]?.summary ?? 'Four receiving doors are available for the current plan.'}</p>
    </MonitorPanel>
  );
}

function ColdStorage({ state, prominent }: { state: NorthlineState; prominent: boolean }) {
  const occupied = state.capacity.occupiedPositions;
  const total = state.capacity.totalPositions;
  const percentage =
    occupied !== null && total !== null ? Math.round((occupied / total) * 100) : null;
  return (
    <MonitorPanel heading="Storage capacity">
      <WgMetric
        label="Occupied positions"
        value={occupied?.toLocaleString('en-US') ?? ''}
        unit={total === null ? '' : `of ${total.toLocaleString('en-US')}`}
        loading={occupied === null}
        size={prominent ? 'prominent' : 'compact'}
      />
      <WgStatusIndicator
        label={percentage === null ? 'Capacity loading' : `Capacity at ${percentage}%`}
        condition={percentage === null ? 'neutral' : 'positive'}
        knowledge={percentage === null ? 'unknown' : 'confirmed'}
      />
      <p>Capacity is informational context for outbound planning, not a release decision.</p>
    </MonitorPanel>
  );
}

function OrderPreparation({ state, prominent }: { state: NorthlineState; prominent: boolean }) {
  const received = state.throughput.receivedLoads;
  const prepared = state.throughput.preparedLoads;
  const remaining =
    received !== null && prepared !== null ? Math.max(received - prepared, 0) : null;
  return (
    <MonitorPanel heading="Preparation throughput">
      <WgMetric
        label="Loads prepared"
        value={prepared?.toString() ?? ''}
        unit="today"
        loading={prepared === null}
        size={prominent ? 'prominent' : 'compact'}
      />
      <WgKeyValue
        label="Remaining from today’s receipts"
        value={remaining === null ? 'Waiting for confirmed counts' : `${remaining} loads`}
        knowledge={remaining === null ? 'unknown' : 'confirmed'}
      />
      <p>Preparation counts describe current work; they do not assert trailer readiness.</p>
    </MonitorPanel>
  );
}

function DispatchSummary({ state }: { state: NorthlineState }) {
  const summary = selectDispatchSummary(state);
  const load = selectLoad(state, 'NL-2048');
  const loading = state.presentation.dispatch.dataState === 'loading';
  return (
    <MonitorPanel heading="Outbound loads">
      <WgMetric
        label="Scheduled"
        value={loading ? '' : summary.scheduled.toString()}
        unit="loads"
        loading={loading}
        size="compact"
      />
      <WgMetric
        label="Held"
        value={loading ? '' : summary.held.toString()}
        unit="loads"
        loading={loading}
        size="compact"
      />
      {load ? (
        <WgStatusIndicator
          label={`${load.id} trailer observation requires review`}
          condition={load.condition}
          knowledge={load.trailerTemperature.knowledge}
        />
      ) : (
        <WgStatusIndicator
          label="Dispatch records loading"
          condition="neutral"
          knowledge="unknown"
        />
      )}
      <p>Confirmed release state remains separate from temperature knowledge.</p>
    </MonitorPanel>
  );
}

function DispatchWorkspace({
  state,
  router,
  navigate,
  dispatch,
}: {
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
  dispatch: Dispatch<NorthlineAction>;
}) {
  const loads = selectDispatchLoads(state);
  const exceptions = selectFunctionExceptions(state, 'dispatch');
  return (
    <div className="northline-dispatch-workspace">
      <DispatchFilters state={state} dispatch={dispatch} />
      {exceptions.length > 0 ? (
        <WgStatusList label="Dispatch attention">
          <h3 slot="heading">Dispatch attention</h3>
          <p slot="description">
            Exceptions are authored by operational priority; knowledge remains explicit.
          </p>
          {exceptions.map((exception) => (
            <WgStatusEntry
              key={exception.id}
              label={exception.loadId ?? exception.summary}
              condition={exception.condition}
              knowledge={exception.knowledge}
            >
              <h4 slot="heading">{exception.loadId ?? 'Dispatch exception'}</h4>
              <p slot="description">{exception.summary}</p>
              <span slot="metadata">
                {exception.acknowledged
                  ? 'Investigation acknowledged'
                  : 'Investigation not acknowledged'}
              </span>
              <div slot="actions" className="northline-investigation-actions">
                {exception.loadId === 'NL-2048' ? (
                  <a
                    href={router.href({ name: 'load', loadId: 'NL-2048' })}
                    onClick={(event) => navigate(event, { name: 'load', loadId: 'NL-2048' })}
                  >
                    Inspect NL-2048
                  </a>
                ) : null}
                <WgButton
                  appearance="secondary"
                  disabled={exception.acknowledged}
                  onClick={() =>
                    dispatch({
                      type: 'acknowledge-investigation',
                      exceptionId: exception.id,
                    })
                  }
                >
                  {exception.acknowledged
                    ? 'Investigation acknowledged'
                    : 'Acknowledge investigation'}
                </WgButton>
              </div>
            </WgStatusEntry>
          ))}
        </WgStatusList>
      ) : (
        <WgPanel purpose="information" emphasis="standard" label="Dispatch attention">
          <h3 slot="heading">Dispatch attention</h3>
          <p>No current Dispatch exceptions.</p>
        </WgPanel>
      )}
      <DispatchTable
        loads={loads}
        state={state}
        router={router}
        navigate={navigate}
        dispatch={dispatch}
      />
      {state.fixture === 'maximum' ? <MaximumDispatchFixture state={state} /> : null}
    </div>
  );
}

function MaximumDispatchFixture({ state }: { state: NorthlineState }) {
  const windowStart = state.validation.telemetry[0]?.samples[0]?.observedAt ?? 0;
  const windowEnd = state.validation.telemetry[0]?.samples.at(-1)?.observedAt ?? 1;
  return (
    <section className="northline-maximum-fixture" aria-labelledby="northline-maximum-heading">
      <WgElbow weight="strong">
        <h3 id="northline-maximum-heading">Validation-scale operations context</h3>
      </WgElbow>
      <WgPanel purpose="monitor" emphasis="standard" label="Operational reference values">
        <h4 slot="heading">Operational reference values</h4>
        <div className="northline-validation-values">
          {state.validation.values.map((value) => (
            <WgKeyValue
              key={value.id}
              data-validation-value={value.id}
              label={value.label}
              value={value.value}
            />
          ))}
        </div>
      </WgPanel>
      <div className="northline-validation-telemetry">
        {state.validation.telemetry.map((series) => {
          const latest = series.samples.at(-1)?.value ?? 0;
          return (
            <WgTelemetryStrip
              key={series.id}
              data-validation-telemetry={series.id}
              label={series.label}
              samples={series.samples}
              windowStart={windowStart}
              windowEnd={windowEnd}
              scaleMinimum={0}
              scaleMaximum={100}
              condition="neutral"
              knowledge="confirmed"
            >
              <h4 slot="heading">{series.label}</h4>
              <p slot="current">
                {latest} {series.unit}
              </p>
              <time slot="window-start" dateTime="2026-08-12T15:30:00-07:00">
                15:30
              </time>
              <time slot="window-end" dateTime="2026-08-12T16:29:30-07:00">
                16:29
              </time>
              <p slot="summary">120 confirmed samples; latest value {latest}.</p>
            </WgTelemetryStrip>
          );
        })}
      </div>
      <WgStatusList label="Validation-scale operational sources">
        <h4 slot="heading">Operational sources</h4>
        <p slot="description">
          One hundred application-owned status records exercise stable authored identity.
        </p>
        {state.validation.statuses.map((status) => (
          <WgStatusEntry
            key={status.id}
            data-validation-status={status.id}
            label={status.label}
            condition={status.condition}
            knowledge={status.knowledge}
          >
            <span slot="heading">{status.label}</span>
            <p slot="description">{status.detail}</p>
          </WgStatusEntry>
        ))}
      </WgStatusList>
      <WgEventLog
        label="Validation-scale retained operations events"
        chronology="descending"
        chronologyLabel="Newest retained event first"
      >
        <h4 slot="heading">Retained operations events</h4>
        <p slot="description">
          The 250-event window is bounded and ordered by Northline application policy.
        </p>
        {state.validation.events.map((event) => (
          <WgEventRecord
            key={event.id}
            data-validation-event={event.id}
            label={event.summary}
            condition={event.condition}
            knowledge={event.knowledge}
          >
            <time slot="time" dateTime={event.occurredAt}>
              {formatTime(event.occurredAt)}
            </time>
            <span slot="summary">{event.summary}</span>
            <span slot="source">Source: Northline operations fixture</span>
            <span slot="category">Category: retained event</span>
          </WgEventRecord>
        ))}
      </WgEventLog>
    </section>
  );
}

function DispatchFilters({
  state,
  dispatch,
}: {
  state: NorthlineState;
  dispatch: Dispatch<NorthlineAction>;
}) {
  return (
    <WgFilterBar label="Outbound load view">
      <h3 slot="heading">Outbound load view</h3>
      <p slot="description">
        Filtering and authored order change the view, not the retained load records.
      </p>
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="northline-filter-fields">
          <label htmlFor="northline-load-filter">Show</label>
          <WgSelect>
            <select
              id="northline-load-filter"
              name="filter"
              value={state.dispatch.filter}
              onChange={(event) =>
                dispatch({
                  type: 'set-dispatch-filter',
                  value: event.currentTarget.value as DispatchFilter,
                })
              }
            >
              <option value="all">All loads</option>
              <option value="needs-attention">Needs attention</option>
              <option value="scheduled">Scheduled</option>
              <option value="held">Held</option>
            </select>
          </WgSelect>
          <label htmlFor="northline-load-sort">Order</label>
          <WgSelect>
            <select
              id="northline-load-sort"
              name="sort"
              value={state.dispatch.sort}
              onChange={(event) =>
                dispatch({
                  type: 'set-dispatch-sort',
                  value: event.currentTarget.value as DispatchSort,
                })
              }
            >
              <option value="cutoff-ascending">Earliest cutoff first</option>
              <option value="load-id">Load identifier</option>
            </select>
          </WgSelect>
        </div>
      </form>
      <p slot="summary">
        {selectDispatchLoads(state).length} of {state.dispatch.loads.length} retained loads shown.
      </p>
    </WgFilterBar>
  );
}

function DispatchTable({
  loads,
  state,
  router,
  navigate,
  dispatch,
}: {
  loads: DispatchLoad[];
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
  dispatch: Dispatch<NorthlineAction>;
}) {
  return (
    <WgDataTable className="northline-load-table">
      <p slot="context">
        {loads.length} loads shown · {dispatchSortLabel(state)} · filter: {state.dispatch.filter}
      </p>
      <WgScrollRegion axis="inline" label="Outbound load records table">
        <table>
          <caption>Outbound load records</caption>
          <thead>
            <tr>
              <th scope="col">Load</th>
              <th scope="col">Destination</th>
              <th scope="col">Carrier</th>
              <th scope="col">Trailer</th>
              <th scope="col">Door</th>
              <th scope="col">Seal</th>
              <th scope="col">Pallets</th>
              <th scope="col">Temperature</th>
              <th scope="col">Knowledge</th>
              <th scope="col">Release state</th>
              <th
                scope="col"
                aria-sort={state.dispatch.sort === 'cutoff-ascending' ? 'ascending' : 'none'}
              >
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'set-dispatch-sort',
                      value:
                        state.dispatch.sort === 'cutoff-ascending' ? 'load-id' : 'cutoff-ascending',
                    })
                  }
                >
                  Cutoff,{' '}
                  {state.dispatch.sort === 'cutoff-ascending' ? 'earliest first' : 'unsorted'}
                </button>
              </th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loads.map((load) => (
              <tr key={load.id} data-load-id={load.id}>
                <th scope="row">{load.id}</th>
                <td>{load.destination}</td>
                <td>{load.carrier}</td>
                <td>{load.trailerId}</td>
                <td>{load.dispatchDoor}</td>
                <td>{displayLabel(load.sealState)}</td>
                <td>{load.palletCount}</td>
                <td>{formatTemperature(load)}</td>
                <td>{displayLabel(load.trailerTemperature.knowledge)}</td>
                <td>{displayLabel(load.confirmedReleaseState)}</td>
                <td>
                  <time dateTime={load.cutoffAt}>{formatTime(load.cutoffAt)}</time>
                </td>
                <td>
                  {load.id === 'NL-2048' ? (
                    <a
                      href={router.href({ name: 'load', loadId: 'NL-2048' })}
                      onClick={(event) => navigate(event, { name: 'load', loadId: 'NL-2048' })}
                    >
                      Inspect {load.id}
                    </a>
                  ) : (
                    <span>No current action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </WgScrollRegion>
      <p slot="feedback">Release state is confirmed truth; temperature knowledge may differ.</p>
    </WgDataTable>
  );
}

function LoadDetail({
  state,
  router,
  navigate,
  dispatch,
  commands,
}: {
  state: NorthlineState;
  router: NorthlineRouter;
  navigate: Navigate;
  dispatch: Dispatch<NorthlineAction>;
  commands: DispatchCommands;
}) {
  const load = selectLoad(state, 'NL-2048');
  if (!load) {
    return (
      <WgPanel purpose="information" emphasis="strong" label="Load record loading">
        <h2 slot="heading">Load record loading</h2>
        <p>No confirmed load detail is available yet.</p>
      </WgPanel>
    );
  }
  const timeline = selectLoadTimeline(state, load.id);
  const representativeException = state.exceptions.find(
    (exception) => exception.id === 'exception-nl-2048-temperature',
  );
  return (
    <div className="northline-load-detail">
      <section
        className="northline-function"
        data-function="dispatch"
        aria-labelledby="northline-load-state-heading"
      >
        <WgElbow weight="strong">
          <h2 id="northline-load-state-heading">Confirmed load state</h2>
        </WgElbow>
        <WgPanel purpose="monitor" emphasis="strong" label="NL-2048 confirmed load state">
          <div className="northline-load-facts">
            <WgStatusIndicator
              label="Trailer observation requires review"
              condition={load.condition}
              knowledge={load.trailerTemperature.knowledge}
              size="prominent"
            />
            <WgBooleanValue
              label="Dispatch hold"
              asserted={load.confirmedReleaseState === 'held'}
              assertedLabel="Applied"
              notAssertedLabel="Not applied"
              knowledge="confirmed"
              presentation="rail"
            />
            <WgKeyValue label="Destination" value={load.destination} />
            <WgKeyValue label="Carrier" value={load.carrier} />
            <WgKeyValue label="Dispatch cutoff" value={formatTime(load.cutoffAt)} />
            <WgKeyValue
              label="Last trailer temperature"
              value={formatTemperature(load)}
              knowledge={load.trailerTemperature.knowledge}
            />
          </div>
        </WgPanel>
        <WgPanel purpose="information" emphasis="standard" label="Readiness interpretation">
          <h3 slot="heading">Readiness interpretation</h3>
          <p>
            The last observation is {displayLabel(load.trailerTemperature.knowledge).toLowerCase()}.
            Northline does not infer that NL-2048 is safe or unsafe from stale or missing evidence.
            Its confirmed release state remains {load.confirmedReleaseState}.
          </p>
        </WgPanel>
        <WgTimeline
          label="NL-2048 evidence history"
          chronology="descending"
          chronologyLabel="Newest evidence first"
        >
          <h3 slot="heading">Evidence history</h3>
          <p slot="description">
            Current evidence and confirmed release history remain separate temporal records.
          </p>
          {timeline.map((entry) => (
            <WgTimelineItem
              key={entry.id}
              data-timeline-id={entry.id}
              label={entry.label}
              condition={entry.condition}
              knowledge={entry.knowledge}
              activity={entry.activity}
            >
              {entry.occurredAt ? (
                <time slot="time" dateTime={entry.occurredAt}>
                  {formatTime(entry.occurredAt)}
                </time>
              ) : (
                <span slot="time">No trustworthy observation time</span>
              )}
              <span slot="heading">{entry.label}</span>
              <p>{entry.detail}</p>
            </WgTimelineItem>
          ))}
        </WgTimeline>
        {representativeException ? (
          <WgPanel purpose="control" emphasis="standard" label="Temperature investigation">
            <h3 slot="heading">Temperature investigation</h3>
            <p>
              Acknowledgement records that a coordinator has taken ownership. It does not verify
              temperature or change the confirmed release state.
            </p>
            <WgButton
              slot="actions"
              appearance="secondary"
              disabled={representativeException.acknowledged}
              onClick={() =>
                dispatch({
                  type: 'acknowledge-investigation',
                  exceptionId: representativeException.id,
                })
              }
            >
              {representativeException.acknowledged
                ? 'Investigation acknowledged'
                : 'Acknowledge investigation'}
            </WgButton>
          </WgPanel>
        ) : null}
        <DispatchHoldControl load={load} state={state} commands={commands} />
        <a
          href={router.href({ name: 'function', value: 'dispatch' })}
          onClick={(event) => navigate(event, { name: 'function', value: 'dispatch' })}
        >
          Back to Dispatch
        </a>
      </section>
    </div>
  );
}

function DispatchHoldControl({
  load,
  state,
  commands,
}: {
  load: DispatchLoad;
  state: NorthlineState;
  commands: DispatchCommands;
}) {
  const request = state.dispatch.holdRequest;
  const held = load.confirmedReleaseState === 'held';
  const pending = request.state === 'pending' && request.loadId === load.id;
  const canRequest = !held && !pending;
  const actionLabel = held
    ? 'Dispatch hold confirmed'
    : request.state === 'failed' || request.state === 'denied'
      ? 'Retry dispatch hold'
      : 'Place NL-2048 on dispatch hold';
  return (
    <WgPanel purpose="control" emphasis="strong" label="Dispatch hold control for NL-2048">
      <h3 slot="heading">Dispatch hold · NL-2048</h3>
      <p>
        A confirmed hold changes Dispatch schedule and custody. This reference workflow does not
        include releasing the hold.
      </p>
      <WgBooleanValue
        label="Dispatch hold"
        asserted={held}
        assertedLabel="Applied"
        notAssertedLabel="Not applied"
        knowledge="confirmed"
        presentation="rail"
      />
      <WgButton
        slot="actions"
        appearance="primary"
        pending={pending}
        disabled={!canRequest}
        onClick={(event) => commands.showHoldConfirmation(event.currentTarget)}
      >
        {actionLabel}
        <span slot="pending-label">Requesting dispatch hold</span>
      </WgButton>
      <DispatchHoldResult state={request.state} message={request.message} />
    </WgPanel>
  );
}

function DispatchHoldResult({
  state,
  message,
}: {
  state: NorthlineState['dispatch']['holdRequest']['state'];
  message: string;
}) {
  const condition =
    state === 'succeeded'
      ? 'positive'
      : state === 'failed' || state === 'denied'
        ? 'caution'
        : 'neutral';
  return (
    <WgAlert
      condition={condition}
      announcement="off"
      label="Dispatch hold request result"
      data-request-state={state}
    >
      <strong slot="heading">{dispatchHoldStateLabel(state)}</strong>
      <p>{message || 'No dispatch-hold request in progress.'}</p>
    </WgAlert>
  );
}

function dispatchHoldStateLabel(state: NorthlineState['dispatch']['holdRequest']['state']): string {
  switch (state) {
    case 'idle':
      return 'Ready';
    case 'pending':
      return 'Pending confirmation';
    case 'succeeded':
      return 'Hold confirmed';
    case 'failed':
      return 'Release state unchanged';
    case 'denied':
      return 'Permission required';
  }
}

function dispatchHoldConfirmationDescription(load: DispatchLoad | undefined): string {
  const releaseState = load ? displayLabel(load.confirmedReleaseState) : 'Unavailable';
  return `Confirmed current release state: ${releaseState}. Request a Dispatch hold for Northline load NL-2048. A confirmed hold changes schedule and custody, and this workflow does not include hold release.`;
}

function functionSummary(value: NorthlineFunction, state: NorthlineState): string {
  switch (value) {
    case 'receiving': {
      const delays = selectFunctionExceptions(state, 'receiving').length;
      return state.throughput.receivedLoads === null
        ? 'Loading confirmed counts'
        : delays > 0
          ? `${state.throughput.receivedLoads} received · ${delays} delay`
          : `${state.throughput.receivedLoads} received · On plan`;
    }
    case 'cold-storage':
      return state.capacity.occupiedPositions === null
        ? 'Loading confirmed capacity'
        : `${state.capacity.occupiedPositions} of ${state.capacity.totalPositions} positions`;
    case 'order-preparation':
      return state.throughput.preparedLoads === null
        ? 'Loading confirmed counts'
        : `${state.throughput.preparedLoads} loads prepared`;
    case 'dispatch': {
      const summary = selectDispatchSummary(state);
      return `${summary.scheduled} scheduled · ${summary.needsAttention} needs review`;
    }
  }
}

function dispatchSortLabel(state: NorthlineState): string {
  return state.dispatch.sort === 'cutoff-ascending'
    ? 'earliest cutoff first'
    : 'load identifier order';
}

function formatTemperature(load: DispatchLoad): string {
  return load.trailerTemperature.value === null
    ? 'Unavailable'
    : `${load.trailerTemperature.value} ${load.trailerTemperature.unit}`;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Phoenix',
  }).format(new Date(value));
}

function displayLabel(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).replaceAll('-', ' ')}`;
}
