export const harborFunctions = [
  { value: 'work-intake', label: 'Work intake' },
  { value: 'execution', label: 'Execution' },
  { value: 'review-approval', label: 'Review and approval' },
  { value: 'outcome-recovery', label: 'Outcome and recovery' },
] as const;

export type HarborFunction = (typeof harborFunctions)[number]['value'];

export const harborScenarios = [
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
  'stale-evidence',
  'approval-denied',
  'approval-timeout',
  'merge-failed',
  'merge-confirmed',
  'new-tool-record',
  'pause-requested',
  'cancel-requested',
] as const;

export type HarborScenario = (typeof harborScenarios)[number];
export type HarborFixture = 'standard' | 'maximum';
export type Condition = 'neutral' | 'positive' | 'caution' | 'critical';
export type Knowledge = 'confirmed' | 'stale' | 'partial' | 'unavailable' | 'unknown';
export type Activity = 'idle' | 'queued' | 'running' | 'waiting' | 'pending';
export type TaskState =
  'queued' | 'running' | 'waiting' | 'blocked' | 'failed' | 'completed' | 'cancelled' | 'recovered';
export type HumanAttention = 'none' | 'review' | 'decision-required';
export type Confidence = 'low' | 'moderate' | 'high';
export type ApprovalState = 'idle' | 'pending' | 'granted' | 'denied' | 'timed-out';
export type MergeState = 'not-merged' | 'merged';

export interface EvidenceRecord {
  source: string;
  observedAt: string | null;
  knowledge: Knowledge;
  confidence: Confidence;
  summary: string;
}

export interface HarborTask {
  id: string;
  title: string;
  repository: string;
  targetBranch: string;
  proposedRevision: string;
  state: TaskState;
  condition: Condition;
  activity: Activity;
  humanAttention: HumanAttention;
  assignedAgentId: string | null;
  attemptId: string;
  previousAttemptId: string | null;
  evidence: EvidenceRecord;
  approvalState: ApprovalState;
  mergeState: MergeState;
}

export interface HarborAgent {
  id: string;
  label: string;
  availability: 'available' | 'unavailable';
  activity: Activity;
  currentTaskId: string | null;
}

export interface ToolRecord {
  id: string;
  taskId: string;
  attemptId: string;
  tool: string;
  summary: string;
  occurredAt: string;
  knowledge: Knowledge;
  condition: Condition;
}

export interface ApprovalRequest {
  id: string | null;
  taskId: string | null;
  state: 'idle' | 'pending' | 'resolved';
  outcome: 'merged' | 'denied' | 'timed-out' | 'merge-failed' | null;
  requestedAt: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  message: string;
}

export interface ExecutionRequest {
  kind: 'pause' | 'cancel' | null;
  state: 'idle' | 'pending';
  requestedAt: string | null;
  message: string;
}

interface FunctionPresentation {
  dataState: 'ready' | 'loading' | 'refreshing' | 'partial' | 'unavailable';
  retainedData: boolean;
  message: string;
}

export interface HarborState {
  fixture: HarborFixture;
  scenario: HarborScenario;
  selectedFunction: HarborFunction;
  revision: number;
  tasks: HarborTask[];
  agents: HarborAgent[];
  toolRecords: ToolRecord[];
  approvalRequest: ApprovalRequest;
  executionRequest: ExecutionRequest;
  now: string;
  evidencePolicy: { maximumAgeMinutes: number };
  approvalPolicy: { lifetimeMinutes: number };
  presentation: Record<HarborFunction, FunctionPresentation>;
  retention: { eventLimit: 250; retainedEventCount: number };
  announcement: { id: number; message: string } | null;
}

export type HarborAction =
  | { type: 'select-function'; value: HarborFunction }
  | { type: 'set-scenario'; value: HarborScenario; fixture: HarborFixture }
  | {
      type: 'request-merge-approval';
      requestId: string;
      taskId: string;
      requestedAt: string;
      expiresAt: string;
    }
  | {
      type: 'resolve-merge-approval';
      requestId: string;
      outcome: 'merged' | 'denied' | 'timed-out' | 'merge-failed';
      completedAt: string;
    }
  | { type: 'request-pause'; taskId: string; requestedAt: string }
  | { type: 'request-cancel'; taskId: string; requestedAt: string }
  | { type: 'retry-task'; taskId: string; attemptId: string; createdAt: string }
  | { type: 'receive-tool-record'; record: ToolRecord };

