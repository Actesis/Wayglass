export const northlineFunctions = [
  { value: 'receiving', label: 'Receiving' },
  { value: 'cold-storage', label: 'Cold storage' },
  { value: 'order-preparation', label: 'Order preparation' },
  { value: 'dispatch', label: 'Dispatch' },
] as const;

export type NorthlineFunction = (typeof northlineFunctions)[number]['value'];

export const northlineScenarios = [
  'steady',
  'initial-loading',
  'retained-refresh',
  'stale',
  'partial',
  'unavailable',
  'permission-denied',
  'request-pending',
  'request-failed',
  'recovered',
  'meaningful-update',
  'stale-trailer',
  'hold-denied',
  'hold-failed',
  'hold-confirmed',
  'inserted-exception',
] as const;

export type NorthlineScenario = (typeof northlineScenarios)[number];
export type NorthlineFixture = 'standard' | 'maximum';
export type Condition = 'neutral' | 'positive' | 'caution' | 'critical';
export type Knowledge = 'confirmed' | 'stale' | 'unavailable' | 'unknown';
export type Activity = 'idle' | 'pending';
export type DispatchReleaseState = 'scheduled' | 'held';
export type HoldRequestState = 'idle' | 'pending' | 'succeeded' | 'failed' | 'denied';
export type DispatchFilter = 'all' | 'needs-attention' | 'scheduled' | 'held';
export type DispatchSort = 'cutoff-ascending' | 'load-id';

export interface TemperatureObservation {
  value: number | null;
  unit: '°F';
  knowledge: Knowledge;
  observedAt: string | null;
}

export interface DispatchLoad {
  id: string;
  destination: string;
  carrier: string;
  trailerId: string;
  dispatchDoor: string;
  sealState: 'verified' | 'unverified';
  palletCount: number;
  cutoffAt: string;
  confirmedReleaseState: DispatchReleaseState;
  requestedReleaseState: DispatchReleaseState | null;
  condition: Condition;
  activity: Activity;
  trailerTemperature: TemperatureObservation;
  investigationAcknowledged: boolean;
}

export interface HoldRequest {
  id: string | null;
  loadId: string | null;
  state: HoldRequestState;
  message: string;
  requestedAt: string | null;
  completedAt: string | null;
}

export interface OperationalException {
  id: string;
  function: NorthlineFunction;
  loadId: string | null;
  summary: string;
  condition: Condition;
  knowledge: Knowledge;
  occurredAt: string;
  acknowledged: boolean;
}

export interface LoadTimelineEntry {
  id: string;
  loadId: string;
  label: string;
  detail: string;
  occurredAt: string | null;
  condition: Condition;
  knowledge: Knowledge;
  activity: Activity;
}

export interface NorthlineTelemetrySeries {
  id: string;
  label: string;
  unit: 'loads' | '%';
  samples: Array<{ observedAt: number; value: number; knowledge: Knowledge }>;
}

export interface NorthlineValidationValue {
  id: string;
  label: string;
  value: string;
}

export interface NorthlineValidationStatus {
  id: string;
  label: string;
  detail: string;
  condition: Condition;
  knowledge: Knowledge;
}

export interface NorthlineValidationEvent {
  id: string;
  summary: string;
  occurredAt: string;
  condition: Condition;
  knowledge: Knowledge;
}

interface FunctionPresentation {
  dataState: 'ready' | 'loading' | 'refreshing' | 'partial' | 'unavailable';
  retainedData: boolean;
  message: string;
}

export interface NorthlineState {
  fixture: NorthlineFixture;
  scenario: NorthlineScenario;
  selectedFunction: NorthlineFunction;
  revision: number;
  throughput: { receivedLoads: number | null; preparedLoads: number | null };
  capacity: { occupiedPositions: number | null; totalPositions: number | null };
  dispatch: {
    loads: DispatchLoad[];
    filter: DispatchFilter;
    sort: DispatchSort;
    holdRequest: HoldRequest;
  };
  exceptions: OperationalException[];
  presentation: Record<NorthlineFunction, FunctionPresentation>;
  retention: { eventLimit: 250; retainedEventCount: number };
  validation: {
    values: NorthlineValidationValue[];
    telemetry: NorthlineTelemetrySeries[];
    statuses: NorthlineValidationStatus[];
    events: NorthlineValidationEvent[];
  };
  announcement: { id: number; message: string } | null;
}

