import {
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgConfirmationDialog,
  WgElbow,
  WgKeyValue,
  WgMedia,
  WgMediaViewer,
  WgMetric,
  WgPanel,
  WgStatusIndicator,
  WgTelemetryStrip,
  WgThemeProvider,
  WgValueTile,
} from '@wayglass/react';
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
  type ComponentRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';

import {
  cedarFunctions,
  createCedarHouseState,
  reduceCedarHouse,
  selectPorchLight,
  selectUnsettledReasons,
  type CedarFunction,
  type CedarHouseState,
} from './model.js';
import { type CedarClock, type HouseholdControlPort } from './ports.js';
import { type CedarRoute, type CedarRouter } from './router.js';

interface CedarCommands {
  requestPorchLight(requestedOn: boolean): Promise<void>;
  requestSecureHouse(): Promise<void>;
  showSecureConfirmation(invoker: HTMLElement): void;
}

declare global {
  interface Window {
    __cedarValidation?: {
      constructionDuration?: number;
      runMutation?: (
        mutation: 'confirmed-control' | 'failed-control' | 'partial-secure' | 'telemetry',
      ) => number;
    };
  }
}

function routeTitle(route: CedarRoute): string {
  switch (route.name) {
    case 'overview':
      return 'Whole-home overview';
    case 'function':
      return cedarFunctions.find(({ value }) => value === route.value)?.label ?? route.value;
    case 'asset':
      return 'HVAC air handler';
  }
}