const observedAt = '2026-08-13T14:28:00-07:00';
const staleObservedAt = '2026-08-13T14:20:00-07:00';
const currentTime = '2026-08-13T14:30:00-07:00';

function representativeTask(): HarborTask {
  return {
    id: 'HL-317',
    title: 'Update synthetic harbor client dependency',
    repository: 'harbor-lab/dependency-sentinel',
    targetBranch: 'main',
    proposedRevision: 'deps/harbor-client-4.8.2',
    state: 'blocked',
    condition: 'caution',
    activity: 'waiting',
    humanAttention: 'decision-required',
    assignedAgentId: 'agent-delta',
    attemptId: 'attempt-hl-317-1',
    previousAttemptId: null,
    evidence: {
      source: 'Synthetic evidence bundle 8841',
      observedAt,
      knowledge: 'confirmed',
      confidence: 'high',
      summary: 'Analysis and 148 synthetic tests completed; merge has not been attempted.',
    },
    approvalState: 'idle',
    mergeState: 'not-merged',
  };
}

function baselineTasks(): HarborTask[] {
  return [
    representativeTask(),
    {
      ...representativeTask(),
      id: 'HL-318',
      title: 'Refresh generated API reference',
      proposedRevision: 'docs/api-reference-refresh',
      state: 'running',
      condition: 'neutral',
      activity: 'running',
      humanAttention: 'none',
      assignedAgentId: 'agent-kite',
      attemptId: 'attempt-hl-318-1',
      evidence: {
        source: 'Task intake record',
        observedAt,
        knowledge: 'confirmed',
        confidence: 'moderate',
        summary: 'Documentation generation is in progress; no outcome is claimed.',
      },
    },
    {
      ...representativeTask(),
      id: 'HL-319',
      title: 'Triage synthetic parser regression',
      proposedRevision: 'investigation/parser-regression',
      state: 'queued',
      condition: 'neutral',
      activity: 'queued',
      humanAttention: 'review',
      assignedAgentId: null,
      attemptId: 'attempt-hl-319-1',
      evidence: {
        source: 'Authored maintenance request',
        observedAt,
        knowledge: 'confirmed',
        confidence: 'low',
        summary: 'A regression was reported; cause and correction remain unknown.',
      },
    },
  ];
}

function baselineState(): HarborState {
  return {
    fixture: 'standard',
    scenario: 'steady',
    selectedFunction: 'review-approval',
    revision: 0,
    tasks: baselineTasks(),
    agents: [
      {
        id: 'agent-delta',
        label: 'Delta worker',
        availability: 'available',
        activity: 'waiting',
        currentTaskId: 'HL-317',
      },
      {
        id: 'agent-kite',
        label: 'Kite worker',
        availability: 'available',
        activity: 'running',
        currentTaskId: 'HL-318',
      },
      {
        id: 'agent-lumen',
        label: 'Lumen worker',
        availability: 'unavailable',
        activity: 'idle',
        currentTaskId: null,
      },
    ],
    toolRecords: [
      {
        id: 'tool-hl-317-tests',
        taskId: 'HL-317',
        attemptId: 'attempt-hl-317-1',
        tool: 'Synthetic test runner',
        summary: '148 tests completed; this record does not approve or perform a merge.',
        occurredAt: staleObservedAt,
        knowledge: 'confirmed',
        condition: 'neutral',
      },
      {
        id: 'tool-hl-317-change',
        taskId: 'HL-317',
        attemptId: 'attempt-hl-317-1',
        tool: 'Synthetic workspace editor',
        summary: 'Prepared the dependency revision; no repository merge was requested.',
        occurredAt: '2026-08-13T14:12:00-07:00',
        knowledge: 'confirmed',
        condition: 'neutral',
      },
      {
        id: 'tool-hl-317-analysis',
        taskId: 'HL-317',
        attemptId: 'attempt-hl-317-1',
        tool: 'Synthetic dependency analyzer',
        summary: 'Identified the authored dependency target and proposed a bounded revision.',
        occurredAt: '2026-08-13T14:02:00-07:00',
        knowledge: 'confirmed',
        condition: 'neutral',
      },
      {
        id: 'tool-hl-317-intake',
        taskId: 'HL-317',
        attemptId: 'attempt-hl-317-1',
        tool: 'Harbor work intake',
        summary: 'Accepted the authored maintenance request and created attempt 1.',
        occurredAt: '2026-08-13T13:50:00-07:00',
        knowledge: 'confirmed',
        condition: 'neutral',
      },
    ],
    approvalRequest: {
      id: null,
      taskId: null,
      state: 'idle',
      outcome: null,
      requestedAt: null,
      expiresAt: null,
      completedAt: null,
      message: '',
    },
    executionRequest: {
      kind: null,
      state: 'idle',
      requestedAt: null,
      message: 'No pause or cancellation request is pending.',
    },
    now: currentTime,
    evidencePolicy: { maximumAgeMinutes: 5 },
    approvalPolicy: { lifetimeMinutes: 5 },
    presentation: Object.fromEntries(
      harborFunctions.map(({ value }) => [
        value,
        { dataState: 'ready', retainedData: true, message: 'Current synthetic records.' },
      ]),
    ) as HarborState['presentation'],
    retention: { eventLimit: 250, retainedEventCount: 4 },
    announcement: null,
  };
}

