import {
  WgAlert,
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgConfirmationDialog,
  WgElbow,
  WgEventLog,
  WgEventRecord,
  WgKeyValue,
  WgMetric,
  WgPanel,
  WgStatusIndicator,
  WgThemeProvider,
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
  approvalExpiresAt,
  createHarborState,
  harborFunctions,
  reduceHarbor,
  selectHarborOverview,
  selectTask,
  selectTaskInvestigation,
  selectTasksRequiringDecision,
  type HarborFunction,
  type HarborState,
  type Knowledge,
} from './model.js';
import type { HarborClock, MergeApprovalPort } from './ports.js';
import type { HarborRoute, HarborRouter } from './router.js';

function routeTitle(route: HarborRoute): string {
  if (route.name === 'overview') return 'Supervision overview';
  if (route.name === 'task') return `Task ${route.taskId}`;
  return harborFunctions.find(({ value }) => value === route.value)?.label ?? route.value;
}

type Navigate = (event: MouseEvent<HTMLAnchorElement>, route: HarborRoute) => void;

interface HarborCommands {
  showMergeConfirmation(invoker: HTMLElement): void;
  requestMergeApproval(): Promise<void>;
  requestPause(): void;
  requestCancel(): void;
  retryTask(): void;
}

export function HarborApp({
  router,
  controls,
  clock,
}: {
  router: HarborRouter;
  controls: MergeApprovalPort;
  clock: HarborClock;
}) {
  const routeState = useSyncExternalStore(router.subscribe, router.current);
  const [state, dispatch] = useReducer(reduceHarbor, routeState, (initial) =>
    createHarborState(initial.scenario, initial.fixture),
  );
  const requestSequence = useRef(0);
  const attemptSequence = useRef(1);
  const mergeConfirmation = useRef<ComponentRef<typeof WgConfirmationDialog>>(null);
  const title = routeTitle(routeState.route);
  const representativeTask = selectTask(state, 'HL-317');

  useEffect(() => {
    document.title = `${title} — Harbor Lab`;
  }, [title]);
  useEffect(() => {
    dispatch({ type: 'set-scenario', value: routeState.scenario, fixture: routeState.fixture });
  }, [routeState.fixture, routeState.scenario]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, route: HarborRoute) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    router.navigate(route);
  }

  const commands: HarborCommands = {
    showMergeConfirmation(invoker) {
      mergeConfirmation.current?.show({ invoker });
    },
    async requestMergeApproval() {
      if (!representativeTask) return;
      const requestId = `approval-hl-317-${++requestSequence.current}`;
      const requestedAt = clock();
      const expiresAt = approvalExpiresAt(requestedAt, state.approvalPolicy.lifetimeMinutes);
      dispatch({
        type: 'request-merge-approval',
        requestId,
        taskId: 'HL-317',
        requestedAt,
        expiresAt,
      });
      const result = await controls.requestMergeApproval({
        requestId,
        taskId: 'HL-317',
        repository: representativeTask.repository,
        targetBranch: representativeTask.targetBranch,
        proposedRevision: representativeTask.proposedRevision,
        expiresAt,
      });
      dispatch({ type: 'resolve-merge-approval', ...result });
    },
    requestPause() {
      dispatch({ type: 'request-pause', taskId: 'HL-317', requestedAt: clock() });
    },
    requestCancel() {
      dispatch({ type: 'request-cancel', taskId: 'HL-317', requestedAt: clock() });
    },
    retryTask() {
      dispatch({
        type: 'retry-task',
        taskId: 'HL-317',
        attemptId: `attempt-hl-317-${++attemptSequence.current}`,
        createdAt: clock(),
      });
    },
  };

  return (
    <WgThemeProvider
      theme={routeState.theme}
      density={routeState.density}
      dir={routeState.direction}
    >
      <WgCanvas width="full">
        <header slot="header" className="harbor-header">
          <div className="harbor-identity">
            <p>Wayglass reference application</p>
            <strong>Harbor Lab</strong>
          </div>
          <nav aria-label="Harbor Lab places">
            <a
              href={router.href({ name: 'overview' })}
              aria-current={routeState.route.name === 'overview' ? 'page' : undefined}
              onClick={(event) => navigate(event, { name: 'overview' })}
            >
              Overview
            </a>
            <a
              href={router.href({ name: 'function', value: 'review-approval' })}
              aria-current={
                routeState.route.name === 'function' && routeState.route.value === 'review-approval'
                  ? 'page'
                  : undefined
              }
              onClick={(event) => navigate(event, { name: 'function', value: 'review-approval' })}
            >
              Review and approval
            </a>
          </nav>
        </header>
        <main id="main-content" data-route={routeState.route.name}>
          <header className="harbor-page-heading">
            <p>
              {routeState.route.name === 'overview'
                ? 'Harbor Lab / Engineering supervision'
                : 'Harbor Lab / Human decision workspace'}
            </p>
            <h1>{title}</h1>
            <p>{routeDescription(routeState.route)}</p>
          </header>
          {routeState.route.name === 'overview' ? (
            <Overview state={state} router={router} navigate={navigate} />
          ) : routeState.route.name === 'function' ? (
            <FocusedFunction
              value={routeState.route.value}
              state={state}
              router={router}
              navigate={navigate}
            />
          ) : (
            <TaskSummary state={state} router={router} navigate={navigate} commands={commands} />
          )}
        </main>
        <p className="harbor-announcement" aria-live="polite" aria-atomic="true">
          {state.announcement?.message ?? ''}
        </p>
        <WgConfirmationDialog
          ref={mergeConfirmation}
          dialogId="harbor-hl-317-merge"
          actionLabel="Approve merge for HL-317"
          cancelLabel="Keep HL-317 unapproved"
          actionAppearance="primary"
          attention="ordinary"
          initialFocus="cancel"
          onWgConfirmationAction={() => void commands.requestMergeApproval()}
        >
          <span slot="heading">Approve merge for HL-317?</span>
          <p>{mergeConfirmationDescription(representativeTask, state, clock())}</p>
        </WgConfirmationDialog>
        <footer slot="footer">
          <span>Harbor Lab local time · 2:30 PM</span>
          <span>
            Application retention · {state.retention.retainedEventCount} of{' '}
            {state.retention.eventLimit} recent tool records
          </span>
        </footer>
      </WgCanvas>
    </WgThemeProvider>
  );
}

