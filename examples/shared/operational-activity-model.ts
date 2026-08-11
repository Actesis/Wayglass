export const operationalActivityFunctions = [
  { value: 'intake', label: 'Intake' },
  { value: 'processing', label: 'Processing' },
  { value: 'delivery', label: 'Delivery' },
] as const;

export const operationalActivityScenarios = [
  'steady',
  'initial-loading',
  'retained-refresh',
  'stale-partial',
  'unavailable',
  'filtered-empty',
  'failed-request',
  'recovered',
  'live-update',
] as const;

export type OperationalFunction = (typeof operationalActivityFunctions)[number]['value'];
export type OperationalScenario = (typeof operationalActivityScenarios)[number];
export type OperationalCondition =
  'neutral' | 'informational' | 'positive' | 'caution' | 'critical';
export type OperationalKnowledge =
  'confirmed' | 'inferred' | 'stale' | 'unknown' | 'conflicting' | 'unavailable';
export type OperationalActivity = 'idle' | 'pending';

export interface OperationalKnownState {
  readonly condition: OperationalCondition;
  readonly knowledge: OperationalKnowledge;
  readonly activity: OperationalActivity;
}

export interface IntakeTelemetrySample {
  readonly key: string;
  readonly timestamp: string;
  readonly value?: number;
  readonly knowledge: OperationalKnowledge;
}

export interface IntakeSource {
  readonly key: string;
  readonly label: string;
  readonly detail: string;
  readonly state: OperationalKnownState;
}

export type IntakeEventCategory = 'arrival' | 'validation' | 'routing';

export interface IntakeEvent {
  readonly key: string;
  readonly timestamp: string;
  readonly message: string;
  readonly source: string;
  readonly category: IntakeEventCategory;
  readonly state: OperationalKnownState;
}

export interface ProcessingMetric {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly trend: 'steady' | 'rising' | 'falling';
  readonly comparison: string;
  readonly state: OperationalKnownState;
}

export interface ProcessingMilestone {
  readonly key: string;
  readonly timestamp: string;
  readonly title: string;
  readonly detail: string;
  readonly chronology: 'past' | 'current' | 'future';
  readonly kind: 'event' | 'interval';
  readonly state: OperationalKnownState;
}

export type ProcessingRequestState = 'idle' | 'pending' | 'accepted' | 'rejected' | 'unavailable';

export interface ProcessingRequest {
  readonly state: ProcessingRequestState;
  readonly confirmedGateOpen: boolean | null;
  readonly message: string;
}

export interface DeliveryDetail {
  readonly key: string;
  readonly label: string;
  readonly value?: string;
  readonly state: OperationalKnownState;
}

export interface DeliveryStatus {
  readonly key: string;
  readonly label: string;
  readonly detail: string;
  readonly updatedAt: string;
  readonly state: OperationalKnownState;
}

export interface DeliveryRecord {
  readonly key: string;
  readonly reference: string;
  readonly destination: string;
  readonly updatedAt: string;
  readonly owner: string;
  readonly state: OperationalKnownState;
}

export type FunctionDataState =
  'ready' | 'loading' | 'refreshing' | 'partial' | 'unavailable' | 'failed' | 'recovered';

export interface FunctionPresentation {
  readonly dataState: FunctionDataState;
  readonly busy: boolean;
  readonly retainedData: boolean;
  readonly feedback: string;
}

export interface IntakeFilter {
  readonly query: string;
  readonly category: 'all' | IntakeEventCategory;
}

export interface DeliveryFilter {
  readonly query: string;
  readonly condition: 'all' | OperationalCondition;
}

export interface FilterState<TFilter> {
  readonly draft: TFilter;
  readonly applied: TFilter;
}

export type DeliverySort = 'updated-descending' | 'updated-ascending';

export interface OperationalAnnouncement {
  readonly message: string;
  readonly politeness: 'polite';
}