export type NorthlineAction =
  | { type: 'select-function'; value: NorthlineFunction }
  | { type: 'set-scenario'; value: NorthlineScenario; fixture: NorthlineFixture }
  | { type: 'set-dispatch-filter'; value: DispatchFilter }
  | { type: 'set-dispatch-sort'; value: DispatchSort }
  | { type: 'acknowledge-investigation'; exceptionId: string }
  | { type: 'request-dispatch-hold'; requestId: string; loadId: string; requestedAt: string }
  | {
      type: 'resolve-dispatch-hold';
      requestId: string;
      outcome: 'succeeded' | 'failed' | 'denied';
      completedAt: string;
    }
  | { type: 'replace-validation-rows' }
  | { type: 'replace-validation-telemetry' }
  | { type: 'insert-validation-events' }
  | { type: 'receive-meaningful-update' };

const observedAt = '2026-08-12T16:42:00-07:00';

function baselineLoads(): DispatchLoad[] {
  return [
    {
      id: 'NL-2048',
      destination: 'Mesa distribution center',
      carrier: 'Northline fleet 12',
      trailerId: 'TRL-412',
      dispatchDoor: 'D-07',
      sealState: 'verified',
      palletCount: 26,
      cutoffAt: '2026-08-12T17:15:00-07:00',
      confirmedReleaseState: 'scheduled',
      requestedReleaseState: null,
      condition: 'positive',
      activity: 'idle',
      trailerTemperature: { value: 35.6, unit: '°F', knowledge: 'confirmed', observedAt },
      investigationAcknowledged: false,
    },
    {
      id: 'NL-2049',
      destination: 'Tempe retail route',
      carrier: 'Northline fleet 7',
      trailerId: 'TRL-407',
      dispatchDoor: 'D-04',
      sealState: 'verified',
      palletCount: 18,
      cutoffAt: '2026-08-12T17:40:00-07:00',
      confirmedReleaseState: 'scheduled',
      requestedReleaseState: null,
      condition: 'positive',
      activity: 'idle',
      trailerTemperature: { value: 35.2, unit: '°F', knowledge: 'confirmed', observedAt },
      investigationAcknowledged: false,
    },
    {
      id: 'NL-2050',
      destination: 'Scottsdale retail route',
      carrier: 'Desert Freight 31',
      trailerId: 'TRL-831',
      dispatchDoor: 'D-09',
      sealState: 'unverified',
      palletCount: 22,
      cutoffAt: '2026-08-12T17:00:00-07:00',
      confirmedReleaseState: 'held',
      requestedReleaseState: null,
      condition: 'neutral',
      activity: 'idle',
      trailerTemperature: { value: 34.9, unit: '°F', knowledge: 'confirmed', observedAt },
      investigationAcknowledged: false,
    },
  ];
}

function emptyHoldRequest(): HoldRequest {
  return {
    id: null,
    loadId: null,
    state: 'idle',
    message: '',
    requestedAt: null,
    completedAt: null,
  };
}

function baselineState(): NorthlineState {
  return {
    fixture: 'standard',
    scenario: 'steady',
    selectedFunction: 'dispatch',
    revision: 0,
    throughput: { receivedLoads: 18, preparedLoads: 14 },
    capacity: { occupiedPositions: 326, totalPositions: 400 },
    dispatch: {
      loads: baselineLoads(),
      filter: 'all',
      sort: 'cutoff-ascending',
      holdRequest: emptyHoldRequest(),
    },
    exceptions: [],
    presentation: Object.fromEntries(
      northlineFunctions.map(({ value }) => [
        value,
        { dataState: 'ready', retainedData: true, message: 'Current operational data.' },
      ]),
    ) as NorthlineState['presentation'],
    retention: { eventLimit: 250, retainedEventCount: 0 },
    validation: { values: [], telemetry: [], statuses: [], events: [] },
    announcement: null,
  };
}