function setAllPresentation(
  state: HarborState,
  dataState: FunctionPresentation['dataState'],
  retainedData: boolean,
  message: string,
): void {
  for (const { value } of harborFunctions) {
    state.presentation[value] = { dataState, retainedData, message };
  }
}

function applyMaximumFixture(state: HarborState): void {
  state.tasks = Array.from({ length: 60 }, (_, index) => {
    const task = baselineTasks()[index % 3]!;
    return {
      ...task,
      id: index === 0 ? 'HL-317' : `HL-${317 + index}`,
      attemptId: `attempt-hl-${317 + index}-1`,
      evidence: { ...task.evidence },
    };
  });
  const representativeAgents = state.agents.map((agent) => ({ ...agent }));
  state.agents = Array.from({ length: 12 }, (_, index) => {
    const representative = representativeAgents[index];
    if (representative) return representative;
    return {
      id: `agent-${index + 1}`,
      label: `Worker ${index + 1}`,
      availability: index === 11 ? ('unavailable' as const) : ('available' as const),
      activity: index % 3 === 0 ? ('running' as const) : ('idle' as const),
      currentTaskId: index % 3 === 0 ? (state.tasks[index]?.id ?? null) : null,
    };
  });
  state.toolRecords = Array.from({ length: 250 }, (_, index) => ({
    id: `tool-record-${index + 1}`,
    taskId: state.tasks[index % state.tasks.length]!.id,
    attemptId: state.tasks[index % state.tasks.length]!.attemptId,
    tool: 'Synthetic workspace tool',
    summary: `Retained tool record ${index + 1}; no external effect is inferred.`,
    occurredAt: new Date(Date.parse(observedAt) - index * 60_000).toISOString(),
    knowledge: 'confirmed' as const,
    condition: 'neutral' as const,
  }));
  state.retention.retainedEventCount = 250;
}

