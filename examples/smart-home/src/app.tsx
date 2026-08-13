import { WgCanvas, WgThemeProvider } from '@wayglass/react';
import { useEffect, useReducer, useSyncExternalStore, type MouseEvent } from 'react';

import { cedarFunctions, createCedarHouseState, reduceCedarHouse } from './model.js';
import { cedarRoutePath, type CedarRoute, type CedarRouter } from './router.js';

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

export function CedarHouseApp({ router }: { router: CedarRouter }) {
  const routeState = useSyncExternalStore(router.subscribe, router.current);
  const [state, dispatch] = useReducer(reduceCedarHouse, routeState.scenario, (scenario) =>
    createCedarHouseState(scenario),
  );
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

  return (
    <WgThemeProvider
      theme={routeState.theme}
      density={routeState.density}
      dir={routeState.direction}
    >
      <WgCanvas width="full">
        <header slot="header" className="cedar-header">
          <p>Wayglass reference application</p>
          <h1>Cedar House</h1>
          <nav aria-label="Cedar House places">
            <a
              href={cedarRoutePath({ name: 'overview' })}
              onClick={(event) => navigate(event, { name: 'overview' })}
            >
              Overview
            </a>
            {cedarFunctions.map((item) => (
              <a
                key={item.value}
                href={cedarRoutePath({ name: 'function', value: item.value })}
                onClick={(event) => navigate(event, { name: 'function', value: item.value })}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        <main id="main-content" data-route={routeState.route.name}>
          <p>{routeState.route.name === 'overview' ? 'Cedar House' : 'Cedar House / Overview'}</p>
          <h2>{title}</h2>
          <p>
            Application foundations are active. Household composition and workflows arrive in the
            next Phase 4B slices.
          </p>
        </main>
        <p className="cedar-announcement" aria-live="polite" aria-atomic="true">
          {state.announcement?.message ?? ''}
        </p>
        <footer slot="footer">
          <span>Scenario: {state.scenario.replaceAll('-', ' ')}</span>
        </footer>
      </WgCanvas>
    </WgThemeProvider>
  );
}