export function CedarHouseApp({
  router,
  controls,
  clock,
  constructionStartedAt,
}: {
  router: CedarRouter;
  controls: HouseholdControlPort;
  clock: CedarClock;
  constructionStartedAt: number;
}) {
  const routeState = useSyncExternalStore(router.subscribe, router.current);
  const [state, dispatch] = useReducer(reduceCedarHouse, routeState, (initialRoute) =>
    createCedarHouseState(initialRoute.scenario, initialRoute.fixture),
  );
  const requestSequence = useRef(0);
  const secureConfirmation = useRef<ComponentRef<typeof WgConfirmationDialog>>(null);
  const title = routeTitle(routeState.route);

  useEffect(() => {
    document.title = `${title} — Cedar House`;
  }, [title]);

  useEffect(() => {
    dispatch({
      type: 'set-scenario',
      value: routeState.scenario,
      fixture: routeState.fixture,
    });
  }, [routeState.fixture, routeState.scenario]);

  useLayoutEffect(() => {
    if (routeState.fixture !== 'maximum') return;
    const validation = (window.__cedarValidation ??= {});
    validation.constructionDuration ??= performance.now() - constructionStartedAt;
  }, [constructionStartedAt, routeState.fixture]);

  useEffect(() => {
    if (routeState.fixture !== 'maximum') return;
    const validation = (window.__cedarValidation ??= {});
    validation.runMutation = (mutation) => {
      const started = performance.now();
      flushSync(() => {
        if (mutation === 'telemetry') {
          dispatch({ type: 'replace-validation-telemetry' });
          return;
        }
        if (mutation === 'partial-secure') {
          dispatch({ type: 'set-scenario', value: 'secure-partial', fixture: 'maximum' });
          dispatch({
            type: 'request-secure-house',
            requestId: 'validation-secure',
            requestedAt: clock(),
          });
          dispatch({
            type: 'resolve-secure-house',
            requestId: 'validation-secure',
            outcome: 'partial',
            completedAt: clock(),
          });
          return;
        }
        dispatch({ type: 'set-scenario', value: 'steady', fixture: 'maximum' });
        dispatch({
          type: 'request-porch-light',
          requestedOn: true,
          requestId: 'validation-porch',
          requestedAt: clock(),
        });
        dispatch({
          type: 'resolve-porch-light',
          requestId: 'validation-porch',
          outcome: mutation === 'confirmed-control' ? 'succeeded' : 'failed',
          completedAt: clock(),
        });
      });
      return performance.now() - started;
    };
    return () => {
      delete validation.runMutation;
    };
  }, [clock, routeState.fixture]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, route: CedarRoute) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    router.navigate(route);
  }

  const activeFunction =
    routeState.route.name === 'function' ? routeState.route.value : state.selectedFunction;

  const commands: CedarCommands = {
    async requestPorchLight(requestedOn) {
      const requestId = `porch-${++requestSequence.current}`;
      dispatch({
        type: 'request-porch-light',
        requestedOn,
        requestId,
        requestedAt: clock(),
      });
      const result = await controls.requestPorchLight({ requestId, requestedOn });
      dispatch({ type: 'resolve-porch-light', ...result });
    },
    async requestSecureHouse() {
      const requestId = `secure-${++requestSequence.current}`;
      const targetIds = state.access.points.map(({ id }) => id);
      dispatch({ type: 'request-secure-house', requestId, requestedAt: clock() });
      const result = await controls.requestSecureHouse({ requestId, targetIds });
      dispatch({ type: 'resolve-secure-house', ...result });
    },
    showSecureConfirmation(invoker) {
      secureConfirmation.current?.show({ invoker });
    },
  };

  return (
    <WgThemeProvider
      theme={routeState.theme}
      density={routeState.density}
      dir={routeState.direction}
    >
      <WgCanvas width="full">
        <header slot="header" className="cedar-header">
          <div className="cedar-identity">
            <p>Wayglass reference application</p>
            <strong>Cedar House</strong>
          </div>
          <nav aria-label="Cedar House places">
            <a
              href={router.href({ name: 'overview' })}
              onClick={(event) => navigate(event, { name: 'overview' })}
              aria-current={routeState.route.name === 'overview' ? 'page' : undefined}
            >
              Overview
            </a>
            <a
              href={router.href({ name: 'asset', assetId: 'hvac-air-handler' })}
              onClick={(event) => navigate(event, { name: 'asset', assetId: 'hvac-air-handler' })}
              aria-current={routeState.route.name === 'asset' ? 'page' : undefined}
            >
              HVAC equipment guide
            </a>
          </nav>
        </header>
        <main id="main-content" data-route={routeState.route.name}>
          <header className="cedar-page-heading">
            <p>{routeState.route.name === 'overview' ? 'Cedar House' : 'Cedar House / Overview'}</p>
            <h1>{title}</h1>
            <p>{routeDescription(routeState.route)}</p>
          </header>
          {routeState.route.name === 'overview' ? (
            <Overview state={state} router={router} navigate={navigate} commands={commands} />
          ) : routeState.route.name === 'function' ? (
            <FocusedFunction
              value={activeFunction}
              state={state}
              router={router}
              navigate={navigate}
              commands={commands}
            />
          ) : (
            <AssetDetail
              state={state}
              router={router}
              navigate={navigate}
              onRecordFilterReplaced={() => {
                dispatch({
                  type: 'record-filter-replaced',
                  recordId: `filter-${++requestSequence.current}`,
                  recordedAt: clock(),
                });
              }}
            />
          )}
        </main>
        <p className="cedar-announcement" aria-live="polite" aria-atomic="true">
          {state.announcement?.message ?? ''}
        </p>
        <WgConfirmationDialog
          ref={secureConfirmation}
          dialogId="secure-cedar-house"
          actionLabel="Secure Cedar House"
          cancelLabel="Keep current access state"
          actionAppearance="primary"
          attention="ordinary"
          initialFocus="cancel"
          onWgConfirmationAction={() => void commands.requestSecureHouse()}
        >
          <span slot="heading">Secure Cedar House?</span>
          <p>{secureConfirmationDescription(state)}</p>
        </WgConfirmationDialog>
        <footer slot="footer">
          <span>Scenario: {state.scenario.replaceAll('-', ' ')}</span>
        </footer>
      </WgCanvas>
    </WgThemeProvider>
  );
}

type Navigate = (event: MouseEvent<HTMLAnchorElement>, route: CedarRoute) => void;

function routeDescription(route: CedarRoute): string {
  switch (route.name) {
    case 'overview':
      return 'Is the house settled for the evening? Five household functions share one confirmed view.';
    case 'function':
      return 'Focused work with the other household functions still visible and reachable.';
    case 'asset':
      return 'Identify the equipment and review maintenance context before beginning work.';
  }
}