export function createHarborState(
  scenario: HarborScenario = 'stale-evidence',
  fixture: HarborFixture = 'standard',
): HarborState {
  const state = baselineState();
  state.scenario = scenario;
  state.fixture = fixture;
  if (fixture === 'maximum') applyMaximumFixture(state);
  const task = state.tasks[0];

  switch (scenario) {
    case 'initial-loading':
      state.tasks = [];
      state.agents = [];
      state.toolRecords = [];
      state.retention.retainedEventCount = 0;
      setAllPresentation(state, 'loading', false, 'Loading; no confirmed records yet.');
      break;
    case 'retained-refresh':
      setAllPresentation(state, 'refreshing', true, 'Refreshing; confirmed records retained.');
      break;
    case 'stale':
    case 'stale-evidence':
      if (task) {
        task.evidence.observedAt = staleObservedAt;
        task.evidence.knowledge = 'stale';
        task.condition = 'caution';
        task.evidence.summary = 'Tests passed earlier, but the evidence is now outside policy age.';
      }
      break;
    case 'partial':
      if (task) task.evidence.knowledge = 'partial';
      state.presentation['review-approval'] = {
        dataState: 'partial',
        retainedData: true,
        message: 'Policy results are partial; retained test evidence remains labeled.',
      };
      break;
    case 'unavailable':
      state.agents[0] = { ...state.agents[0]!, availability: 'unavailable', activity: 'idle' };
      state.presentation.execution = {
        dataState: 'unavailable',
        retainedData: true,
        message: 'Execution worker unavailable; retained task state remains visible.',
      };
      break;
    case 'permission-denied':
    case 'approval-denied':
      if (task) task.approvalState = 'denied';
      state.approvalRequest = {
        id: 'approval-denied',
        taskId: 'HL-317',
        state: 'resolved',
        outcome: 'denied',
        requestedAt: observedAt,
        expiresAt: '2026-08-13T14:33:00-07:00',
        completedAt: observedAt,
        message: 'Approval denied. The target branch remains unchanged.',
      };
      break;
    case 'request-pending':
      if (task) {
        task.approvalState = 'pending';
      }
      state.approvalRequest = {
        id: 'approval-pending',
        taskId: 'HL-317',
        state: 'pending',
        outcome: null,
        requestedAt: observedAt,
        expiresAt: '2026-08-13T14:33:00-07:00',
        completedAt: null,
        message: 'Approval requested. No merge has occurred.',
      };
      break;
    case 'approval-timeout':
      if (task) task.approvalState = 'timed-out';
      state.approvalRequest = {
        id: 'approval-timeout',
        taskId: 'HL-317',
        state: 'resolved',
        outcome: 'timed-out',
        requestedAt: '2026-08-13T14:20:00-07:00',
        expiresAt: '2026-08-13T14:25:00-07:00',
        completedAt: '2026-08-13T14:25:00-07:00',
        message: 'Approval expired without a decision. The target branch remains unchanged.',
      };
      break;
    case 'request-failed':
    case 'merge-failed':
      if (task) {
        task.approvalState = 'granted';
        task.mergeState = 'not-merged';
        task.state = 'failed';
      }
      state.approvalRequest = {
        id: 'approval-merge-failed',
        taskId: 'HL-317',
        state: 'resolved',
        outcome: 'merge-failed',
        requestedAt: observedAt,
        expiresAt: '2026-08-13T14:33:00-07:00',
        completedAt: observedAt,
        message: 'Approval was granted, but the merge failed. The target branch remains unchanged.',
      };
      break;
    case 'merge-confirmed':
      if (task) {
        task.approvalState = 'granted';
        task.mergeState = 'merged';
        task.state = 'completed';
        task.condition = 'positive';
        task.activity = 'idle';
        task.humanAttention = 'none';
      }
      state.approvalRequest = {
        id: 'approval-merged',
        taskId: 'HL-317',
        state: 'resolved',
        outcome: 'merged',
        requestedAt: observedAt,
        expiresAt: '2026-08-13T14:33:00-07:00',
        completedAt: observedAt,
        message: 'Merge confirmed on the target branch.',
      };
      break;
    case 'recovered':
      if (task) {
        task.evidence.knowledge = 'confirmed';
        task.state = 'recovered';
        task.evidence.summary =
          'Current replacement evidence is confirmed; earlier history remains.';
      }
      break;
    case 'meaningful-update':
    case 'new-tool-record':
      state.revision = 1;
      state.toolRecords.unshift({
        id: 'tool-hl-317-policy',
        taskId: 'HL-317',
        attemptId: 'attempt-hl-317-1',
        tool: 'Synthetic policy verifier',
        summary: 'A policy check completed; it does not approve or perform a merge.',
        occurredAt: '2026-08-13T14:23:00-07:00',
        knowledge: 'confirmed',
        condition: 'neutral',
      });
      state.toolRecords = state.toolRecords.slice(0, state.retention.eventLimit);
      state.retention.retainedEventCount = state.toolRecords.length;
      break;
    case 'pause-requested':
      if (task) task.activity = 'pending';
      state.executionRequest = {
        kind: 'pause',
        state: 'pending',
        requestedAt: observedAt,
        message: 'Pause requested; the active tool step may finish before execution stops.',
      };
      state.presentation.execution.message =
        'Pause requested; the active tool step may finish before execution stops.';
      break;
    case 'cancel-requested':
      if (task) task.activity = 'pending';
      state.executionRequest = {
        kind: 'cancel',
        state: 'pending',
        requestedAt: observedAt,
        message:
          'Cancellation requested; the active tool step may finish and cancellation is not yet confirmed.',
      };
      state.presentation.execution.message = state.executionRequest.message;
      break;
    case 'steady':
      break;
  }
  return state;
}