export interface OperationalActivityState {
  readonly scenario: OperationalScenario;
  readonly selectedFunction: OperationalFunction;
  readonly revision: number;
  readonly presentation: Readonly<Record<OperationalFunction, FunctionPresentation>>;
  readonly intake: {
    readonly throughput: number | null;
    readonly telemetry: readonly IntakeTelemetrySample[];
    readonly sources: readonly IntakeSource[];
    readonly events: readonly IntakeEvent[];
    readonly filter: FilterState<IntakeFilter>;
  };
  readonly processing: {
    readonly metrics: readonly ProcessingMetric[];
    readonly timeline: readonly ProcessingMilestone[];
    readonly request: ProcessingRequest;
  };
  readonly delivery: {
    readonly details: readonly DeliveryDetail[];
    readonly statuses: readonly DeliveryStatus[];
    readonly records: readonly DeliveryRecord[];
    readonly filter: FilterState<DeliveryFilter>;
    readonly sort: DeliverySort;
  };
  readonly announcement: OperationalAnnouncement | null;
}

const defaultIntakeFilter: IntakeFilter = Object.freeze({ query: '', category: 'all' });
const defaultDeliveryFilter: DeliveryFilter = Object.freeze({ query: '', condition: 'all' });

const baselineTelemetry: readonly IntakeTelemetrySample[] = Object.freeze([
  { key: 'sample-0900', timestamp: '2026-08-11T09:00:00-07:00', value: 42, knowledge: 'confirmed' },
  { key: 'sample-0905', timestamp: '2026-08-11T09:05:00-07:00', value: 47, knowledge: 'confirmed' },
  { key: 'sample-0910', timestamp: '2026-08-11T09:10:00-07:00', knowledge: 'unknown' },
  { key: 'sample-0915', timestamp: '2026-08-11T09:15:00-07:00', value: 51, knowledge: 'confirmed' },
  { key: 'sample-0920', timestamp: '2026-08-11T09:20:00-07:00', value: 49, knowledge: 'stale' },
]);

const baselineSources: readonly IntakeSource[] = Object.freeze([
  {
    key: 'source-north',
    label: 'North source',
    detail: 'Reporting normally.',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'source-central',
    label: 'Central source',
    detail: 'Recent validation delay.',
    state: { condition: 'caution', knowledge: 'stale', activity: 'idle' },
  },
  {
    key: 'source-south',
    label: 'South source',
    detail: 'Current source state is unknown.',
    state: { condition: 'neutral', knowledge: 'unknown', activity: 'idle' },
  },
  {
    key: 'source-west',
    label: 'West source',
    detail: 'Source cannot currently report.',
    state: { condition: 'neutral', knowledge: 'unavailable', activity: 'idle' },
  },
]);

