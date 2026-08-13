import { WgCanvas, WgPanel, WgStatusIndicator, WgThemeProvider } from '@wayglass/react';
import { useEffect, useReducer, useSyncExternalStore, type MouseEvent } from 'react';

import { createHarborState, harborFunctions, reduceHarbor, selectTask } from './model.js';
import type { HarborRoute, HarborRouter } from './router.js';

function routeTitle(route: HarborRoute): string {
  if (route.name === 'overview') return 'Supervision overview';
  if (route.name === 'task') return `Task ${route.taskId}`;
  return harborFunctions.find(({ value }) => value === route.value)?.label ?? route.value;
}

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

  const task = selectTask(state, 'HL-317');
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
          <nav aria-label="Harbor Lab workspaces">
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
            <a
              href={router.href({ name: 'task', taskId: 'HL-317' })}
              aria-current={routeState.route.name === 'task' ? 'page' : undefined}
              onClick={(event) => navigate(event, { name: 'task', taskId: 'HL-317' })}
            >
              HL-317
            </a>
          </nav>
        </header>
        <main>
          <header className="harbor-page-heading">
            <p>Harbor Lab / Engineering supervision</p>
            <h1>{title}</h1>
            <p>Which automated work can continue, and which task needs a human decision?</p>
          </header>
          <section className="harbor-functions" aria-label="Supervision functions">
            {harborFunctions.map(({ value, label }) => (
              <article
                key={value}
                data-active={
                  routeState.route.name === 'function' && routeState.route.value === value
                }
              >
                <h2>{label}</h2>
                <p>{state.presentation[value].message}</p>
              </article>
            ))}
          </section>
          <WgPanel purpose="monitor" emphasis="strong" label="Representative human decision">
            {task ? (
              <div className="harbor-decision">
                <WgStatusIndicator
                  label={`${task.id} requires a human merge decision`}
                  condition={task.condition}
                  knowledge={
                    task.evidence.knowledge === 'partial' ? 'unknown' : task.evidence.knowledge
                  }
                  activity={task.activity === 'pending' ? 'pending' : 'idle'}
                  size="prominent"
                />
                <p>{task.title}</p>
                <p>
                  Agent activity: {task.activity}. Evidence: {task.evidence.knowledge}, confidence{' '}
                  {task.evidence.confidence}. Confirmed merge state: {task.mergeState}.
                </p>
              </div>
            ) : (
              <p>Loading task records; no decision state is claimed.</p>
            )}
          </WgPanel>
          <p className="harbor-foundation-note">
            This foundation establishes application-owned truth, routes, scenarios, and approval
            boundaries. Dense task investigation and consequential controls arrive in later slices.
          </p>
        </main>
        <footer slot="footer">Private Phase 4D reference application · synthetic local data</footer>
      </WgCanvas>
    </WgThemeProvider>
  );
}
