export const cedarFunctions = [
  { value: 'comfort', label: 'Comfort and air' },
  { value: 'access', label: 'Access and safety' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'energy', label: 'Energy' },
  { value: 'maintenance', label: 'Maintenance' },
] as const;

export type CedarFunction = (typeof cedarFunctions)[number]['value'];

export const cedarScenarios = [
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
  'secure-partial',
  'maintenance-due',
  'media-loading',
  'media-unavailable',
] as const;

export type CedarScenario = (typeof cedarScenarios)[number];
export type Condition = 'neutral' | 'positive' | 'caution' | 'critical';
export type Knowledge = 'confirmed' | 'stale' | 'unavailable' | 'unknown';
export type Activity = 'idle' | 'pending';
export type RequestState = 'idle' | 'pending' | 'succeeded' | 'failed' | 'denied' | 'partial';

export interface AccessPoint {
  id: string;
  label: string;
  kind: 'door' | 'lock';
  asserted: boolean | null;
  assertedLabel: string;
  notAssertedLabel: string;
  condition: Condition;
  knowledge: Knowledge;
  observedAt: string | null;
}

export interface Light {
  id: string;
  label: string;
  confirmedOn: boolean | null;
  requestedOn: boolean | null;
  condition: Condition;
  knowledge: Knowledge;
  activity: Activity;
  observedAt: string | null;
}

export interface HouseholdRequest {
  id: string | null;
  state: RequestState;
  message: string;
  requestedAt: string | null;
  completedAt: string | null;
}

export interface CedarHouseState {
  scenario: CedarScenario;
  selectedFunction: CedarFunction;
  revision: number;
  comfort: {
    indoorTemperature: number | null;
    targetTemperature: number | null;
    hvacActivity: 'idle' | 'heating' | 'cooling' | null;
    airQualityKnowledge: Knowledge;
    observedAt: string | null;
  };
  access: { points: AccessPoint[]; secureRequest: HouseholdRequest };
  lighting: { lights: Light[]; porchRequest: HouseholdRequest };
  energy: { currentWatts: number | null; knowledge: Knowledge; observedAt: string | null };
  maintenance: {
    filterDue: boolean;
    airHandlerAvailable: boolean;
    lastReplacedAt: string | null;
    mediaState: 'available' | 'loading' | 'unavailable';
  };
  presentation: Record<
    CedarFunction,
    {
      dataState: 'ready' | 'loading' | 'refreshing' | 'partial' | 'unavailable';
      retainedData: boolean;
      message: string;
    }
  >;
  announcement: { id: number; message: string } | null;
}

export type CedarHouseAction =
  | { type: 'select-function'; value: CedarFunction }
  | { type: 'set-scenario'; value: CedarScenario }
  | { type: 'request-porch-light'; requestedOn: boolean; requestId: string; requestedAt: string }
  | {
      type: 'resolve-porch-light';
      requestId: string;
      outcome: 'succeeded' | 'failed';
      completedAt: string;
    }
  | { type: 'request-secure-house'; requestId: string; requestedAt: string }
  | {
      type: 'resolve-secure-house';
      requestId: string;
      outcome: 'succeeded' | 'partial' | 'failed' | 'denied';
      completedAt: string;
    }
  | { type: 'receive-meaningful-update' };

const observedAt = '2026-08-12T18:30:00-07:00';

function emptyRequest(): HouseholdRequest {
  return { id: null, state: 'idle', message: '', requestedAt: null, completedAt: null };
}

function baselineState(): CedarHouseState {
  return {
    scenario: 'steady',
    selectedFunction: 'comfort',
    revision: 0,
    comfort: {
      indoorTemperature: 74,
      targetTemperature: 74,
      hvacActivity: 'idle',
      airQualityKnowledge: 'confirmed',
      observedAt,
    },
    access: {
      points: [
        {
          id: 'front-door-lock',
          label: 'Front door lock',
          kind: 'lock',
          asserted: true,
          assertedLabel: 'Locked',
          notAssertedLabel: 'Unlocked',
          condition: 'neutral',
          knowledge: 'confirmed',
          observedAt,
        },
        {
          id: 'garage-door',
          label: 'Garage door',
          kind: 'door',
          asserted: true,
          assertedLabel: 'Closed',
          notAssertedLabel: 'Open',
          condition: 'neutral',
          knowledge: 'confirmed',
          observedAt,
        },
      ],
      secureRequest: emptyRequest(),
    },
    lighting: {
      lights: [
        {
          id: 'porch-light',
          label: 'Porch light',
          confirmedOn: false,
          requestedOn: null,
          condition: 'neutral',
          knowledge: 'confirmed',
          activity: 'idle',
          observedAt,
        },
      ],
      porchRequest: emptyRequest(),
    },
    energy: { currentWatts: 1380, knowledge: 'confirmed', observedAt },
    maintenance: {
      filterDue: true,
      airHandlerAvailable: true,
      lastReplacedAt: '2026-05-10T10:15:00-07:00',
      mediaState: 'available',
    },
    presentation: Object.fromEntries(
      cedarFunctions.map(({ value }) => [
        value,
        { dataState: 'ready', retainedData: true, message: 'Current confirmed data.' },
      ]),
    ) as CedarHouseState['presentation'],
    announcement: null,
  };
}