function applyStaleTrailer(state: NorthlineState): void {
  state.dispatch.loads[0] = {
    ...state.dispatch.loads[0]!,
    condition: 'caution',
    trailerTemperature: { value: 37.8, unit: '°F', knowledge: 'stale', observedAt },
  };
  state.exceptions.push({
    id: 'exception-nl-2048-temperature',
    function: 'dispatch',
    loadId: 'NL-2048',
    summary: 'Trailer temperature observation is stale near dispatch cutoff.',
    condition: 'caution',
    knowledge: 'stale',
    occurredAt: observedAt,
    acknowledged: false,
  });
  state.retention.retainedEventCount = Math.min(
    state.retention.eventLimit,
    state.retention.retainedEventCount + 1,
  );
}

function setAllPresentation(
  state: NorthlineState,
  dataState: FunctionPresentation['dataState'],
  retainedData: boolean,
  message: string,
): void {
  for (const { value } of northlineFunctions) {
    state.presentation[value] = { dataState, retainedData, message };
  }
}

function applyMaximumFixture(state: NorthlineState): void {
  state.dispatch.loads = Array.from({ length: 80 }, (_, index) => {
    const baseline = baselineLoads()[index % 3]!;
    return {
      ...baseline,
      id: index === 0 ? 'NL-2048' : `NL-${2048 + index}`,
      trailerId: `TRL-${412 + index}`,
      dispatchDoor: `D-${String((index % 12) + 1).padStart(2, '0')}`,
      sealState: index % 7 === 0 ? 'unverified' : 'verified',
      palletCount: 18 + (index % 12),
      cutoffAt: new Date(Date.parse('2026-08-12T17:15:00-07:00') + index * 60_000).toISOString(),
      trailerTemperature: { ...baseline.trailerTemperature },
    };
  });
  state.validation.values = Array.from({ length: 24 }, (_, index) => ({
    id: `northline-value-${index + 1}`,
    label: `Operational reference ${index + 1}`,
    value: index % 2 === 0 ? `${40 + index} loads` : `${62 + index}%`,
  }));
  const windowStart = Date.parse('2026-08-12T15:30:00-07:00');
  state.validation.telemetry = Array.from({ length: 8 }, (_, seriesIndex) => ({
    id: `northline-telemetry-${seriesIndex + 1}`,
    label: `Operational trend ${seriesIndex + 1}`,
    unit: seriesIndex % 2 === 0 ? 'loads' : '%',
    samples: Array.from({ length: 120 }, (_, sampleIndex) => ({
      observedAt: windowStart + sampleIndex * 30_000,
      value: 28 + seriesIndex * 6 + ((sampleIndex * (seriesIndex + 2)) % 20),
      knowledge: 'confirmed' as const,
    })),
  }));
  state.validation.statuses = Array.from({ length: 100 }, (_, index) => ({
    id: `northline-status-${index + 1}`,
    label: `Operational source ${index + 1}`,
    detail: `Current authored status for source ${index + 1}.`,
    condition: index % 17 === 0 ? ('caution' as const) : ('neutral' as const),
    knowledge: index % 19 === 0 ? ('stale' as const) : ('confirmed' as const),
  }));
  state.validation.events = Array.from({ length: 250 }, (_, index) => ({
    id: `northline-event-${index + 1}`,
    summary: `Retained operations event ${index + 1}`,
    occurredAt: new Date(Date.parse(observedAt) - index * 60_000).toISOString(),
    condition: index % 23 === 0 ? ('caution' as const) : ('neutral' as const),
    knowledge: 'confirmed' as const,
  }));
  state.retention.retainedEventCount = 250;
}

