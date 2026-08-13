import { describe, expect, it } from 'vitest';

import { cedarRoutePath, readCedarRoute } from '../src/router.js';

describe('Cedar House routes', () => {
  it('reads typed human-meaningful routes and validation options', () => {
    expect(
      readCedarRoute(
        new URL(
          'https://wayglass.test/functions/access?scenario=secure-partial&theme=wayglass-light&density=compact&dir=rtl&fixture=maximum',
        ),
      ),
    ).toEqual({
      route: { name: 'function', value: 'access' },
      scenario: 'secure-partial',
      theme: 'wayglass-light',
      density: 'compact',
      direction: 'rtl',
      fixture: 'maximum',
    });
  });

  it('falls back safely for unknown paths and query values', () => {
    expect(readCedarRoute(new URL('https://wayglass.test/not-a-place?scenario=random'))).toEqual({
      route: { name: 'overview' },
      scenario: 'steady',
      theme: 'wayglass-dark',
      density: 'comfortable',
      direction: 'ltr',
      fixture: 'standard',
    });
  });

  it('builds stable overview, function, and asset paths', () => {
    expect(cedarRoutePath({ name: 'overview' })).toBe('/');
    expect(cedarRoutePath({ name: 'function', value: 'maintenance' })).toBe(
      '/functions/maintenance',
    );
    expect(cedarRoutePath({ name: 'asset', assetId: 'hvac-air-handler' })).toBe(
      '/assets/hvac-air-handler',
    );
  });
});