function completedRequest(
  id: string,
  state: Exclude<RequestState, 'idle' | 'pending'>,
  message: string,
): HouseholdRequest {
  return { id, state, message, requestedAt: observedAt, completedAt: observedAt };
}

export function createCedarHouseState(scenario: CedarScenario = 'steady'): CedarHouseState {
  const state = baselineState();
  state.scenario = scenario;

  switch (scenario) {
    case 'initial-loading':
      state.comfort = {
        indoorTemperature: null,
        targetTemperature: null,
        hvacActivity: null,
        airQualityKnowledge: 'unknown',
        observedAt: null,
      };
      state.access.points = [];
      state.lighting.lights = [];
      state.energy = { currentWatts: null, knowledge: 'unknown', observedAt: null };
      setAllPresentation(state, 'loading', false, 'Loading; no confirmed values yet.');
      break;
    case 'retained-refresh':
      setAllPresentation(state, 'refreshing', true, 'Refreshing; confirmed values retained.');
      break;
    case 'stale':
      state.comfort.airQualityKnowledge = 'stale';
      state.presentation.comfort.message = 'Air-quality observation is stale.';
      break;
    case 'partial':
      state.presentation.access = {
        dataState: 'partial',
        retainedData: true,
        message: 'Some access controllers are unavailable; confirmed values retained.',
      };
      state.access.points[1] = {
        ...state.access.points[1]!,
        asserted: null,
        knowledge: 'unavailable',
        observedAt: null,
      };
      break;
    case 'unavailable':
      state.presentation.access = {
        dataState: 'unavailable',
        retainedData: true,
        message: 'Garage-door controller is unavailable; other confirmed values retained.',
      };
      state.access.points[1] = {
        ...state.access.points[1]!,
        asserted: null,
        knowledge: 'unavailable',
        observedAt: null,
      };
      break;
    case 'permission-denied':
      state.access.secureRequest = completedRequest(
        'secure-denied',
        'denied',
        'Secure Cedar House was not requested. Permission is required; confirmed access state is unchanged.',
      );
      break;
    case 'request-pending':
      state.lighting.lights[0] = {
        ...state.lighting.lights[0]!,
        requestedOn: true,
        activity: 'pending',
      };
      state.lighting.porchRequest = {
        id: 'porch-pending',
        state: 'pending',
        message: 'Porch light on requested. Its confirmed value has not changed.',
        requestedAt: observedAt,
        completedAt: null,
      };
      break;
    case 'request-failed':
      state.lighting.porchRequest = completedRequest(
        'porch-failed',
        'failed',
        'Porch light did not change. It remains off. Try again when the controller is available.',
      );
      break;
    case 'secure-partial':
      state.access.points[1] = {
        ...state.access.points[1]!,
        asserted: false,
        condition: 'caution',
      };
      state.access.secureRequest = completedRequest(
        'secure-partial',
        'partial',
        'Cedar House was partially secured. The garage door remains open.',
      );
      break;
    case 'media-loading':
      state.maintenance.mediaState = 'loading';
      break;
    case 'media-unavailable':
      state.maintenance.mediaState = 'unavailable';
      break;
    case 'meaningful-update':
      state.revision = 1;
      state.energy.currentWatts = 1425;
      break;
    case 'recovered':
      setAllPresentation(state, 'ready', true, 'Current data restored; prior history retained.');
      break;
    case 'steady':
    case 'maintenance-due':
      break;
  }

  return state;
}

function setAllPresentation(
  state: CedarHouseState,
  dataState: CedarHouseState['presentation'][CedarFunction]['dataState'],
  retainedData: boolean,
  message: string,
): void {
  for (const { value } of cedarFunctions) {
    state.presentation[value] = { dataState, retainedData, message };
  }
}

