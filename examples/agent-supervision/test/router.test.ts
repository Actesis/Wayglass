import { describe, expect, it } from 'vitest';
import { harborRoutePath, readHarborRoute } from '../src/router.js';

describe('Harbor Lab routes', () => {
  it('reads typed routes and validation options', () => {
    expect(
      readHarborRoute(
        new URL(
          'https://wayglass.test/functions/review-approval?scenario=approval-timeout&theme=wayglass-light&density=comfortable&dir=rtl&fixture=maximum',
        ),
      ),
    ).toEqual({
      route: { name: 'function', value: 'review-approval' },
      scenario: 'approval-timeout',
      theme: 'wayglass-light',
      density: 'comfortable',
      direction: 'rtl',
      fixture: 'maximum',
    });
  });

  it('falls back safely for unknown values', () => {
    expect(readHarborRoute(new URL('https://wayglass.test/unknown?scenario=random'))).toEqual({
      route: { name: 'overview' },
      scenario: 'stale-evidence',
      theme: 'wayglass-dark',
      density: 'compact',
      direction: 'ltr',
      fixture: 'standard',
    });
  });

  it('builds stable overview, function, and task paths', () => {
    expect(harborRoutePath({ name: 'overview' })).toBe('/');
    expect(harborRoutePath({ name: 'function', value: 'execution' })).toBe('/functions/execution');
    expect(harborRoutePath({ name: 'task', taskId: 'HL-317' })).toBe('/tasks/HL-317');
  });
});