export function reduceHarbor(state: HarborState, action: HarborAction): HarborState {
  if (action.type === 'set-scenario') return createHarborState(action.value, action.fixture);
  if (action.type === 'select-function') return { ...state, selectedFunction: action.value };

  const tasks = state.tasks.map((task) => ({ ...task, evidence: { ...task.evidence } }));
  const next: HarborState = { ...state, tasks };
  const actionTaskId =
    action.type === 'resolve-merge-approval'
      ? state.approvalRequest.taskId
      : 'taskId' in action
        ? action.taskId
        : null;
  const task = tasks.find(({ id }) => id === actionTaskId);

  switch (action.type) {
    case 'request-merge-approval':
      if (
        !task ||
        task.humanAttention !== 'decision-required' ||
        task.mergeState === 'merged' ||
        state.approvalRequest.state === 'pending'
      )
        return state;
      task.approvalState = 'pending';
      next.approvalRequest = {
        id: action.requestId,
        taskId: action.taskId,
        state: 'pending',
        outcome: null,
        requestedAt: action.requestedAt,
        expiresAt: action.expiresAt,
        completedAt: null,
        message: 'Approval requested. No merge has occurred.',
      };
      return next;
    case 'resolve-merge-approval':
      if (!task || state.approvalRequest.id !== action.requestId) return state;
      task.activity =
        action.outcome === 'merged' || action.outcome === 'merge-failed' ? 'idle' : task.activity;
      task.approvalState =
        action.outcome === 'denied'
          ? 'denied'
          : action.outcome === 'timed-out'
            ? 'timed-out'
            : 'granted';
      task.mergeState = action.outcome === 'merged' ? 'merged' : 'not-merged';
      task.state =
        action.outcome === 'merged'
          ? 'completed'
          : action.outcome === 'merge-failed'
            ? 'failed'
            : 'blocked';
      task.humanAttention = action.outcome === 'merged' ? 'none' : 'decision-required';
      next.approvalRequest = {
        ...state.approvalRequest,
        state: 'resolved',
        outcome: action.outcome,
        completedAt: action.completedAt,
        message:
          action.outcome === 'merged'
            ? 'Merge confirmed on the target branch.'
            : action.outcome === 'merge-failed'
              ? 'Approval was granted, but the merge failed. The target branch remains unchanged.'
              : action.outcome === 'denied'
                ? 'Approval denied. The target branch remains unchanged.'
                : 'Approval expired without a decision. The target branch remains unchanged.',
      };
      next.announcement = {
        id: (state.announcement?.id ?? 0) + 1,
        message: next.approvalRequest.message,
      };
      return next;
    case 'request-pause':
      if (!task || state.executionRequest.state === 'pending') return state;
      task.activity = 'pending';
      next.executionRequest = {
        kind: 'pause',
        state: 'pending',
        requestedAt: action.requestedAt,
        message: 'Pause requested; the active tool step may finish before execution stops.',
      };
      next.presentation = {
        ...state.presentation,
        execution: {
          ...state.presentation.execution,
          message: 'Pause requested; the active tool step may finish before execution stops.',
        },
      };
      next.announcement = {
        id: (state.announcement?.id ?? 0) + 1,
        message: next.executionRequest.message,
      };
      return next;
    case 'request-cancel':
      if (!task || state.executionRequest.state === 'pending') return state;
      task.activity = 'pending';
      next.executionRequest = {
        kind: 'cancel',
        state: 'pending',
        requestedAt: action.requestedAt,
        message:
          'Cancellation requested; the active tool step may finish and cancellation is not yet confirmed.',
      };
      next.presentation = {
        ...state.presentation,
        execution: { ...state.presentation.execution, message: next.executionRequest.message },
      };
      next.announcement = {
        id: (state.announcement?.id ?? 0) + 1,
        message: next.executionRequest.message,
      };
      return next;
    case 'retry-task':
      if (!task || task.state !== 'failed') return state;
      {
        const previousAttemptId = task.attemptId;
        task.previousAttemptId = task.attemptId;
        task.attemptId = action.attemptId;
        task.state = 'queued';
        task.activity = 'queued';
        task.condition = 'neutral';
        task.approvalState = 'idle';
        task.mergeState = 'not-merged';
        task.humanAttention = 'review';
        task.evidence.knowledge = 'stale';
        task.evidence.confidence = 'low';
        task.evidence.summary =
          'Retained evidence belongs to the previous attempt; the new attempt has not produced current evidence.';
        next.approvalRequest = {
          id: null,
          taskId: null,
          state: 'idle',
          outcome: null,
          requestedAt: null,
          expiresAt: null,
          completedAt: null,
          message: 'A new attempt must produce reviewable evidence before approval.',
        };
        next.executionRequest = {
          kind: null,
          state: 'idle',
          requestedAt: null,
          message: 'No pause or cancellation request is pending.',
        };
        const retryRecord: ToolRecord = {
          id: `tool-${action.attemptId}-created`,
          taskId: task.id,
          attemptId: action.attemptId,
          tool: 'Harbor recovery',
          summary: `Created ${action.attemptId} linked to ${previousAttemptId}; no execution or merge result is claimed.`,
          occurredAt: action.createdAt,
          knowledge: 'confirmed',
          condition: 'neutral',
        };
        next.toolRecords = [retryRecord, ...state.toolRecords].slice(0, state.retention.eventLimit);
        next.retention = { ...state.retention, retainedEventCount: next.toolRecords.length };
        next.announcement = {
          id: (state.announcement?.id ?? 0) + 1,
          message: `Retry created as ${action.attemptId}; previous attempt retained.`,
        };
      }
      return next;
    case 'receive-tool-record':
      next.revision += 1;
      next.toolRecords = [action.record, ...state.toolRecords].slice(0, state.retention.eventLimit);
      next.retention = { ...state.retention, retainedEventCount: next.toolRecords.length };
      return next;
  }
}

