import {
  cedarFunctions,
  cedarScenarios,
  type CedarFixture,
  type CedarFunction,
  type CedarScenario,
} from './model.js';

export type CedarRoute =
  | { name: 'overview' }
  | { name: 'function'; value: CedarFunction }
  | { name: 'asset'; assetId: 'hvac-air-handler' };

export interface CedarRouteState {
  route: CedarRoute;
  scenario: CedarScenario;
  theme: 'wayglass-dark' | 'wayglass-light';
  density: 'compact' | 'comfortable';
  direction: 'ltr' | 'rtl';
  fixture: CedarFixture;
}

function acceptedValue<T extends string>(
  value: string | null,
  accepted: readonly T[],
  fallback: T,
): T {
  return value !== null && accepted.includes(value as T) ? (value as T) : fallback;
}

export function readCedarRoute(url: URL): CedarRouteState {
  const segments = url.pathname.split('/').filter(Boolean);
  let route: CedarRoute = { name: 'overview' };
  if (segments[0] === 'functions') {
    const value = cedarFunctions.find((item) => item.value === segments[1])?.value;
    if (value) route = { name: 'function', value };
  } else if (segments[0] === 'assets' && segments[1] === 'hvac-air-handler') {
    route = { name: 'asset', assetId: 'hvac-air-handler' };
  }

  return {
    route,
    scenario: acceptedValue(url.searchParams.get('scenario'), cedarScenarios, 'steady'),
    theme: acceptedValue(
      url.searchParams.get('theme'),
      ['wayglass-dark', 'wayglass-light'],
      'wayglass-dark',
    ),
    density: acceptedValue(
      url.searchParams.get('density'),
      ['compact', 'comfortable'],
      'comfortable',
    ),
    direction: acceptedValue(url.searchParams.get('dir'), ['ltr', 'rtl'], 'ltr'),
    fixture: acceptedValue(url.searchParams.get('fixture'), ['standard', 'maximum'], 'standard'),
  };
}

export function cedarRoutePath(route: CedarRoute): string {
  switch (route.name) {
    case 'overview':
      return '/';
    case 'function':
      return `/functions/${route.value}`;
    case 'asset':
      return `/assets/${route.assetId}`;
  }
}

export interface CedarRouter {
  current(): CedarRouteState;
  href(route: CedarRoute): string;
  navigate(route: CedarRoute): void;
  subscribe(listener: () => void): () => void;
}

export function createCedarRouter(browserWindow: Window): CedarRouter {
  const listeners = new Set<() => void>();
  let routeState = readCedarRoute(new URL(browserWindow.location.href));
  const notify = () => {
    routeState = readCedarRoute(new URL(browserWindow.location.href));
    for (const listener of listeners) listener();
  };
  browserWindow.addEventListener('popstate', notify);

  return {
    current: () => routeState,
    href: (route) => {
      const current = new URL(browserWindow.location.href);
      current.pathname = cedarRoutePath(route);
      return `${current.pathname}${current.search}`;
    },
    navigate: (route) => {
      const current = new URL(browserWindow.location.href);
      current.pathname = cedarRoutePath(route);
      browserWindow.history.pushState(null, '', current);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
