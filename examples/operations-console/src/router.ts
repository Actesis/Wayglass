import {
  northlineFunctions,
  northlineScenarios,
  type NorthlineFixture,
  type NorthlineFunction,
  type NorthlineScenario,
} from './model.js';

export type NorthlineRoute =
  | { name: 'overview' }
  | { name: 'function'; value: NorthlineFunction }
  | { name: 'load'; loadId: 'NL-2048' };

export interface NorthlineRouteState {
  route: NorthlineRoute;
  scenario: NorthlineScenario;
  theme: 'wayglass-dark' | 'wayglass-light';
  density: 'compact' | 'comfortable';
  direction: 'ltr' | 'rtl';
  fixture: NorthlineFixture;
}

function acceptedValue<T extends string>(
  value: string | null,
  accepted: readonly T[],
  fallback: T,
): T {
  return value !== null && accepted.includes(value as T) ? (value as T) : fallback;
}

export function readNorthlineRoute(url: URL): NorthlineRouteState {
  const segments = url.pathname.split('/').filter(Boolean);
  let route: NorthlineRoute = { name: 'overview' };
  if (segments[0] === 'functions') {
    const value = northlineFunctions.find((item) => item.value === segments[1])?.value;
    if (value) route = { name: 'function', value };
  } else if (segments[0] === 'loads' && segments[1] === 'NL-2048') {
    route = { name: 'load', loadId: 'NL-2048' };
  }
  return {
    route,
    scenario: acceptedValue(url.searchParams.get('scenario'), northlineScenarios, 'stale-trailer'),
    theme: acceptedValue(
      url.searchParams.get('theme'),
      ['wayglass-dark', 'wayglass-light'],
      'wayglass-dark',
    ),
    density: acceptedValue(url.searchParams.get('density'), ['compact', 'comfortable'], 'compact'),
    direction: acceptedValue(url.searchParams.get('dir'), ['ltr', 'rtl'], 'ltr'),
    fixture: acceptedValue(url.searchParams.get('fixture'), ['standard', 'maximum'], 'standard'),
  };
}

export function northlineRoutePath(route: NorthlineRoute): string {
  switch (route.name) {
    case 'overview':
      return '/';
    case 'function':
      return `/functions/${route.value}`;
    case 'load':
      return `/loads/${route.loadId}`;
  }
}

export interface NorthlineRouter {
  current(): NorthlineRouteState;
  href(route: NorthlineRoute): string;
  navigate(route: NorthlineRoute): void;
  subscribe(listener: () => void): () => void;
}

export function createNorthlineRouter(browserWindow: Window): NorthlineRouter {
  const listeners = new Set<() => void>();
  let routeState = readNorthlineRoute(new URL(browserWindow.location.href));
  const notify = () => {
    routeState = readNorthlineRoute(new URL(browserWindow.location.href));
    for (const listener of listeners) listener();
  };
  browserWindow.addEventListener('popstate', notify);
  return {
    current: () => routeState,
    href: (route) => {
      const current = new URL(browserWindow.location.href);
      current.pathname = northlineRoutePath(route);
      return `${current.pathname}${current.search}`;
    },
    navigate: (route) => {
      const current = new URL(browserWindow.location.href);
      current.pathname = northlineRoutePath(route);
      browserWindow.history.pushState(null, '', current);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
