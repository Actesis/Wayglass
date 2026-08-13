import {
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgConfirmationDialog,
  WgElbow,
  WgKeyValue,
  WgMetric,
  WgPanel,
  WgStatusIndicator,
  WgThemeProvider,
  WgValueTile,
} from '@wayglass/react';
import {
  useEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
  type ComponentRef,
  type MouseEvent,
  type ReactNode,
} from 'react';

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
}: {
  router: CedarRouter;
  controls: HouseholdControlPort;
  clock: CedarClock;
}) {
  const routeState = useSyncExternalStore(router.subscribe, router.current);
  const [state, dispatch] = useReducer(reduceCedarHouse, routeState.scenario, (scenario) =>
    createCedarHouseState(scenario),
  );
  const requestSequence = useRef(0);
  const secureConfirmation = useRef<ComponentRef<typeof WgConfirmationDialog>>(null);
  const title = routeTitle(routeState.route);

  useEffect(() => {
    document.title = `${title} — Cedar House`;
  }, [title]);

  useEffect(() => {
    dispatch({ type: 'set-scenario', value: routeState.scenario });
  }, [routeState.scenario]);

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
            <AssetPlaceholder router={router} navigate={navigate} />
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
    </>
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

function AssetPlaceholder({ router, navigate }: { router: CedarRouter; navigate: Navigate }) {
  return (
    <WgPanel purpose="information" emphasis="strong" label="HVAC asset detail foundation">
      <h2 slot="heading">HVAC asset detail</h2>
      <p>The identifying image and maintenance inspection path arrive in the media slice.</p>
      <a
        slot="actions"
        href={router.href({ name: 'function', value: 'maintenance' })}
        onClick={(event) => navigate(event, { name: 'function', value: 'maintenance' })}
      >
        Back to Maintenance
      </a>
    </WgPanel>
  );
}