export function createNorthlineState(
  scenario: NorthlineScenario = 'stale-trailer',
  fixture: NorthlineFixture = 'standard',
): NorthlineState {
  const state = baselineState();
  state.scenario = scenario;
  state.fixture = fixture;
  if (fixture === 'maximum') applyMaximumFixture(state);

  switch (scenario) {
    case 'initial-loading':
      state.throughput = { receivedLoads: null, preparedLoads: null };
      state.capacity = { occupiedPositions: null, totalPositions: null };
      state.dispatch.loads = [];
      state.exceptions = [];
      setAllPresentation(state, 'loading', false, 'Loading; no confirmed values yet.');
      break;
    case 'retained-refresh':
      setAllPresentation(state, 'refreshing', true, 'Refreshing; confirmed records retained.');
      break;
    case 'partial':
      applyStaleTrailer(state);
      state.presentation.dispatch = {
        dataState: 'partial',
        retainedData: true,
        message: 'Refrigeration telemetry is partial; confirmed load records are retained.',
      };
      break;
    case 'unavailable':
      applyStaleTrailer(state);
      state.dispatch.loads[0]!.trailerTemperature = {
        value: null,
        unit: '°F',
        knowledge: 'unavailable',
        observedAt: null,
      };
      state.exceptions[0]!.knowledge = 'unavailable';
      state.presentation.dispatch = {
        dataState: 'unavailable',
        retainedData: true,
        message: 'Trailer temperature is unavailable; release state remains confirmed.',
      };
      break;
    case 'permission-denied':
    case 'hold-denied':
      applyStaleTrailer(state);
      state.dispatch.holdRequest = {
        id: 'hold-denied',
        loadId: 'NL-2048',
        state: 'denied',
        message:
          'Dispatch hold was not requested. Permission is required; NL-2048 remains scheduled.',
        requestedAt: observedAt,
        completedAt: observedAt,
      };
      break;
    case 'request-pending':
      applyStaleTrailer(state);
      state.dispatch.loads[0] = {
        ...state.dispatch.loads[0]!,
        requestedReleaseState: 'held',
        activity: 'pending',
      };
      state.dispatch.holdRequest = {
        id: 'hold-pending',
        loadId: 'NL-2048',
        state: 'pending',
        message: 'Dispatch hold requested. NL-2048 remains scheduled until confirmed.',
        requestedAt: observedAt,
        completedAt: null,
      };
      break;
    case 'request-failed':
    case 'hold-failed':
      applyStaleTrailer(state);
      state.dispatch.holdRequest = {
        id: 'hold-failed',
        loadId: 'NL-2048',
        state: 'failed',
        message: 'Dispatch hold failed. NL-2048 remains scheduled.',
        requestedAt: observedAt,
        completedAt: observedAt,
      };
      break;
    case 'hold-confirmed':
      applyStaleTrailer(state);
      state.dispatch.loads[0] = {
        ...state.dispatch.loads[0]!,
        confirmedReleaseState: 'held',
      };
      state.dispatch.holdRequest = {
        id: 'hold-confirmed',
        loadId: 'NL-2048',
        state: 'succeeded',
        message: 'NL-2048 is confirmed on dispatch hold.',
        requestedAt: observedAt,
        completedAt: '2026-08-12T16:43:00-07:00',
      };
      break;
    case 'meaningful-update':
    case 'inserted-exception':
      applyStaleTrailer(state);
      state.revision = 1;
      state.exceptions.unshift({
        id: 'exception-nl-2051-door',
        function: 'receiving',
        loadId: 'NL-2051',
        summary: 'Receiving door 4 is delayed for an inbound load.',
        condition: 'caution',
        knowledge: 'confirmed',
        occurredAt: '2026-08-12T16:45:00-07:00',
        acknowledged: false,
      });
      state.retention.retainedEventCount = 2;
      break;
    case 'recovered':
      applyStaleTrailer(state);
      state.dispatch.loads[0]!.trailerTemperature = {
        value: 35.5,
        unit: '°F',
        knowledge: 'confirmed',
        observedAt: '2026-08-12T16:47:00-07:00',
      };
      state.dispatch.loads[0]!.condition = 'positive';
      state.exceptions[0]!.knowledge = 'confirmed';
      state.exceptions[0]!.summary =
        'Trailer temperature reporting recovered; current observation confirmed.';
      state.presentation.dispatch.message =
        'Current trailer temperature restored; history retained.';
      break;
    case 'stale':
    case 'stale-trailer':
      applyStaleTrailer(state);
      break;
    case 'steady':
      break;
  }
  return state;
}

