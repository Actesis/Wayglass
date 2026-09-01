import { describe, expect, it } from 'vitest';

import {
  assertCapacityResult,
  createCapacityFixture,
  runCapacityFixture,
} from '../src/capacity.js';

describe('Phase 5E fixed capacity fixture', () => {
  it('contains exactly 100 entities and 1,000 ordered and adverse messages', () => {
    const fixture = createCapacityFixture();

    expect(fixture.bindings).toHaveLength(100);
    expect(fixture.snapshot).toHaveLength(100);
    expect(fixture.events).toHaveLength(1_000);
    expect(new Set(fixture.bindings.map(({ key }) => key)).size).toBe(100);
    expect(fixture.events.filter(({ data }) => data.new_state === null)).toHaveLength(100);
    expect(fixture.events.filter(({ data }) => data.new_state?.state === 'unknown')).toHaveLength(
      100,
    );
    expect(
      fixture.events.filter(({ data }) => data.new_state?.state === 'unavailable'),
    ).toHaveLength(100);
  });

  it('preserves final semantics through duplicate, older, missing, and recovered updates', () => {
    const fixture = createCapacityFixture();
    const state = runCapacityFixture(fixture);

    expect(() => assertCapacityResult(state)).not.toThrow();
    expect(state.entities['capacity-000']).toMatchObject({
      reportedValue: 'final-0',
      knowledge: 'confirmed',
      lastUpdated: '2026-08-31T12:00:10.000Z',
    });
    expect(state.entities['capacity-099']).toMatchObject({
      reportedValue: 'final-99',
      knowledge: 'confirmed',
      lastUpdated: '2026-08-31T12:00:10.099Z',
    });
  });
});
