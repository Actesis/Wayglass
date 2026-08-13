import { WgCanvas, WgPanel, WgStatusIndicator, WgThemeProvider } from '@wayglass/react';
import { useEffect, useReducer, useSyncExternalStore, type MouseEvent } from 'react';

import { createNorthlineState, northlineFunctions, reduceNorthline, selectLoad } from './model.js';
import type { NorthlineRoute, NorthlineRouter } from './router.js';

function routeTitle(route: NorthlineRoute): string {
  if (route.name === 'overview') return 'Outbound readiness';
  if (route.name === 'load') return `Load ${route.loadId}`;
  return northlineFunctions.find(({ value }) => value === route.value)?.label ?? route.value;
}

export function NorthlineApp({ router }: { router: NorthlineRouter }) {
  const routeState = useSyncExternalStore(router.subscribe, router.current);
  const [state, dispatch] = useReducer(reduceNorthline, routeState, (initial) =>
    createNorthlineState(initial.scenario, initial.fixture),
  );
  const title = routeTitle(routeState.route);

  useEffect(() => {
    document.title = `${title} — Northline Cold Storage`;
  }, [title]);
  useEffect(() => {
    dispatch({ type: 'set-scenario', value: routeState.scenario, fixture: routeState.fixture });
  }, [routeState.fixture, routeState.scenario]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, route: NorthlineRoute) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    router.navigate(route);
  }

  const load = selectLoad(state, 'NL-2048');
  return (
    <WgThemeProvider
      theme={routeState.theme}
      density={routeState.density}
      dir={routeState.direction}
    >
      <WgCanvas width="full">
        <header slot="header" className="northline-header">
          <div>
            <p>Wayglass reference application</p>
            <strong>Northline Cold Storage</strong>
          </div>
          <nav aria-label="Northline workspaces">
            <a
              href={router.href({ name: 'overview' })}
              onClick={(event) => navigate(event, { name: 'overview' })}
            >
              Overview
            </a>
            <a
              href={router.href({ name: 'function', value: 'dispatch' })}
              onClick={(event) => navigate(event, { name: 'function', value: 'dispatch' })}
            >
              Dispatch
            </a>
            <a
              href={router.href({ name: 'load', loadId: 'NL-2048' })}
              onClick={(event) => navigate(event, { name: 'load', loadId: 'NL-2048' })}
            >
              NL-2048
            </a>
          </nav>
        </header>
        <main>
          <header className="northline-heading">
            <p>Northline Cold Storage / Shift coordination</p>
            <h1>{title}</h1>
            <p>Can today’s outbound loads leave within temperature and schedule limits?</p>
          </header>
          <section className="northline-functions" aria-label="Operational functions">
            {northlineFunctions.map(({ value, label }) => (
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
          <WgPanel purpose="monitor" emphasis="strong" label="Representative dispatch exception">
            {load ? (
              <div className="northline-exception">
                <WgStatusIndicator
                  label={`${load.id} trailer observation requires review`}
                  condition={load.condition}
                  knowledge={load.trailerTemperature.knowledge}
                  size="prominent"
                />
                <p>
                  {load.trailerTemperature.value === null
                    ? 'Trailer temperature is unavailable.'
                    : `Last observed ${load.trailerTemperature.value} ${load.trailerTemperature.unit}.`}{' '}
                  Confirmed release state: {load.confirmedReleaseState}.
                </p>
              </div>
            ) : (
              <p>Loading dispatch records.</p>
            )}
          </WgPanel>
          <p className="northline-foundation-note">
            This foundation establishes application-owned truth, routes, scenarios, and command
            boundaries. Dense investigation and hold controls arrive in the next slices.
          </p>
        </main>
        <footer slot="footer">
          Private Phase 4C reference application · deterministic local data
        </footer>
      </WgCanvas>
    </WgThemeProvider>
  );
}