function routeDescription(route: HarborRoute): string {
  switch (route.name) {
    case 'overview':
      return 'Which automated work can continue, and which task needs a human decision? Four supervision functions share one view.';
    case 'function':
      return 'Focused work with consequential human decisions still visible and reachable.';
    case 'task':
      return 'Inspect one task without confusing worker activity, evidence, confidence, approval, or confirmed external result.';
  }
}

function Overview({
  state,
  router,
  navigate,
}: {
  state: HarborState;
  router: HarborRouter;
  navigate: Navigate;
}) {
  return (
    <>
      <DecisionSummary state={state} router={router} navigate={navigate} />
      <section className="harbor-function-grid" aria-label="Supervision functions">
        {harborFunctions.map(({ value }) => (
          <FunctionRegion
            key={value}
            value={value}
            state={state}
            router={router}
            navigate={navigate}
            overview
          />
        ))}
      </section>
    </>
  );
}

function DecisionSummary({
  state,
  router,
  navigate,
}: {
  state: HarborState;
  router: HarborRouter;
  navigate: Navigate;
}) {
  const tasks = selectTasksRequiringDecision(state);
  const task = selectTask(state, 'HL-317');
  const loading = state.presentation['review-approval'].dataState === 'loading';
  return (
    <section className="harbor-situation" aria-labelledby="harbor-decision-heading">
      <WgElbow weight="strong">
        <h2 id="harbor-decision-heading">Human decisions</h2>
      </WgElbow>
      <WgPanel purpose="information" emphasis="strong" label="Human decision summary">
        <div className="harbor-decision-copy">
          <p>
            <strong>
              {loading
                ? 'Waiting for confirmed task records.'
                : tasks.length === 0
                  ? 'No task currently needs a human decision.'
                  : `${tasks.length} task needs a human decision.`}
            </strong>{' '}
            {loading ? 'No approval or merge result is shown yet.' : decisionExplanation(task)}
          </p>
          {task ? (
            <a
              href={router.href({ name: 'task', taskId: 'HL-317' })}
              onClick={(event) => navigate(event, { name: 'task', taskId: 'HL-317' })}
            >
              Inspect HL-317
            </a>
          ) : null}
        </div>
      </WgPanel>
    </section>
  );
}

