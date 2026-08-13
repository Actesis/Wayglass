import {
  WgCanvas,
  WgElbow,
  WgKeyValue,
  WgMetric,
  WgPanel,
  WgStatusIndicator,
  WgThemeProvider,
} from '@wayglass/react';
import {
  useEffect,
  useReducer,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from 'react';

import {
  createHarborState,
  harborFunctions,
  reduceHarbor,
  selectHarborOverview,
  selectTask,
  selectTasksRequiringDecision,
  type HarborFunction,
  type HarborState,
  type Knowledge,
} from './model.js';
import type { HarborRoute, HarborRouter } from './router.js';

function routeTitle(route: HarborRoute): string {
  if (route.name === 'overview') return 'Supervision overview';
  if (route.name === 'task') return `Task ${route.taskId}`;
  return harborFunctions.find(({ value }) => value === route.value)?.label ?? route.value;
}

type Navigate = (event: MouseEvent<HTMLAnchorElement>, route: HarborRoute) => void;

export function HarborApp({ router }: { router: HarborRouter }) {
  const routeState = useSyncExternalStore(router.subscribe, router.current);
  const [state, dispatch] = useReducer(reduceHarbor, routeState, (initial) =>
    createHarborState(initial.scenario, initial.fixture),
  );
  const title = routeTitle(routeState.route);

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
            <TaskSummary state={state} router={router} navigate={navigate} />
          )}
        </main>
        <p className="harbor-announcement" aria-live="polite" aria-atomic="true">
          {state.announcement?.message ?? ''}
        </p>
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
}: {
  state: HarborState;
  router: HarborRouter;
  navigate: Navigate;
}) {
  const task = selectTask(state, 'HL-317');
  if (!task) {
    return (
      <WgPanel purpose="information" emphasis="strong" label="Task loading">
        <p>Loading task records; no evidence, approval, or merge result is claimed.</p>
      </WgPanel>
    );
  }
  return (
    <section className="harbor-task-summary" aria-label="HL-317 task summary">
      <WgElbow weight="strong">
        <h2>{task.title}</h2>
      </WgElbow>
      <div className="harbor-task-grid">
        <WgPanel purpose="information" emphasis="strong" label="Proposed change">
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
        <WgPanel purpose="monitor" emphasis="strong" label="Decision evidence">
          <div className="harbor-values">
            <WgStatusIndicator
              label="HL-317 evidence state"
              condition={task.condition}
              knowledge={presentationKnowledge(task.evidence.knowledge)}
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
              label="Confirmed merge state"
              value={task.mergeState === 'merged' ? 'Merged' : 'Not merged'}
              knowledge="confirmed"
            />
          </div>
        </WgPanel>
      </div>
      <p className="harbor-task-note">
        Agent activity: {task.activity}. Task state: {task.state}. Neither value establishes that
        the proposed revision is correct or merged.
      </p>
      <a
        href={router.href({ name: 'function', value: 'review-approval' })}
        onClick={(event) => navigate(event, { name: 'function', value: 'review-approval' })}
      >
        Back to Review and approval
      </a>
    </section>
  );
}