export function reduceCedarHouse(
  state: CedarHouseState,
  action: CedarHouseAction,
): CedarHouseState {
  switch (action.type) {
    case 'select-function':
      return { ...state, selectedFunction: action.value };
    case 'set-scenario':
      return {
        ...createCedarHouseState(action.value),
        selectedFunction: state.selectedFunction,
      };
    case 'request-porch-light':
      return {
        ...state,
        lighting: {
          lights: state.lighting.lights.map((light) =>
            light.id === 'porch-light'
              ? { ...light, requestedOn: action.requestedOn, activity: 'pending' }
              : light,
          ),
          porchRequest: {
            id: action.requestId,
            state: 'pending',
            message: `Porch light ${action.requestedOn ? 'on' : 'off'} requested. Its confirmed value has not changed.`,
            requestedAt: action.requestedAt,
            completedAt: null,
          },
        },
        announcement: null,
      };
    case 'resolve-porch-light': {
      if (
        state.lighting.porchRequest.state !== 'pending' ||
        state.lighting.porchRequest.id !== action.requestId
      ) {
        return state;
      }
      const porch = selectPorchLight(state);
      const succeeded = action.outcome === 'succeeded';
      const message = succeeded
        ? `Porch light confirmed ${porch?.requestedOn ? 'on' : 'off'}.`
        : `Porch light did not change. It remains ${porch?.confirmedOn ? 'on' : 'off'}.`;
      return {
        ...state,
        lighting: {
          lights: state.lighting.lights.map((light) =>
            light.id === 'porch-light'
              ? {
                  ...light,
                  confirmedOn:
                    succeeded && light.requestedOn !== null ? light.requestedOn : light.confirmedOn,
                  requestedOn: null,
                  activity: 'idle',
                }
              : light,
          ),
          porchRequest: {
            ...state.lighting.porchRequest,
            state: action.outcome,
            message,
            completedAt: action.completedAt,
          },
        },
        announcement: { id: (state.announcement?.id ?? 0) + 1, message },
      };
    }
    case 'request-secure-house':
      return {
        ...state,
        access: {
          ...state.access,
          secureRequest: {
            id: action.requestId,
            state: 'pending',
            message: 'Secure Cedar House requested. Confirmed access values have not changed.',
            requestedAt: action.requestedAt,
            completedAt: null,
          },
        },
        announcement: null,
      };
    case 'resolve-secure-house': {
      if (
        state.access.secureRequest.state !== 'pending' ||
        state.access.secureRequest.id !== action.requestId
      ) {
        return state;
      }
      const message = secureOutcomeMessage(action.outcome);
      return {
        ...state,
        access: {
          points: state.access.points.map((point) =>
            action.outcome === 'succeeded' ||
            (action.outcome === 'partial' && point.id === 'front-door-lock')
              ? { ...point, asserted: true, knowledge: 'confirmed' }
              : point,
          ),
          secureRequest: {
            ...state.access.secureRequest,
            state: action.outcome,
            message,
            completedAt: action.completedAt,
          },
        },
        announcement: { id: (state.announcement?.id ?? 0) + 1, message },
      };
    }
    case 'receive-meaningful-update':
      if (state.revision > 0) return state;
      return {
        ...state,
        revision: 1,
        energy: { ...state.energy, currentWatts: 1425, observedAt },
        announcement: null,
      };
  }
}

function secureOutcomeMessage(outcome: 'succeeded' | 'partial' | 'failed' | 'denied'): string {
  switch (outcome) {
    case 'succeeded':
      return 'Cedar House is secured. Exterior locks and the garage door are confirmed.';
    case 'partial':
      return 'Cedar House was partially secured. The garage door remains unresolved.';
    case 'failed':
      return 'Cedar House could not be secured. Confirmed access state is unchanged.';
    case 'denied':
      return 'Secure Cedar House was not requested. Permission is required; confirmed access state is unchanged.';
  }
}

export function selectPorchLight(state: CedarHouseState): Light | undefined {
  return state.lighting.lights.find(({ id }) => id === 'porch-light');
}

export function selectUnsettledReasons(state: CedarHouseState): string[] {
  const reasons: string[] = [];
  const garage = state.access.points.find(({ id }) => id === 'garage-door');
  if (garage?.asserted === false) reasons.push('Garage door is open');
  if (garage?.knowledge === 'unavailable') reasons.push('Garage door state is unavailable');
  if (state.maintenance.filterDue) reasons.push('HVAC return filter is due');
  return reasons;
}
