import {
  harborFunctions,
  harborScenarios,
  type HarborFixture,
  type HarborFunction,
  type HarborScenario,
} from './model.js';

export type HarborRoute =
  | { name: 'overview' }
  | { name: 'function'; value: HarborFunction }
  | { name: 'task'; taskId: 'HL-317' };

export interface HarborRouteState {
  route: HarborRoute;
  scenario: HarborScenario;
  theme: 'wayglass-dark' | 'wayglass-light';
  density: 'compact' | 'comfortable';
  direction: 'ltr' | 'rtl';
  fixture: HarborFixture;
}

function acceptedValue<T extends string>(
  value: string | null,
  accepted: readonly T[],
  fallback: T,
): T {
  return value !== null && accepted.includes(value as T) ? (value as T) : fallback;
}

export function readHarborRoute(url: URL): HarborRouteState {
  const segments = url.pathname.split('/').filter(Boolean);
  let route: HarborRoute = { name: 'overview' };
  if (segments[0] === 'functions') {
    const value = harborFunctions.find((item) => item.value === segments[1])?.value;
    if (value) route = { name: 'function', value };
  } else if (segments[0] === 'tasks' && segments[1] === 'HL-317') {
    route = { name: 'task', taskId: 'HL-317' };
  }
  return {
    route,
    scenario: acceptedValue(url.searchParams.get('scenario'), harborScenarios, 'stale-evidence'),
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

export function harborRoutePath(route: HarborRoute): string {
  switch (route.name) {
    case 'overview':
      return '/';
    case 'function':
      return `/functions/${route.value}`;
    case 'task':
      return `/tasks/${route.taskId}`;
  }
}

export interface HarborRouter {
  current(): HarborRouteState;
  href(route: HarborRoute): string;
  navigate(route: HarborRoute): void;
  subscribe(listener: () => void): () => void;
}

export function createHarborRouter(browserWindow: Window): HarborRouter {
  const listeners = new Set<() => void>();
  let routeState = readHarborRoute(new URL(browserWindow.location.href));
  const notify = () => {
    routeState = readHarborRoute(new URL(browserWindow.location.href));
    for (const listener of listeners) listener();
  };
  browserWindow.addEventListener('popstate', notify);
  return {
    current: () => routeState,
    href: (route) => {
      const current = new URL(browserWindow.location.href);
      current.pathname = harborRoutePath(route);
      return `${current.pathname}${current.search}`;
    },
    navigate: (route) => {
      const current = new URL(browserWindow.location.href);
      current.pathname = harborRoutePath(route);
      browserWindow.history.pushState(null, '', current);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