export function reduceNorthline(state: NorthlineState, action: NorthlineAction): NorthlineState {
  switch (action.type) {
    case 'select-function':
      return { ...state, selectedFunction: action.value };
    case 'set-scenario':
      return {
        ...createNorthlineState(action.value, action.fixture),
        selectedFunction: state.selectedFunction,
      };
    case 'set-dispatch-filter':
      return { ...state, dispatch: { ...state.dispatch, filter: action.value } };
    case 'set-dispatch-sort':
      return { ...state, dispatch: { ...state.dispatch, sort: action.value } };
    case 'acknowledge-investigation': {
      const loadId = state.exceptions.find(
        (exception) => exception.id === action.exceptionId,
      )?.loadId;
      return {
        ...state,
        dispatch: {
          ...state.dispatch,
          loads: state.dispatch.loads.map((load) =>
            load.id === loadId ? { ...load, investigationAcknowledged: true } : load,
          ),
        },
        exceptions: state.exceptions.map((exception) =>
          exception.id === action.exceptionId ? { ...exception, acknowledged: true } : exception,
        ),
        announcement: null,
      };
    }
    case 'request-dispatch-hold': {
      const load = selectLoad(state, action.loadId);
      if (!load || load.confirmedReleaseState === 'held') return state;
      return {
        ...state,
        dispatch: {
          ...state.dispatch,
          loads: state.dispatch.loads.map((item) =>
            item.id === action.loadId
              ? { ...item, requestedReleaseState: 'held', activity: 'pending' }
              : item,
          ),
          holdRequest: {
            id: action.requestId,
            loadId: action.loadId,
            state: 'pending',
            message: `Dispatch hold requested. ${action.loadId} remains scheduled until confirmed.`,
            requestedAt: action.requestedAt,
            completedAt: null,
          },
        },
        announcement: null,
      };
    }
    case 'resolve-dispatch-hold': {
      const request = state.dispatch.holdRequest;
      if (request.state !== 'pending' || request.id !== action.requestId || !request.loadId) {
        return state;
      }
      const succeeded = action.outcome === 'succeeded';
      const message = succeeded
        ? `${request.loadId} is confirmed on dispatch hold.`
        : action.outcome === 'denied'
          ? `Dispatch hold was not requested. Permission is required; ${request.loadId} remains scheduled.`
          : `Dispatch hold failed. ${request.loadId} remains scheduled.`;
      return {
        ...state,
        dispatch: {
          ...state.dispatch,
          loads: state.dispatch.loads.map((load) =>
            load.id === request.loadId
              ? {
                  ...load,
                  confirmedReleaseState: succeeded ? 'held' : load.confirmedReleaseState,
                  requestedReleaseState: null,
                  activity: 'idle',
                }
              : load,
          ),
          holdRequest: {
            ...request,
            state: action.outcome,
            message,
            completedAt: action.completedAt,
          },
        },
        announcement: { id: (state.announcement?.id ?? 0) + 1, message },
      };
    }
    case 'replace-validation-rows':
      return {
        ...state,
        revision: state.revision + 1,
        dispatch: {
          ...state.dispatch,
          loads: state.dispatch.loads.map((load, index) =>
            index < 20 ? { ...load, palletCount: load.palletCount + 1 } : load,
          ),
        },
        announcement: null,
      };
    case 'replace-validation-telemetry':
      return {
        ...state,
        revision: state.revision + 1,
        validation: {
          ...state.validation,
          telemetry: state.validation.telemetry.map((series) => ({
            ...series,
            samples: series.samples.map((sample) => ({ ...sample, value: sample.value + 1 })),
          })),
        },
        announcement: null,
      };
    case 'insert-validation-events': {
      const inserted = Array.from({ length: 25 }, (_, index) => ({
        id: `northline-inserted-event-${state.revision + 1}-${index + 1}`,
        summary: `New retained operations event ${index + 1}`,
        occurredAt: new Date(Date.parse(observedAt) + (index + 1) * 1000).toISOString(),
        condition: 'neutral' as const,
        knowledge: 'confirmed' as const,
      }));
      return {
        ...state,
        revision: state.revision + 1,
        validation: {
          ...state.validation,
          events: [...inserted, ...state.validation.events].slice(0, state.retention.eventLimit),
        },
        announcement: null,
      };
    }
    case 'receive-meaningful-update': {
      if (state.revision > 0) return state;
      const insertedException: OperationalException = {
        id: 'exception-nl-2051-door',
        function: 'receiving',
        loadId: 'NL-2051',
        summary: 'Receiving door 4 is delayed for an inbound load.',
        condition: 'caution',
        knowledge: 'confirmed',
        occurredAt: '2026-08-12T16:45:00-07:00',
        acknowledged: false,
      };
      return {
        ...state,
        revision: 1,
        exceptions: [insertedException, ...state.exceptions].slice(0, state.retention.eventLimit),
        retention: {
          ...state.retention,
          retainedEventCount: Math.min(
            state.retention.eventLimit,
            state.retention.retainedEventCount + 1,
          ),
        },
        announcement: null,
      };
    }
  }
}