function Overview({
  state,
  router,
  navigate,
  commands,
}: {
  state: CedarHouseState;
  router: CedarRouter;
  navigate: Navigate;
  commands: CedarCommands;
}) {
  const reasons = selectUnsettledReasons(state);
  return (
    <>
      <section className="cedar-situation" aria-labelledby="cedar-situation-heading">
        <WgElbow weight="strong">
          <h2 id="cedar-situation-heading">Evening readiness</h2>
        </WgElbow>
        <WgPanel purpose="information" emphasis="strong" label="Evening readiness summary">
          <p className="cedar-readiness-copy">
            <strong>
              {reasons.length === 0
                ? 'Cedar House is settled.'
                : reasons.length === 1
                  ? 'One item needs attention.'
                  : `${reasons.length} items need attention.`}
            </strong>
            {reasons.length === 0
              ? ' Current household state is confirmed.'
              : ` ${reasons.join('. ')}. Comfort and equipment availability remain normal.`}
          </p>
        </WgPanel>
      </section>
      <div className="cedar-function-grid">
        {cedarFunctions.map(({ value }) => (
          <FunctionRegion
            key={value}
            value={value}
            state={state}
            router={router}
            navigate={navigate}
            commands={commands}
            overview
          />
        ))}
      </div>
      {state.fixture === 'maximum' ? <MaximumFixture state={state} /> : null}
    </>
  );
}

function MaximumFixture({ state }: { state: CedarHouseState }) {
  const windowStart = state.validation.telemetry[0]?.samples[0]?.observedAt ?? 0;
  const windowEnd = state.validation.telemetry[0]?.samples.at(-1)?.observedAt ?? 1;
  return (
    <section className="cedar-maximum-fixture" aria-labelledby="cedar-maximum-heading">
      <WgElbow weight="strong">
        <h2 id="cedar-maximum-heading">Validation-scale household context</h2>
      </WgElbow>
      <WgPanel purpose="information" emphasis="standard" label="Household inventory fixture">
        <h3 slot="heading">Household inventory</h3>
        <p>
          {state.validation.inventory.length} deterministic devices and assets exercise application
          coordination without representing a live integration.
        </p>
        <ol className="cedar-inventory" aria-label="Household inventory">
          {state.validation.inventory.map((record) => (
            <li key={record.id}>{record.label}</li>
          ))}
        </ol>
      </WgPanel>
      <WgPanel purpose="monitor" emphasis="standard" label="Representative household values">
        <h3 slot="heading">Representative household values</h3>
        <div className="cedar-validation-values">
          {state.validation.values.map((value) => (
            <WgBooleanValue
              key={value.id}
              data-validation-value={value.id}
              label={value.label}
              asserted={value.confirmedOn ?? false}
              assertedLabel="On"
              notAssertedLabel="Off"
              knowledge={value.knowledge}
              presentation="rail"
            />
          ))}
        </div>
      </WgPanel>
      <div className="cedar-validation-telemetry">
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
              <h3 slot="heading">{series.label}</h3>
              <p slot="current">
                {latest} {series.unit}
              </p>
              <time slot="window-start" dateTime="2026-08-12T17:30:00-07:00">
                17:30
              </time>
              <time slot="window-end" dateTime="2026-08-12T18:29:30-07:00">
                18:29
              </time>
              <p slot="summary">120 confirmed samples; latest value {latest}.</p>
            </WgTelemetryStrip>
          );
        })}
      </div>
    </section>
  );
}