const baselineEvents: readonly IntakeEvent[] = Object.freeze([
  {
    key: 'intake-event-104',
    timestamp: '2026-08-11T09:24:18-07:00',
    message: 'Record accepted for processing.',
    source: 'North source',
    category: 'arrival',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'intake-event-103',
    timestamp: '2026-08-11T09:23:42-07:00',
    message: 'Record accepted for processing.',
    source: 'Central source',
    category: 'arrival',
    state: { condition: 'neutral', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'intake-event-102',
    timestamp: '2026-08-11T09:22:11-07:00',
    message: 'Validation needs review.',
    source: 'Central source',
    category: 'validation',
    state: { condition: 'caution', knowledge: 'inferred', activity: 'idle' },
  },
  {
    key: 'intake-event-101',
    timestamp: '2026-08-11T09:20:07-07:00',
    message: 'Alternate route retained.',
    source: 'West source',
    category: 'routing',
    state: { condition: 'neutral', knowledge: 'unavailable', activity: 'idle' },
  },
]);

const baselineMetrics: readonly ProcessingMetric[] = Object.freeze([
  {
    key: 'duration',
    label: 'Median duration',
    value: '4.8',
    unit: 'min',
    trend: 'steady',
    comparison: 'Holding within the recent interval',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'backlog',
    label: 'Backlog',
    value: '28',
    unit: 'records',
    trend: 'rising',
    comparison: 'Six more than the previous interval',
    state: { condition: 'neutral', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'error-count',
    label: 'Errors',
    value: '3',
    trend: 'falling',
    comparison: 'Two fewer than the previous interval',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'completion',
    label: 'Completed',
    value: '96.4',
    unit: '%',
    trend: 'steady',
    comparison: 'Current reporting window',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
]);

const baselineTimeline: readonly ProcessingMilestone[] = Object.freeze([
  {
    key: 'milestone-received',
    timestamp: '2026-08-11T09:08:00-07:00',
    title: 'Batch received',
    detail: 'All expected source groups were represented.',
    chronology: 'past',
    kind: 'event',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'milestone-review',
    timestamp: '2026-08-11T09:12:00-07:00',
    title: 'Review interval active',
    detail: 'Nine records remain in the current review interval.',
    chronology: 'current',
    kind: 'interval',
    state: { condition: 'neutral', knowledge: 'confirmed', activity: 'pending' },
  },
  {
    key: 'milestone-capacity',
    timestamp: '2026-08-11T09:18:00-07:00',
    title: 'Capacity change inferred',
    detail: 'The recent rate suggests additional capacity became available.',
    chronology: 'past',
    kind: 'event',
    state: { condition: 'informational', knowledge: 'inferred', activity: 'idle' },
  },
]);

const baselineDetails: readonly DeliveryDetail[] = Object.freeze([
  {
    key: 'batch',
    label: 'Batch reference',
    value: 'DELIVERY-2026-08-11-NORTH-CENTRAL-0001842',
    state: { condition: 'neutral', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'window',
    label: 'Delivery window',
    value: '11 Aug 2026, 09:30–10:15',
    state: { condition: 'neutral', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'optional-note',
    label: 'Optional note',
    state: { condition: 'neutral', knowledge: 'unknown', activity: 'idle' },
  },
]);

const baselineStatuses: readonly DeliveryStatus[] = Object.freeze([
  {
    key: 'delivery-status-east',
    label: 'East destination',
    detail: 'Ready for delivery.',
    updatedAt: '2026-08-11T09:23:00-07:00',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'delivery-status-central',
    label: 'Central destination',
    detail: 'Confirmation is delayed.',
    updatedAt: '2026-08-11T09:21:00-07:00',
    state: { condition: 'caution', knowledge: 'stale', activity: 'idle' },
  },
  {
    key: 'delivery-status-west',
    label: 'West destination',
    detail: 'Dispatch is waiting for approval.',
    updatedAt: '2026-08-11T09:19:00-07:00',
    state: { condition: 'neutral', knowledge: 'confirmed', activity: 'pending' },
  },
]);

const baselineRecords: readonly DeliveryRecord[] = Object.freeze([
  {
    key: 'delivery-1842',
    reference: 'Record 1842',
    destination: 'East destination',
    updatedAt: '2026-08-11T09:24:00-07:00',
    owner: 'Delivery review',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  },
  {
    key: 'delivery-1841',
    reference: 'Record 1841',
    destination: 'Central destination',
    updatedAt: '2026-08-11T09:22:00-07:00',
    owner: 'Exception review',
    state: { condition: 'caution', knowledge: 'stale', activity: 'idle' },
  },
  {
    key: 'delivery-1840',
    reference: 'Record 1840',
    destination: 'West destination',
    updatedAt: '2026-08-11T09:20:00-07:00',
    owner: 'Approval queue',
    state: { condition: 'neutral', knowledge: 'confirmed', activity: 'pending' },
  },
  {
    key: 'delivery-1839',
    reference: 'Record 1839',
    destination: 'Remote destination with a deliberately long localized-looking name',
    updatedAt: '2026-08-11T09:18:00-07:00',
    owner: 'Alternate delivery review',
    state: { condition: 'critical', knowledge: 'unavailable', activity: 'idle' },
  },
]);

const readyPresentation: Readonly<Record<OperationalFunction, FunctionPresentation>> =
  Object.freeze({
    intake: {
      dataState: 'ready',
      busy: false,
      retainedData: true,
      feedback: 'Intake data is current except where individual records state otherwise.',
    },
    processing: {
      dataState: 'ready',
      busy: false,
      retainedData: true,
      feedback: 'Processing values and milestones are current.',
    },
    delivery: {
      dataState: 'ready',
      busy: false,
      retainedData: true,
      feedback: 'Delivery records are available.',
    },
  });

function cloneFilter<TFilter>(filter: TFilter): FilterState<TFilter> {
  return { draft: { ...filter }, applied: { ...filter } };
}

function createBaselineState(): OperationalActivityState {
  return {
    scenario: 'steady',
    selectedFunction: 'intake',
    revision: 0,
    presentation: readyPresentation,
    intake: {
      throughput: 49,
      telemetry: [...baselineTelemetry],
      sources: [...baselineSources],
      events: [...baselineEvents],
      filter: cloneFilter(defaultIntakeFilter),
    },
    processing: {
      metrics: [...baselineMetrics],
      timeline: [...baselineTimeline],
      request: {
        state: 'idle',
        confirmedGateOpen: true,
        message: 'Processing intake remains open. No request is pending.',
      },
    },
    delivery: {
      details: [...baselineDetails],
      statuses: [...baselineStatuses],
      records: [...baselineRecords],
      filter: cloneFilter(defaultDeliveryFilter),
      sort: 'updated-descending',
    },
    announcement: null,
  };
}

function presentationForScenario(
  scenario: OperationalScenario,
): Readonly<Record<OperationalFunction, FunctionPresentation>> {
  if (scenario === 'initial-loading') {
    return {
      intake: {
        dataState: 'loading',
        busy: true,
        retainedData: false,
        feedback: 'Loading Intake records. No confirmed Intake values are available yet.',
      },
      processing: {
        dataState: 'loading',
        busy: true,
        retainedData: false,
        feedback: 'Loading Processing records. No confirmed Processing values are available yet.',
      },
      delivery: {
        dataState: 'loading',
        busy: true,
        retainedData: false,
        feedback: 'Loading Delivery records. No confirmed Delivery values are available yet.',
      },
    };
  }

  if (scenario === 'retained-refresh') {
    return {
      intake: {
        dataState: 'refreshing',
        busy: true,
        retainedData: true,
        feedback: 'Refreshing Intake. Confirmed records remain visible.',
      },
      processing: {
        dataState: 'refreshing',
        busy: true,
        retainedData: true,
        feedback: 'Refreshing Processing. Confirmed values remain visible.',
      },
      delivery: {
        dataState: 'refreshing',
        busy: true,
        retainedData: true,
        feedback: 'Refreshing Delivery. Confirmed records remain visible.',
      },
    };
  }

  if (scenario === 'stale-partial') {
    return {
      ...readyPresentation,
      intake: {
        dataState: 'partial',
        busy: false,
        retainedData: true,
        feedback: 'Intake is partial. The latest sample is stale and one source is unavailable.',
      },
      delivery: {
        dataState: 'partial',
        busy: false,
        retainedData: true,
        feedback: 'Delivery is partial. Three of four expected destinations reported.',
      },
    };
  }

  if (scenario === 'unavailable') {
    return {
      intake: {
        dataState: 'unavailable',
        busy: false,
        retainedData: true,
        feedback: 'Intake is offline. Last-confirmed records remain visible; retry is available.',
      },
      processing: readyPresentation.processing,
      delivery: {
        dataState: 'unavailable',
        busy: false,
        retainedData: true,
        feedback: 'Delivery cannot refresh. Last-confirmed records remain visible.',
      },
    };
  }

  if (scenario === 'failed-request') {
    return {
      ...readyPresentation,
      processing: {
        dataState: 'failed',
        busy: false,
        retainedData: true,
        feedback: 'The pause request was rejected. Confirmed Processing intake remains open.',
      },
    };
  }

  if (scenario === 'recovered') {
    return {
      intake: {
        dataState: 'recovered',
        busy: false,
        retainedData: true,
        feedback:
          'Intake refresh recovered. Individual record condition and knowledge labels remain authoritative.',
      },
      processing: {
        dataState: 'recovered',
        busy: false,
        retainedData: true,
        feedback:
          'Processing refresh recovered. Individual value and milestone labels remain authoritative.',
      },
      delivery: {
        dataState: 'recovered',
        busy: false,
        retainedData: true,
        feedback:
          'Delivery refresh recovered. Individual record condition and knowledge labels remain authoritative.',
      },
    };
  }

  return readyPresentation;
}

export function createOperationalActivityState(
  scenario: OperationalScenario = 'steady',
): OperationalActivityState {
  const baseline = createBaselineState();
  const state: OperationalActivityState = {
    ...baseline,
    scenario,
    presentation: presentationForScenario(scenario),
  };

  if (scenario === 'initial-loading') {
    return {
      ...state,
      intake: { ...state.intake, throughput: null, telemetry: [], sources: [], events: [] },
      processing: {
        ...state.processing,
        metrics: [],
        timeline: [],
        request: {
          state: 'idle',
          confirmedGateOpen: null,
          message: 'Confirmed Processing intake is not available yet.',
        },
      },
      delivery: { ...state.delivery, details: [], statuses: [], records: [] },
    };
  }

  if (scenario === 'filtered-empty') {
    const intakeFilter: IntakeFilter = { query: 'no matching intake record', category: 'all' };
    const deliveryFilter: DeliveryFilter = {
      query: 'no matching delivery record',
      condition: 'all',
    };
    return {
      ...state,
      intake: { ...state.intake, filter: cloneFilter(intakeFilter) },
      delivery: { ...state.delivery, filter: cloneFilter(deliveryFilter) },
    };
  }

  if (scenario === 'failed-request') {
    return {
      ...state,
      processing: {
        ...state.processing,
        request: {
          state: 'rejected',
          confirmedGateOpen: true,
          message: 'Pause rejected. Confirmed Processing intake remains open. Retry is available.',
        },
      },
    };
  }

  if (scenario === 'live-update') {
    return receiveLiveUpdate(state);
  }

  return state;
}

function normalizeQuery(query: string): string {
  return query.trim().toLocaleLowerCase('en-US');
}

export function selectIntakeEvents(state: OperationalActivityState): readonly IntakeEvent[] {
  const { query, category } = state.intake.filter.applied;
  const normalizedQuery = normalizeQuery(query);
  return state.intake.events.filter((event) => {
    const matchesCategory = category === 'all' || event.category === category;
    const searchableText = `${event.message} ${event.source} ${event.category}`.toLocaleLowerCase(
      'en-US',
    );
    return matchesCategory && (normalizedQuery === '' || searchableText.includes(normalizedQuery));
  });
}

export function selectDeliveryRecords(state: OperationalActivityState): readonly DeliveryRecord[] {
  const { query, condition } = state.delivery.filter.applied;
  const normalizedQuery = normalizeQuery(query);
  return state.delivery.records
    .filter((record) => {
      const matchesCondition = condition === 'all' || record.state.condition === condition;
      const searchableText =
        `${record.reference} ${record.destination} ${record.owner}`.toLocaleLowerCase('en-US');
      return (
        matchesCondition && (normalizedQuery === '' || searchableText.includes(normalizedQuery))
      );
    })
    .toSorted((left, right) => {
      const comparison = left.updatedAt.localeCompare(right.updatedAt);
      return state.delivery.sort === 'updated-ascending' ? comparison : -comparison;
    });
}

export interface OperationalFunctionSummary {
  readonly value: OperationalFunction;
  readonly label: string;
  readonly summary: string;
  readonly consequential: boolean;
  readonly responseLabel?: string;
}

export function selectFunctionSummaries(
  state: OperationalActivityState,
): readonly OperationalFunctionSummary[] {
  const intakeSummary =
    state.presentation.intake.dataState === 'loading'
      ? 'Loading · No confirmed Intake values yet'
      : state.presentation.intake.dataState === 'refreshing'
        ? 'Refreshing · Confirmed Intake records retained'
        : state.presentation.intake.dataState === 'unavailable'
          ? 'Unavailable · Last-confirmed records retained · Retry available'
          : state.presentation.intake.dataState === 'recovered'
            ? 'Recovered · Individual record states retained'
            : 'Caution · Latest sample stale · One source unavailable';
  const processingSummary =
    state.processing.request.confirmedGateOpen === null
      ? 'Loading · Confirmed intake not yet available'
      : state.presentation.processing.dataState === 'refreshing'
        ? 'Refreshing · Confirmed Processing values retained'
        : state.presentation.processing.dataState === 'recovered'
          ? 'Recovered · Confirmed intake open'
          : state.processing.request.state === 'pending'
            ? 'Caution · Pause pending · Confirmed intake remains open'
            : state.processing.request.state === 'rejected'
              ? 'Critical · Pause rejected · Retry available'
              : 'Neutral · Confirmed · Intake open';
  const deliverySummary =
    state.presentation.delivery.dataState === 'loading'
      ? 'Loading · No confirmed Delivery records yet'
      : state.presentation.delivery.dataState === 'refreshing'
        ? 'Refreshing · Confirmed Delivery records retained'
        : state.presentation.delivery.dataState === 'unavailable'
          ? 'Unavailable · Last-confirmed records retained · Retry available'
          : state.presentation.delivery.dataState === 'recovered'
            ? 'Recovered · Individual record states retained'
            : state.presentation.delivery.dataState === 'partial'
              ? 'Caution · Partial records · Recovery available'
              : 'Critical record retained · One destination unavailable · Inspect available';
  const deliveryConsequential = state.presentation.delivery.dataState !== 'loading';

  return [
    {
      value: 'intake',
      label: 'Intake',
      summary: intakeSummary,
      consequential: state.presentation.intake.dataState === 'unavailable',
      ...(state.presentation.intake.dataState === 'unavailable'
        ? { responseLabel: 'Open Intake recovery' }
        : {}),
    },
    {
      value: 'processing',
      label: 'Processing',
      summary: processingSummary,
      consequential:
        state.processing.request.state === 'pending' ||
        state.processing.request.state === 'rejected',
      ...(state.processing.request.state === 'pending' ||
      state.processing.request.state === 'rejected'
        ? { responseLabel: 'Open Processing response' }
        : {}),
    },
    {
      value: 'delivery',
      label: 'Delivery',
      summary: deliverySummary,
      consequential: deliveryConsequential,
      ...(deliveryConsequential ? { responseLabel: 'Open Delivery response' } : {}),
    },
  ];
}

export type OperationalActivityAction =
  | { readonly type: 'select-function'; readonly value: OperationalFunction }
  | { readonly type: 'edit-intake-filter'; readonly value: IntakeFilter }
  | { readonly type: 'apply-intake-filter' }
  | { readonly type: 'reset-intake-filter' }
  | { readonly type: 'edit-delivery-filter'; readonly value: DeliveryFilter }
  | { readonly type: 'apply-delivery-filter' }
  | { readonly type: 'reset-delivery-filter' }
  | { readonly type: 'sort-delivery'; readonly value: DeliverySort }
  | { readonly type: 'request-processing-pause' }
  | {
      readonly type: 'resolve-processing-pause';
      readonly outcome: 'accepted' | 'rejected' | 'unavailable';
    }
  | { readonly type: 'set-scenario'; readonly value: OperationalScenario }
  | { readonly type: 'receive-live-update' }
  | { readonly type: 'clear-announcement' };

function withAnnouncement(
  state: OperationalActivityState,
  message: string,
): OperationalActivityState {
  return { ...state, announcement: { message, politeness: 'polite' } };
}

function recordCount(count: number): string {
  return `${count} ${count === 1 ? 'record' : 'records'}`;
}

export function receiveLiveUpdate(state: OperationalActivityState): OperationalActivityState {
  if (state.intake.events.some((event) => event.key === 'intake-event-105')) {
    return state;
  }

  const newEvent: IntakeEvent = {
    key: 'intake-event-105',
    timestamp: '2026-08-11T09:25:00-07:00',
    message: 'Record accepted for processing.',
    source: 'South source',
    category: 'arrival',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  };
  const newRecord: DeliveryRecord = {
    key: 'delivery-1843',
    reference: 'Record 1843',
    destination: 'East destination',
    updatedAt: '2026-08-11T09:25:00-07:00',
    owner: 'Delivery review',
    state: { condition: 'positive', knowledge: 'confirmed', activity: 'idle' },
  };

  return {
    ...state,
    revision: state.revision + 1,
    intake: {
      ...state.intake,
      throughput: state.intake.throughput === null ? 1 : state.intake.throughput + 1,
      telemetry: [
        ...state.intake.telemetry,
        {
          key: 'sample-0925',
          timestamp: '2026-08-11T09:25:00-07:00',
          value: 50,
          knowledge: 'confirmed',
        },
      ],
      events: [newEvent, ...state.intake.events],
    },
    delivery: { ...state.delivery, records: [newRecord, ...state.delivery.records] },
    announcement: null,
  };
}

export function reduceOperationalActivity(
  state: OperationalActivityState,
  action: OperationalActivityAction,
): OperationalActivityState {
  switch (action.type) {
    case 'select-function':
      return { ...state, selectedFunction: action.value };
    case 'edit-intake-filter':
      return {
        ...state,
        intake: { ...state.intake, filter: { ...state.intake.filter, draft: { ...action.value } } },
      };
    case 'apply-intake-filter': {
      const next = {
        ...state,
        intake: {
          ...state.intake,
          filter: { ...state.intake.filter, applied: { ...state.intake.filter.draft } },
        },
      };
      return withAnnouncement(
        next,
        `Intake filters applied. ${recordCount(selectIntakeEvents(next).length)} shown.`,
      );
    }
    case 'reset-intake-filter': {
      const next = {
        ...state,
        intake: { ...state.intake, filter: cloneFilter(defaultIntakeFilter) },
      };
      return withAnnouncement(
        next,
        `Intake filters cleared. ${recordCount(next.intake.events.length)} shown.`,
      );
    }
    case 'edit-delivery-filter':
      return {
        ...state,
        delivery: {
          ...state.delivery,
          filter: { ...state.delivery.filter, draft: { ...action.value } },
        },
      };
    case 'apply-delivery-filter': {
      const next = {
        ...state,
        delivery: {
          ...state.delivery,
          filter: { ...state.delivery.filter, applied: { ...state.delivery.filter.draft } },
        },
      };
      return withAnnouncement(
        next,
        `Delivery filters applied. ${recordCount(selectDeliveryRecords(next).length)} shown.`,
      );
    }
    case 'reset-delivery-filter': {
      const next = {
        ...state,
        delivery: { ...state.delivery, filter: cloneFilter(defaultDeliveryFilter) },
      };
      return withAnnouncement(
        next,
        `Delivery filters cleared. ${recordCount(next.delivery.records.length)} shown.`,
      );
    }
    case 'sort-delivery':
      return withAnnouncement(
        { ...state, delivery: { ...state.delivery, sort: action.value } },
        action.value === 'updated-ascending'
          ? 'Delivery records sorted by oldest update first.'
          : 'Delivery records sorted by newest update first.',
      );
    case 'request-processing-pause': {
      const confirmedState =
        state.processing.request.confirmedGateOpen === null
          ? 'Confirmed Processing intake is not yet available.'
          : state.processing.request.confirmedGateOpen
            ? 'Confirmed Processing intake remains open.'
            : 'Confirmed Processing intake remains closed.';
      return withAnnouncement(
        {
          ...state,
          processing: {
            ...state.processing,
            request: {
              state: 'pending',
              confirmedGateOpen: state.processing.request.confirmedGateOpen,
              message: `Pause requested. ${confirmedState}`,
            },
          },
        },
        `Processing pause requested. ${confirmedState}`,
      );
    }
    case 'resolve-processing-pause': {
      const accepted = action.outcome === 'accepted';
      const retainedState =
        state.processing.request.confirmedGateOpen === null
          ? 'Confirmed Processing intake remains unavailable.'
          : state.processing.request.confirmedGateOpen
            ? 'Confirmed Processing intake remains open.'
            : 'Confirmed Processing intake remains closed.';
      const message = accepted
        ? 'Pause accepted. Confirmed Processing intake is closed.'
        : action.outcome === 'rejected'
          ? `Pause rejected. ${retainedState} Retry is available.`
          : `Pause result unavailable. ${retainedState}`;
      return withAnnouncement(
        {
          ...state,
          processing: {
            ...state.processing,
            request: {
              state: action.outcome,
              confirmedGateOpen: accepted ? false : state.processing.request.confirmedGateOpen,
              message,
            },
          },
        },
        message,
      );
    }
    case 'set-scenario': {
      const next = createOperationalActivityState(action.value);
      return { ...next, selectedFunction: state.selectedFunction };
    }
    case 'receive-live-update':
      return receiveLiveUpdate(state);
    case 'clear-announcement':
      return state.announcement === null ? state : { ...state, announcement: null };
  }
}
