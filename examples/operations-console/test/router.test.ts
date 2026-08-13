import { describe, expect, it } from 'vitest';
import { northlineRoutePath, readNorthlineRoute } from '../src/router.js';

describe('Northline routes', () => {
  it('reads typed routes and validation options', () => {
    expect(
      readNorthlineRoute(
        new URL(
          'https://wayglass.test/functions/dispatch?scenario=hold-failed&theme=wayglass-light&density=comfortable&dir=rtl&fixture=maximum',
        ),
      ),
    ).toEqual({
      route: { name: 'function', value: 'dispatch' },
      scenario: 'hold-failed',
      theme: 'wayglass-light',
      density: 'comfortable',
      direction: 'rtl',
      fixture: 'maximum',
    });
  });
  it('falls back safely for unknown values', () => {
    expect(readNorthlineRoute(new URL('https://wayglass.test/unknown?scenario=random'))).toEqual({
      route: { name: 'overview' },
      scenario: 'stale-trailer',
      theme: 'wayglass-dark',
      density: 'compact',
      direction: 'ltr',
      fixture: 'standard',
    });
  });
  it('builds stable overview, function, and load paths', () => {
    expect(northlineRoutePath({ name: 'overview' })).toBe('/');
    expect(northlineRoutePath({ name: 'function', value: 'dispatch' })).toBe('/functions/dispatch');
    expect(northlineRoutePath({ name: 'load', loadId: 'NL-2048' })).toBe('/loads/NL-2048');
  });
});