function FocusedFunction({
  value,
  state,
  router,
  navigate,
  commands,
}: {
  value: CedarFunction;
  state: CedarHouseState;
  router: CedarRouter;
  navigate: Navigate;
  commands: CedarCommands;
}) {
  return (
    <div className="cedar-focused-layout">
      <nav className="cedar-function-selectors" aria-label="Household functions">
        {cedarFunctions.map((item) => (
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
      <div className="cedar-focused-surface">
        <FunctionRegion
          value={value}
          state={state}
          router={router}
          navigate={navigate}
          commands={commands}
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
  commands,
  overview,
}: {
  value: CedarFunction;
  state: CedarHouseState;
  router: CedarRouter;
  navigate: Navigate;
  commands: CedarCommands;
  overview: boolean;
}) {
  const definition = cedarFunctions.find((item) => item.value === value)!;
  const presentation = state.presentation[value];
  return (
    <section
      className="cedar-function"
      data-function={value}
      aria-labelledby={`cedar-${value}-heading`}
    >
      <WgElbow weight={overview ? 'standard' : 'strong'}>
        <h2 id={`cedar-${value}-heading`}>{definition.label}</h2>
      </WgElbow>
      {presentation.dataState !== 'ready' ? (
        <p className="cedar-data-state">{presentation.message}</p>
      ) : null}
      <FunctionContent value={value} state={state} prominent={!overview} commands={commands} />
      {overview ? (
        <a
          className="cedar-function-link"
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
  prominent,
  commands,
}: {
  value: CedarFunction;
  state: CedarHouseState;
  prominent: boolean;
  commands: CedarCommands;
}) {
  switch (value) {
    case 'comfort':
      return <Comfort state={state} prominent={prominent} />;
    case 'access':
      return <Access state={state} prominent={prominent} commands={commands} />;
    case 'lighting':
      return <Lighting state={state} prominent={prominent} commands={commands} />;
    case 'energy':
      return <Energy state={state} prominent={prominent} />;
    case 'maintenance':
      return <Maintenance state={state} prominent={prominent} />;
  }
}

function MonitorPanel({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <WgPanel purpose="monitor" emphasis="strong" label={heading}>
      <h3 slot="heading">{heading}</h3>
      <div className="cedar-values">{children}</div>
    </WgPanel>
  );
}

function ControlPanel({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <WgPanel purpose="control" emphasis="standard" label={heading}>
      <h3 slot="heading">{heading}</h3>
      {children}
    </WgPanel>
  );
}

function Comfort({ state, prominent }: { state: CedarHouseState; prominent: boolean }) {
  return (
    <MonitorPanel heading="Current comfort">
      <WgMetric
        label="Indoor temperature"
        value={state.comfort.indoorTemperature?.toString() ?? ''}
        unit="°F"
        knowledge={state.comfort.indoorTemperature === null ? 'unknown' : 'confirmed'}
        loading={state.comfort.indoorTemperature === null}
        size={prominent ? 'prominent' : 'compact'}
      />
      <WgMetric
        label="Target"
        value={state.comfort.targetTemperature?.toString() ?? ''}
        unit="°F"
        loading={state.comfort.targetTemperature === null}
      />
      <WgStatusIndicator
        label="Air handler available"
        condition={state.maintenance.airHandlerAvailable ? 'positive' : 'critical'}
        knowledge="confirmed"
        size={prominent ? 'prominent' : 'compact'}
      />
      <WgKeyValue
        label="Air quality reading"
        value={state.comfort.airQualityKnowledge === 'stale' ? 'Last confirmed earlier' : 'Current'}
        knowledge={state.comfort.airQualityKnowledge}
      />
    </MonitorPanel>
  );
}

function Access({
  state,
  prominent,
  commands,
}: {
  state: CedarHouseState;
  prominent: boolean;
  commands: CedarCommands;
}) {
  const request = state.access.secureRequest;
  return (
    <div className="cedar-function-content">
      <MonitorPanel heading="Exterior access">
        {state.access.points.length === 0 ? <p>Loading exterior access values.</p> : null}
        {state.access.points.map((point) =>
          point.asserted === null ? (
            <WgStatusIndicator
              key={point.id}
              label={`${point.label} state unavailable`}
              condition={point.condition}
              knowledge={point.knowledge}
            />
          ) : (
            <WgBooleanValue
              key={point.id}
              label={point.label}
              asserted={point.asserted}
              assertedLabel={point.assertedLabel}
              notAssertedLabel={point.notAssertedLabel}
              knowledge={point.knowledge}
              presentation={prominent ? 'field' : 'rail'}
            />
          ),
        )}
      </MonitorPanel>
      <ControlPanel heading="Secure the house">
        <p>Request confirmed exterior locks and garage-door closure together.</p>
        <div className="cedar-control-actions">
          <WgButton
            appearance="primary"
            pending={request.state === 'pending'}
            disabled={state.access.points.length === 0}
            onClick={(event) => commands.showSecureConfirmation(event.currentTarget)}
          >
            Secure Cedar House
            <span slot="pending-label">Securing Cedar House</span>
          </WgButton>
        </div>
        <ControlResult request={request} idleMessage="No whole-house access request in progress." />
      </ControlPanel>
    </div>
  );
}

function Lighting({
  state,
  prominent,
  commands,
}: {
  state: CedarHouseState;
  prominent: boolean;
  commands: CedarCommands;
}) {
  const porch = selectPorchLight(state);
  const request = state.lighting.porchRequest;
  const requestedOn = !(porch?.confirmedOn ?? false);
  return (
    <div className="cedar-function-content">
      <WgValueTile label="Porch light" emphasis={prominent ? 'prominent' : 'standard'}>
        <h3 slot="heading">Porch light</h3>
        {porch ? (
          <WgBooleanValue
            slot="value"
            label="Porch light"
            asserted={porch.confirmedOn ?? false}
            assertedLabel="On"
            notAssertedLabel="Off"
            knowledge={porch.knowledge}
            presentation={prominent ? 'field' : 'rail'}
          />
        ) : (
          <WgBooleanValue
            slot="value"
            label="Porch light"
            assertedLabel="On"
            notAssertedLabel="Off"
            loading
          />
        )}
        <WgStatusIndicator
          slot="status"
          label={porch?.activity === 'pending' ? 'Change requested' : 'Controller ready'}
          condition="neutral"
          activity={porch?.activity ?? 'idle'}
        />
        <p>{request.message || 'Routine exterior lighting control is available.'}</p>
      </WgValueTile>
      <ControlPanel heading="Porch light control">
        <p>The displayed value changes only after the controller confirms the request.</p>
        <div className="cedar-control-actions">
          <WgButton
            appearance="secondary"
            pending={request.state === 'pending'}
            disabled={!porch || porch.knowledge === 'unavailable'}
            onClick={() => void commands.requestPorchLight(requestedOn)}
          >
            Turn porch light {requestedOn ? 'on' : 'off'}
            <span slot="pending-label">Requesting porch light {requestedOn ? 'on' : 'off'}</span>
          </WgButton>
        </div>
        <ControlResult request={request} idleMessage="No porch-light request in progress." />
      </ControlPanel>
    </div>
  );
}

function ControlResult({
  request,
  idleMessage,
}: {
  request: CedarHouseState['lighting']['porchRequest'];
  idleMessage: string;
}) {
  return (
    <p className="cedar-control-result" data-request-state={request.state}>
      <strong>{requestStateLabel(request.state)}:</strong> {request.message || idleMessage}
    </p>
  );
}

function requestStateLabel(state: CedarHouseState['lighting']['porchRequest']['state']): string {
  switch (state) {
    case 'idle':
      return 'Ready';
    case 'pending':
      return 'Pending';
    case 'succeeded':
      return 'Confirmed';
    case 'failed':
      return 'Not changed';
    case 'denied':
      return 'Permission required';
    case 'partial':
      return 'Partially completed';
  }
}

function secureConfirmationDescription(state: CedarHouseState): string {
  const unavailable = state.access.points.filter(({ knowledge }) => knowledge === 'unavailable');
  if (unavailable.length > 0) {
    return `Request the front door lock and garage door for Cedar House. ${unavailable.map(({ label }) => label).join(' and ')} cannot currently confirm a result, so completion may be partial.`;
  }
  const open = state.access.points.filter(({ asserted }) => asserted === false);
  if (open.length > 0) {
    return `Request the front door lock and garage door for Cedar House. Current exception: ${open.map(({ label }) => label).join(' and ')} is open.`;
  }
  return 'Request the front door lock and garage door for Cedar House. Confirmed access values will remain visible while the request is pending.';
}

function Energy({ state, prominent }: { state: CedarHouseState; prominent: boolean }) {
  return (
    <MonitorPanel heading="Current energy use">
      <WgMetric
        label="Whole-home demand"
        value={state.energy.currentWatts?.toLocaleString('en-US') ?? ''}
        unit="W"
        knowledge={state.energy.knowledge}
        loading={state.energy.currentWatts === null}
        size={prominent ? 'prominent' : 'compact'}
      />
      <p>Current demand is informational; change alone does not imply a problem.</p>
    </MonitorPanel>
  );
}

function Maintenance({ state, prominent }: { state: CedarHouseState; prominent: boolean }) {
  return (
    <MonitorPanel heading="Home maintenance">
      <WgStatusIndicator
        label={state.maintenance.filterDue ? 'HVAC return filter due' : 'HVAC filter current'}
        condition={state.maintenance.filterDue ? 'caution' : 'positive'}
        knowledge="confirmed"
        size={prominent ? 'prominent' : 'compact'}
      />
      <WgStatusIndicator
        label="Air handler available"
        condition={state.maintenance.airHandlerAvailable ? 'positive' : 'critical'}
        knowledge="confirmed"
      />
      <p>The filter needs attention; the air handler remains available and comfort is normal.</p>
    </MonitorPanel>
  );
}

function functionSummary(value: CedarFunction, state: CedarHouseState): string {
  switch (value) {
    case 'comfort':
      return state.comfort.indoorTemperature === null
        ? 'Loading confirmed values'
        : `${state.comfort.indoorTemperature}°F · Air handler available`;
    case 'access': {
      const request = state.access.secureRequest;
      if (request.state === 'pending') return 'Securing house · Confirmed values retained';
      if (request.state === 'partial') return 'Secure request partial · Garage unresolved';
      if (request.state === 'denied') return 'Secure request denied · Values unchanged';
      if (request.state === 'failed') return 'Secure request failed · Values unchanged';
      const unavailable = state.access.points.some(({ knowledge }) => knowledge === 'unavailable');
      const open = state.access.points.some(({ asserted }) => asserted === false);
      return unavailable
        ? 'Garage state unavailable'
        : open
          ? 'Opening needs attention'
          : 'Exterior closed and locked';
    }
    case 'lighting': {
      const porch = selectPorchLight(state);
      const request = state.lighting.porchRequest;
      if (request.state === 'pending') {
        return `Porch request pending · Confirmed ${porch?.confirmedOn ? 'on' : 'off'}`;
      }
      if (request.state === 'failed') {
        return `Porch request failed · Still ${porch?.confirmedOn ? 'on' : 'off'}`;
      }
      return porch ? `Porch light ${porch.confirmedOn ? 'on' : 'off'}` : 'Loading lighting values';
    }
    case 'energy':
      return state.energy.currentWatts === null
        ? 'Loading current demand'
        : `${state.energy.currentWatts.toLocaleString('en-US')} W now`;
    case 'maintenance':
      return state.maintenance.filterDue ? 'Filter due · Equipment available' : 'No work due';
  }
}

function AssetDetail({
  state,
  router,
  navigate,
  onRecordFilterReplaced,
}: {
  state: CedarHouseState;
  router: CedarRouter;
  navigate: Navigate;
  onRecordFilterReplaced(): void;
}) {
  const viewer = useRef<ComponentRef<typeof WgMediaViewer>>(null);
  const recordConfirmation = useRef<ComponentRef<typeof WgConfirmationDialog>>(null);
  const mediaState =
    state.maintenance.mediaState === 'available' ? 'ready' : state.maintenance.mediaState;
  const imageSource = '/assets/cedar-house-air-handler.jpg';
  const imageAlt =
    'Tall gray air handler in a utility closet with the return filter visible in the lower front slot';

  return (
    <div className="cedar-asset-detail">
      <a
        className="cedar-back-link"
        href={router.href({ name: 'function', value: 'maintenance' })}
        onClick={(event) => navigate(event, { name: 'function', value: 'maintenance' })}
      >
        Back to Maintenance
      </a>
      <div className="cedar-asset-overview">
        <figure className="cedar-asset-figure">
          <WgMedia aspect="landscape" fit="contain" boundary="strong" state={mediaState}>
            <img src={imageSource} width="1600" height="1200" alt={imageAlt} decoding="async" />
            <p slot="loading">
              Loading the equipment photo. The cabinet location and filter instructions remain
              available below.
            </p>
            <p slot="unavailable">
              Photo unavailable. Find the tall gray air-handler cabinet behind the louvered utility
              closet door; the return-filter slot is near the floor.
            </p>
            {mediaState === 'ready' ? (
              <WgButton
                slot="inspection"
                appearance="secondary"
                onClick={(event) => viewer.current?.show({ invoker: event.currentTarget })}
              >
                Inspect full-size air-handler photo
              </WgButton>
            ) : null}
          </WgMedia>
          <figcaption>
            Cedar House air handler in the utility closet. The return filter is visible in the lower
            front slot.
          </figcaption>
        </figure>
        <WgPanel purpose="information" emphasis="strong" label="Air-handler identification">
          <h2 id="cedar-air-handler-identity" slot="heading">
            Identify the air handler
          </h2>
          <div className="cedar-asset-facts">
            <WgKeyValue label="Location" value="Louvered utility closet" />
            <WgKeyValue label="Filter access" value="Lower front slot" />
            <WgKeyValue
              label="Equipment condition"
              value={state.maintenance.airHandlerAvailable ? 'Available' : 'Needs service'}
              condition={state.maintenance.airHandlerAvailable ? 'positive' : 'critical'}
            />
            <WgKeyValue
              label="Last resident record"
              value={formatCedarDate(state.maintenance.lastReplacedAt)}
            />
          </div>
          <p>
            The photo helps identify the cabinet and access slot. Confirm the installed filter size
            and airflow arrow on the existing filter before obtaining a replacement.
          </p>
        </WgPanel>
      </div>

      <div className="cedar-maintenance-layout">
        <WgPanel purpose="information" emphasis="standard" label="Return-filter instructions">
          <h2 slot="heading">Replace the return filter</h2>
          <ol className="cedar-maintenance-steps">
            <li>Set the HVAC system control to Off before opening the filter slot.</li>
            <li>Open the louvered utility closet and locate the lower front slot shown above.</li>
            <li>
              Note the existing airflow-arrow direction, remove the old filter, and insert a
              matching replacement in the same direction.
            </li>
            <li>Close the filter slot, clear the work area, and restore the HVAC control.</li>
          </ol>
          <p>
            Stop and use a qualified service professional if the cabinet is wet, damaged, or unsafe
            to access.
          </p>
        </WgPanel>
        <WgPanel purpose="control" emphasis="strong" label="Filter maintenance record">
          <h2 slot="heading">Record the completed work</h2>
          <WgStatusIndicator
            label={
              state.maintenance.filterDue ? 'HVAC return filter due' : 'Filter replacement recorded'
            }
            condition={state.maintenance.filterDue ? 'caution' : 'positive'}
            knowledge="confirmed"
          />
          <p>
            This creates a Cedar House resident record. It does not claim the HVAC equipment sensed
            or verified the physical replacement.
          </p>
          <WgButton
            appearance="primary"
            disabled={!state.maintenance.filterDue}
            onClick={(event) => recordConfirmation.current?.show({ invoker: event.currentTarget })}
          >
            {state.maintenance.filterDue ? 'Record filter replaced' : 'Filter replacement recorded'}
          </WgButton>
        </WgPanel>
      </div>

      <WgPanel purpose="information" emphasis="standard" label="Maintenance history">
        <h2 slot="heading">Maintenance history</h2>
        <p>Resident-entered service records for this Cedar House asset. Newest first.</p>
        <ol className="cedar-history" aria-label="Maintenance history">
          {state.maintenance.history.map((record) => (
            <li key={record.id}>
              <time dateTime={record.recordedAt}>{formatCedarDate(record.recordedAt)}</time>
              <strong>{record.summary}</strong>
              <span>Resident recorded · not sensor verified</span>
            </li>
          ))}
        </ol>
      </WgPanel>

      <WgMediaViewer
        ref={viewer}
        viewerId="cedar-air-handler-photo"
        state={mediaState}
        initialView="fit"
        closeLabel="Close air-handler photo"
        zoomInLabel="Zoom in"
        zoomOutLabel="Zoom out"
        fitLabel="Fit image"
        actualSizeLabel="Actual size"
      >
        <span slot="heading">Cedar House air handler</span>
        <span slot="context">Utility closet · lower front return-filter slot</span>
        <img src={imageSource} width="1600" height="1200" alt={imageAlt} decoding="async" />
        <p slot="loading">Loading the full-size air-handler photo.</p>
        <p slot="unavailable">
          Full-size photo unavailable. The cabinet and filter location remain described on the asset
          page.
        </p>
        <span slot="caption">
          Use the image to identify the equipment; follow the written replacement steps on the asset
          page.
        </span>
      </WgMediaViewer>

      <WgConfirmationDialog
        ref={recordConfirmation}
        dialogId="record-filter-replacement"
        actionLabel="Record filter replaced"
        cancelLabel="Do not record"
        actionAppearance="primary"
        attention="ordinary"
        initialFocus="cancel"
        onWgConfirmationAction={onRecordFilterReplaced}
      >
        <span slot="heading">Record the Cedar House filter replacement?</span>
        <p>
          Add a resident-entered maintenance record and clear the due item. This does not represent
          sensor verification.
        </p>
      </WgConfirmationDialog>
    </div>
  );
}

function formatCedarDate(value: string | null): string {
  if (!value) return 'No replacement recorded';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