function decisionExplanation(task: ReturnType<typeof selectTask>): string {
  if (!task) return 'Confirmed task records contain no decision target.';
  if (task.mergeState === 'merged') return 'HL-317 is confirmed merged; no decision remains.';
  if (task.evidence.knowledge === 'stale') {
    return 'HL-317 is blocked for review, but its test evidence is stale. The target branch is not merged.';
  }
  return 'HL-317 is blocked for review. Agent activity and test completion do not mean the target branch is merged.';
}

function presentationKnowledge(
  knowledge: Knowledge | undefined,
): 'confirmed' | 'stale' | 'unavailable' | 'unknown' {
  return knowledge === undefined || knowledge === 'partial' ? 'unknown' : knowledge;
}

function FocusedFunction({
  value,
  state,
  router,
  navigate,
}: {
  value: HarborFunction;
  state: HarborState;
  router: HarborRouter;
  navigate: Navigate;
}) {
  const decisions = selectTasksRequiringDecision(state).length;
  return (
    <div className="harbor-focused-layout">
      <nav className="harbor-function-selectors" aria-label="Supervision functions">
        {harborFunctions.map((item) => (
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
      {value !== 'review-approval' && decisions > 0 ? (
        <aside className="harbor-peer-consequence" aria-label="Review decision consequence">
          <strong>Review and approval still needs a decision.</strong>
          <span> HL-317 has not been merged.</span>{' '}
          <a
            href={router.href({ name: 'function', value: 'review-approval' })}
            onClick={(event) => navigate(event, { name: 'function', value: 'review-approval' })}
          >
            Open Review and approval
          </a>
        </aside>
      ) : null}
      <div className="harbor-focused-surface">
        <FunctionRegion
          value={value}
          state={state}
          router={router}
          navigate={navigate}
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
  overview,
}: {
  value: HarborFunction;
  state: HarborState;
  router: HarborRouter;
  navigate: Navigate;
  overview: boolean;
}) {
  const definition = harborFunctions.find((item) => item.value === value)!;
  const presentation = state.presentation[value];
  return (
    <section
      className="harbor-function"
      data-function={value}
      aria-labelledby={`harbor-${value}-heading`}
    >
      <WgElbow weight={overview ? 'standard' : 'strong'}>
        <h2 id={`harbor-${value}-heading`}>{definition.label}</h2>
      </WgElbow>
      {presentation.dataState !== 'ready' ? (
        <p className="harbor-data-state">{presentation.message}</p>
      ) : null}
      <FunctionContent
        value={value}
        state={state}
        router={router}
        navigate={navigate}
        prominent={!overview}
      />
      {overview ? (
        <a
          className="harbor-function-link"
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
  prominent,
}: {
  value: HarborFunction;
  state: HarborState;
  router: HarborRouter;
  navigate: Navigate;
  prominent: boolean;
}) {
  const overview = selectHarborOverview(state);
  const task = selectTask(state, 'HL-317');
  switch (value) {
    case 'work-intake':
      return (
        <MonitorPanel heading="Authored work">
          <WgMetric
            label="Queued tasks"
            value={
              state.presentation[value].dataState === 'loading' ? '' : `${overview.queuedTasks}`
            }
            unit="tasks"
            loading={state.presentation[value].dataState === 'loading'}
            size={prominent ? 'prominent' : 'compact'}
          />
          <WgKeyValue
            label="HL-317 provenance"
            value={task?.evidence.source ?? 'Waiting for confirmed intake'}
            knowledge={presentationKnowledge(task?.evidence.knowledge)}
          />
          <p>Intake records describe authored requests; they do not establish a correct result.</p>
        </MonitorPanel>
      );
    case 'execution': {
      const unavailableAgents = state.agents.length - overview.availableAgents;
      return (
        <MonitorPanel heading="Worker activity">
          <WgMetric
            label="Available workers"
            value={
              state.presentation[value].dataState === 'loading' ? '' : `${overview.availableAgents}`
            }
            unit={state.agents.length === 0 ? '' : `of ${state.agents.length}`}
            loading={state.presentation[value].dataState === 'loading'}
            size={prominent ? 'prominent' : 'compact'}
          />
          <WgKeyValue
            label="Workers running tool steps"
            value={`${overview.runningAgents}`}
            knowledge={state.agents.length === 0 ? 'unknown' : 'confirmed'}
          />
          <WgStatusIndicator
            label={
              unavailableAgents > 0
                ? `${unavailableAgents} worker unavailable`
                : 'All workers available'
            }
            condition={unavailableAgents > 0 ? 'caution' : 'positive'}
            knowledge="confirmed"
          />
          <p>Worker completion or availability does not confirm a task outcome.</p>
        </MonitorPanel>
      );
    }
    case 'review-approval':
      return (
        <MonitorPanel heading="Decision queue">
          <WgMetric
            label="Human decisions required"
            value={
              state.presentation[value].dataState === 'loading'
                ? ''
                : `${overview.decisionsRequired}`
            }
            unit="tasks"
            loading={state.presentation[value].dataState === 'loading'}
            size={prominent ? 'prominent' : 'compact'}
          />
          {task ? (
            <WgStatusIndicator
              label="HL-317 merge decision required"
              condition={task.condition}
              knowledge={presentationKnowledge(task.evidence.knowledge)}
              activity={task.activity === 'pending' ? 'pending' : 'idle'}
            />
          ) : null}
          <p>{task ? decisionExplanation(task) : 'No confirmed decision target is available.'}</p>
          {task ? (
            <a
              href={router.href({ name: 'task', taskId: 'HL-317' })}
              onClick={(event) => navigate(event, { name: 'task', taskId: 'HL-317' })}
            >
              Inspect HL-317
            </a>
          ) : null}
        </MonitorPanel>
      );
    case 'outcome-recovery':
      return (
        <MonitorPanel heading="Confirmed outcomes">
          <WgMetric
            label="Confirmed merges"
            value={
              state.presentation[value].dataState === 'loading' ? '' : `${overview.confirmedMerges}`
            }
            unit="tasks"
            loading={state.presentation[value].dataState === 'loading'}
            size={prominent ? 'prominent' : 'compact'}
          />
          <WgKeyValue
            label="Failed attempts"
            value={`${overview.failedTasks}`}
            knowledge={state.tasks.length === 0 ? 'unknown' : 'confirmed'}
          />
          <p>Retries create linked attempts; recovery never erases retained failure history.</p>
        </MonitorPanel>
      );
  }
}

function MonitorPanel({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <WgPanel purpose="monitor" emphasis="strong" label={heading}>
      <h3 slot="heading">{heading}</h3>
      <div className="harbor-values">{children}</div>
    </WgPanel>
  );
}

function functionSummary(value: HarborFunction, state: HarborState): string {
  if (state.presentation[value].dataState === 'loading') return 'Loading · no confirmed records';
  const overview = selectHarborOverview(state);
  switch (value) {
    case 'work-intake':
      return `${overview.queuedTasks} queued · ${state.tasks.length} retained`;
    case 'execution':
      return `${overview.availableAgents} of ${state.agents.length} available · ${overview.runningAgents} running`;
    case 'review-approval':
      return `${overview.decisionsRequired} decision required`;
    case 'outcome-recovery':
      return `${overview.confirmedMerges} confirmed merged · ${overview.failedTasks} failed`;
  }
}

function TaskSummary({
  state,
  router,
  navigate,
  commands,
}: {
  state: HarborState;
  router: HarborRouter;
  navigate: Navigate;
  commands: HarborCommands;
}) {
  const investigation = selectTaskInvestigation(state, 'HL-317');
  if (!investigation) {
    return (
      <WgPanel purpose="information" emphasis="strong" label="Task loading">
        <p>Loading task records; no evidence, approval, or merge result is claimed.</p>
      </WgPanel>
    );
  }
  const { task, assignedAgent, toolRecords, evidenceAgeMinutes, evidenceFreshness } = investigation;
  return (
    <section className="harbor-task-summary" aria-label="HL-317 task investigation">
      <WgElbow weight="strong">
        <h2>{task.title}</h2>
      </WgElbow>
      <a
        className="harbor-task-return"
        href={router.href({ name: 'function', value: 'review-approval' })}
        onClick={(event) => navigate(event, { name: 'function', value: 'review-approval' })}
      >
        Back to Review and approval
      </a>
      <div className="harbor-task-overview-grid">
        <WgPanel purpose="information" emphasis="strong" label="Proposed change">
          <h3 slot="heading">Proposed change</h3>
          <div className="harbor-values">
            <WgKeyValue label="Repository" value={task.repository} knowledge="confirmed" />
            <WgKeyValue label="Target branch" value={task.targetBranch} knowledge="confirmed" />
            <WgKeyValue
              label="Proposed revision"
              value={task.proposedRevision}
              knowledge="confirmed"
            />
          </div>
        </WgPanel>
        <WgPanel purpose="monitor" emphasis="strong" label="Current task state">
          <h3 slot="heading">Current task state</h3>
          <div className="harbor-values">
            <WgStatusIndicator
              label={`HL-317 ${task.state}; human ${task.humanAttention.replace('-', ' ')}`}
              condition={task.condition}
              knowledge={presentationKnowledge(task.evidence.knowledge)}
              activity={task.activity === 'pending' ? 'pending' : 'idle'}
            />
            <WgKeyValue label="Task state" value={task.state} knowledge="confirmed" />
            <WgKeyValue label="Task activity" value={task.activity} knowledge="confirmed" />
            <WgKeyValue
              label="Confirmed merge state"
              value={task.mergeState === 'merged' ? 'Merged' : 'Not merged'}
              knowledge="confirmed"
            />
          </div>
        </WgPanel>
        <WgPanel purpose="information" emphasis="standard" label="Attempt and worker context">
          <h3 slot="heading">Attempt and worker context</h3>
          <div className="harbor-values">
            <WgKeyValue label="Current attempt" value={task.attemptId} knowledge="confirmed" />
            <WgKeyValue
              label="Previous attempt"
              value={task.previousAttemptId ?? 'No previous attempt'}
              knowledge="confirmed"
            />
            <WgKeyValue
              label="Assigned worker"
              value={assignedAgent?.label ?? 'Unassigned'}
              knowledge={assignedAgent ? 'confirmed' : 'unknown'}
            />
            <WgKeyValue
              label="Worker availability"
              value={assignedAgent?.availability ?? 'Unknown'}
              knowledge={assignedAgent ? 'confirmed' : 'unknown'}
            />
            <WgKeyValue
              label="Worker activity"
              value={assignedAgent?.activity ?? 'Unknown'}
              knowledge={assignedAgent ? 'confirmed' : 'unknown'}
            />
          </div>
        </WgPanel>
      </div>
      <div className="harbor-investigation-grid">
        <WgPanel purpose="monitor" emphasis="strong" label="Decision evidence">
          <h3 slot="heading">Decision evidence</h3>
          <div className="harbor-values">
            <WgStatusIndicator
              label={evidenceFreshnessLabel(
                evidenceAgeMinutes,
                state.evidencePolicy.maximumAgeMinutes,
              )}
              condition={evidenceFreshness === 'stale' ? 'caution' : 'neutral'}
              knowledge={presentationKnowledge(task.evidence.knowledge)}
              size="prominent"
            />
            <WgKeyValue
              label="Evidence source"
              value={task.evidence.source}
              knowledge={presentationKnowledge(task.evidence.knowledge)}
            />
            <WgKeyValue
              label="Outcome confidence"
              value={task.evidence.confidence}
              knowledge={presentationKnowledge(task.evidence.knowledge)}
            />
            <WgKeyValue
              label="Evidence age"
              value={evidenceAgeMinutes === null ? 'Unknown' : `${evidenceAgeMinutes} minutes`}
              knowledge={presentationKnowledge(task.evidence.knowledge)}
            />
            <WgKeyValue
              label="Freshness policy"
              value={`${state.evidencePolicy.maximumAgeMinutes} minutes maximum`}
              knowledge="confirmed"
            />
            <p>{task.evidence.summary}</p>
            {task.evidence.observedAt ? (
              <p className="harbor-evidence-time">
                Observed{' '}
                <time dateTime={task.evidence.observedAt}>
                  {formatHarborTime(task.evidence.observedAt)}
                </time>
                .
              </p>
            ) : null}
          </div>
        </WgPanel>
        <WgPanel purpose="information" emphasis="standard" label="Interpretation boundary">
          <h3 slot="heading">Interpretation boundary</h3>
          <p>
            Tool completion, worker activity, and high confidence describe retained evidence. They
            do not establish that the proposed revision is correct, approved, or merged.
          </p>
          <p>
            The confirmed target-branch result remains{' '}
            <strong>{task.mergeState === 'merged' ? 'merged' : 'not merged'}</strong>.
          </p>
        </WgPanel>
      </div>
      <div className="harbor-control-grid">
        <MergeApprovalControl state={state} commands={commands} />
        <ExecutionRecoveryControl state={state} commands={commands} />
      </div>
      <WgEventLog
        className="harbor-tool-history"
        label="HL-317 retained task and tool history"
        chronology="descending"
        chronologyLabel="Newest retained record first"
        busy={state.presentation.execution.dataState === 'refreshing'}
      >
        <h3 slot="heading">Task and tool history</h3>
        <p slot="description">
          {toolRecords.length} records for HL-317 are shown from the application-owned window of{' '}
          {state.retention.retainedEventCount}. New records keep stable record identity and are not
          announced individually.
        </p>
        {state.presentation.execution.dataState !== 'ready' ? (
          <p slot="status">{state.presentation.execution.message}</p>
        ) : null}
        {toolRecords.map((record) => (
          <WgEventRecord
            key={record.id}
            data-tool-record={record.id}
            label={record.summary}
            condition={record.condition}
            knowledge={presentationKnowledge(record.knowledge)}
          >
            <time slot="time" dateTime={record.occurredAt}>
              {formatHarborTime(record.occurredAt)}
            </time>
            <span slot="summary">{record.summary}</span>
            <span slot="source">Source: {record.tool}</span>
            <span slot="category">Task: {record.taskId}</span>
            <span slot="reference">Attempt: {record.attemptId}</span>
          </WgEventRecord>
        ))}
      </WgEventLog>
      <a
        className="harbor-task-return"
        href={router.href({ name: 'function', value: 'review-approval' })}
        onClick={(event) => navigate(event, { name: 'function', value: 'review-approval' })}
      >
        Back to Review and approval
      </a>
    </section>
  );
}

function MergeApprovalControl({
  state,
  commands,
}: {
  state: HarborState;
  commands: HarborCommands;
}) {
  const task = selectTask(state, 'HL-317');
  if (!task) return null;
  const request = state.approvalRequest;
  const pending = request.state === 'pending';
  const canRequest =
    task.humanAttention === 'decision-required' &&
    task.mergeState === 'not-merged' &&
    task.state !== 'failed' &&
    !pending;
  const actionLabel =
    task.mergeState === 'merged'
      ? 'HL-317 merge confirmed'
      : task.state === 'failed'
        ? 'Create a retry before requesting approval'
        : request.outcome === 'denied' || request.outcome === 'timed-out'
          ? 'Request merge approval again for HL-317'
          : 'Review merge approval for HL-317';
  return (
    <WgPanel purpose="control" emphasis="strong" label="Review and approval control for HL-317">
      <h3 slot="heading">Review and approval · HL-317</h3>
      <p>
        Approval authorizes one attempt to merge the proposed revision into the named target branch.
        It does not guarantee that the merge will succeed.
      </p>
      <div className="harbor-values">
        <WgBooleanValue
          label="Approval granted"
          asserted={task.approvalState === 'granted'}
          assertedLabel="Granted"
          notAssertedLabel="Not granted"
          knowledge="confirmed"
          presentation="rail"
        />
        <WgKeyValue
          label="Approval state"
          value={task.approvalState.replace('-', ' ')}
          knowledge="confirmed"
        />
        <WgKeyValue
          label="Approval expiry"
          value={request.expiresAt ? formatHarborTime(request.expiresAt) : 'No active approval'}
          knowledge="confirmed"
        />
        <WgKeyValue
          label="Confirmed target result"
          value={task.mergeState === 'merged' ? 'Merged' : 'Not merged'}
          knowledge="confirmed"
        />
      </div>
      <WgButton
        slot="actions"
        appearance="primary"
        pending={pending}
        disabled={!canRequest}
        onClick={(event) => commands.showMergeConfirmation(event.currentTarget)}
      >
        {actionLabel}
        <span slot="pending-label">Requesting approval for HL-317</span>
      </WgButton>
      <ApprovalResult state={state} />
    </WgPanel>
  );
}

function ApprovalResult({ state }: { state: HarborState }) {
  const request = state.approvalRequest;
  const condition =
    request.outcome === 'merged'
      ? 'positive'
      : request.outcome === 'denied' ||
          request.outcome === 'timed-out' ||
          request.outcome === 'merge-failed'
        ? 'caution'
        : 'neutral';
  return (
    <WgAlert
      condition={condition}
      announcement="off"
      label="HL-317 merge approval result"
      data-approval-state={request.state}
      data-approval-outcome={request.outcome ?? 'none'}
    >
      <strong slot="heading">{approvalResultHeading(state)}</strong>
      <p>{request.message || 'No merge approval request has been made.'}</p>
    </WgAlert>
  );
}

function approvalResultHeading(state: HarborState): string {
  const request = state.approvalRequest;
  if (request.state === 'pending') return 'Approval pending';
  switch (request.outcome) {
    case 'merged':
      return 'Merge confirmed';
    case 'denied':
      return 'Permission denied';
    case 'timed-out':
      return 'Approval expired';
    case 'merge-failed':
      return 'Merge failed';
    case null:
      return 'Ready for a decision';
  }
}

function ExecutionRecoveryControl({
  state,
  commands,
}: {
  state: HarborState;
  commands: HarborCommands;
}) {
  const task = selectTask(state, 'HL-317');
  if (!task) return null;
  const request = state.executionRequest;
  const requestPending = request.state === 'pending';
  const canRequest = !requestPending && !['completed', 'failed', 'cancelled'].includes(task.state);
  return (
    <WgPanel
      purpose="control"
      emphasis="standard"
      label="Execution and recovery controls for HL-317"
    >
      <h3 slot="heading">Execution and recovery · HL-317</h3>
      <p>
        Pause and cancellation record a request. An active tool step may finish, so neither control
        claims that execution has stopped.
      </p>
      <div className="harbor-control-actions" slot="actions">
        <WgButton
          appearance="secondary"
          pending={requestPending && request.kind === 'pause'}
          disabled={!canRequest}
          onClick={commands.requestPause}
        >
          Request pause for HL-317
          <span slot="pending-label">Pause requested for HL-317</span>
        </WgButton>
        <WgButton
          appearance="secondary"
          pending={requestPending && request.kind === 'cancel'}
          disabled={!canRequest}
          onClick={commands.requestCancel}
        >
          Request cancellation for HL-317
          <span slot="pending-label">Cancellation requested for HL-317</span>
        </WgButton>
        {task.state === 'failed' ? (
          <WgButton appearance="primary" onClick={commands.retryTask}>
            Retry HL-317 as a new attempt
          </WgButton>
        ) : null}
      </div>
      <WgAlert
        condition={task.state === 'failed' ? 'caution' : 'neutral'}
        announcement="off"
        label="HL-317 execution request result"
        data-execution-request={request.kind ?? 'none'}
      >
        <strong slot="heading">
          {task.state === 'failed'
            ? 'Recovery available'
            : requestPending
              ? 'Request recorded'
              : 'No execution request pending'}
        </strong>
        <p>{request.message}</p>
      </WgAlert>
    </WgPanel>
  );
}

function evidenceFreshnessLabel(ageMinutes: number | null, maximumAgeMinutes: number): string {
  if (ageMinutes === null) return 'Evidence age is unknown';
  if (ageMinutes > maximumAgeMinutes) {
    return `Evidence is ${ageMinutes} minutes old; ${maximumAgeMinutes}-minute policy exceeded`;
  }
  return `Evidence is current at ${ageMinutes} minutes old`;
}

function mergeConfirmationDescription(
  task: ReturnType<typeof selectTask>,
  state: HarborState,
  requestedAt: string,
): string {
  if (!task) return 'The HL-317 task record is unavailable. No merge request will be made.';
  const investigation = selectTaskInvestigation(state, task.id);
  const evidenceAge = investigation?.evidenceAgeMinutes;
  const expiresAt = approvalExpiresAt(requestedAt, state.approvalPolicy.lifetimeMinutes);
  return `Repository ${task.repository}; target branch ${task.targetBranch}; proposed revision ${task.proposedRevision}. Evidence is ${evidenceAge === null || evidenceAge === undefined ? 'of unknown age' : `${evidenceAge} minutes old`} with ${task.evidence.confidence} confidence. Approval expires at ${formatHarborTime(expiresAt)} and authorizes one merge attempt. A failed attempt leaves the confirmed target branch unchanged, and this workflow provides no automatic reversal after a confirmed merge.`;
}

function formatHarborTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Phoenix',
    timeZoneName: 'short',
  }).format(new Date(value));
}