export function selectLoad(state: NorthlineState, loadId: string): DispatchLoad | undefined {
  return state.dispatch.loads.find(({ id }) => id === loadId);
}

export function selectDispatchLoads(state: NorthlineState): DispatchLoad[] {
  const filtered = state.dispatch.loads.filter((load) => {
    switch (state.dispatch.filter) {
      case 'all':
        return true;
      case 'needs-attention':
        return load.condition === 'caution' || load.condition === 'critical';
      case 'scheduled':
      case 'held':
        return load.confirmedReleaseState === state.dispatch.filter;
    }
  });
  return [...filtered].sort((left, right) =>
    state.dispatch.sort === 'load-id'
      ? left.id.localeCompare(right.id)
      : left.cutoffAt.localeCompare(right.cutoffAt),
  );
}

export interface DispatchSummary {
  scheduled: number;
  held: number;
  needsAttention: number;
  unknownTemperature: number;
  earliestCutoffAt: string | null;
}

export function selectDispatchSummary(state: NorthlineState): DispatchSummary {
  return state.dispatch.loads.reduce<DispatchSummary>(
    (summary, load) => ({
      scheduled: summary.scheduled + (load.confirmedReleaseState === 'scheduled' ? 1 : 0),
      held: summary.held + (load.confirmedReleaseState === 'held' ? 1 : 0),
      needsAttention:
        summary.needsAttention +
        (load.condition === 'caution' || load.condition === 'critical' ? 1 : 0),
      unknownTemperature:
        summary.unknownTemperature +
        (load.trailerTemperature.knowledge === 'unavailable' ||
        load.trailerTemperature.knowledge === 'unknown'
          ? 1
          : 0),
      earliestCutoffAt:
        summary.earliestCutoffAt === null || load.cutoffAt < summary.earliestCutoffAt
          ? load.cutoffAt
          : summary.earliestCutoffAt,
    }),
    { scheduled: 0, held: 0, needsAttention: 0, unknownTemperature: 0, earliestCutoffAt: null },
  );
}

export function selectFunctionExceptions(
  state: NorthlineState,
  value: NorthlineFunction,
): OperationalException[] {
  return state.exceptions.filter((exception) => exception.function === value);
}

export function selectLoadTimeline(state: NorthlineState, loadId: string): LoadTimelineEntry[] {
  const load = selectLoad(state, loadId);
  if (!load) return [];
  const temperature = load.trailerTemperature;
  return [
    {
      id: `${load.id}-temperature-current`,
      loadId: load.id,
      label:
        temperature.knowledge === 'unavailable'
          ? 'Trailer temperature unavailable'
          : 'Trailer temperature observed',
      detail:
        temperature.value === null
          ? 'No trustworthy current temperature is available.'
          : `${temperature.value} ${temperature.unit}; knowledge is ${temperature.knowledge}.`,
      occurredAt: temperature.observedAt,
      condition: load.condition,
      knowledge: temperature.knowledge,
      activity: load.activity,
    },
    {
      id: `${load.id}-release-scheduled`,
      loadId: load.id,
      label:
        load.confirmedReleaseState === 'held'
          ? 'Dispatch hold confirmed'
          : 'Load scheduled for dispatch',
      detail: `Confirmed release state: ${load.confirmedReleaseState}.`,
      occurredAt: '2026-08-12T15:55:00-07:00',
      condition: 'neutral',
      knowledge: 'confirmed',
      activity: load.activity,
    },
  ];
}