export function selectTask(state: HarborState, taskId: string): HarborTask | undefined {
  return state.tasks.find(({ id }) => id === taskId);
}

export function approvalExpiresAt(requestedAt: string, lifetimeMinutes: number): string {
  return new Date(Date.parse(requestedAt) + lifetimeMinutes * 60_000).toISOString();
}

export interface HarborTaskInvestigation {
  task: HarborTask;
  assignedAgent: HarborAgent | null;
  toolRecords: ToolRecord[];
  evidenceAgeMinutes: number | null;
  evidenceFreshness: 'current' | 'stale' | 'unknown';
}

export function selectTaskInvestigation(
  state: HarborState,
  taskId: string,
): HarborTaskInvestigation | undefined {
  const task = selectTask(state, taskId);
  if (!task) return undefined;
  const evidenceAgeMinutes = task.evidence.observedAt
    ? Math.max(
        0,
        Math.floor((Date.parse(state.now) - Date.parse(task.evidence.observedAt)) / 60_000),
      )
    : null;
  const evidenceFreshness =
    evidenceAgeMinutes === null
      ? 'unknown'
      : task.evidence.knowledge === 'stale' ||
          evidenceAgeMinutes > state.evidencePolicy.maximumAgeMinutes
        ? 'stale'
        : 'current';
  return {
    task,
    assignedAgent: state.agents.find(({ id }) => id === task.assignedAgentId) ?? null,
    toolRecords: state.toolRecords
      .filter(({ taskId: recordTaskId }) => recordTaskId === taskId)
      .toSorted((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt)),
    evidenceAgeMinutes,
    evidenceFreshness,
  };
}

export function selectTasksRequiringDecision(state: HarborState): HarborTask[] {
  return state.tasks.filter(({ humanAttention }) => humanAttention === 'decision-required');
}

export interface HarborOverview {
  queuedTasks: number;
  activeTasks: number;
  blockedTasks: number;
  failedTasks: number;
  completedTasks: number;
  availableAgents: number;
  runningAgents: number;
  decisionsRequired: number;
  confirmedMerges: number;
}

export function selectHarborOverview(state: HarborState): HarborOverview {
  return {
    queuedTasks: state.tasks.filter(({ state: taskState }) => taskState === 'queued').length,
    activeTasks: state.tasks.filter(({ state: taskState }) =>
      ['running', 'waiting', 'blocked'].includes(taskState),
    ).length,
    blockedTasks: state.tasks.filter(({ state: taskState }) => taskState === 'blocked').length,
    failedTasks: state.tasks.filter(({ state: taskState }) => taskState === 'failed').length,
    completedTasks: state.tasks.filter(({ state: taskState }) => taskState === 'completed').length,
    availableAgents: state.agents.filter(({ availability }) => availability === 'available').length,
    runningAgents: state.agents.filter(({ activity }) => activity === 'running').length,
    decisionsRequired: selectTasksRequiringDecision(state).length,
    confirmedMerges: state.tasks.filter(({ mergeState }) => mergeState === 'merged').length,
  };
}
