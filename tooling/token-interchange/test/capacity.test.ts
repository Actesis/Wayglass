import { describe, expect, it } from 'vitest';

import { measureTokenToolingCapacity, scaleNormalizedTokenGraph } from '../src/capacity.js';
import { createWayglassTokenGraph } from '../src/source.js';

const revision = '0123456789abcdef0123456789abcdef01234567';

describe('token-tooling capacity fixtures', () => {
  it('constructs exactly 10× tokens and overrides while preserving modes and aliases', () => {
    const current = createWayglassTokenGraph();
    const scaled = scaleNormalizedTokenGraph(current, 10);

    expect(scaled.tokens).toHaveLength(current.tokens.length * 10);
    expect(scaled.modes).toHaveLength(current.modes.length);
    expect(scaled.modes.flatMap((mode) => mode.overrides)).toHaveLength(
      current.modes.flatMap((mode) => mode.overrides).length * 10,
    );
    expect(new Set(scaled.tokens.map((token) => token.source)).size).toBe(scaled.tokens.length);
    expect(
      scaled.tokens.find(
        (token) => token.source === 'capacity-02.color.semantic.condition.positive',
      ),
    ).toMatchObject({
      value: '{capacity-02.color.reference.green.500}',
      alias: { source: 'capacity-02.color.reference.green.500' },
    });
  });

  it('rejects invalid scale and repetition inputs', () => {
    const graph = createWayglassTokenGraph();
    expect(() => scaleNormalizedTokenGraph(graph, 0)).toThrow(/positive safe integer/);
    expect(() => scaleNormalizedTokenGraph(graph, 1.5)).toThrow(/positive safe integer/);
    expect(() => measureTokenToolingCapacity('working-tree', 1)).toThrow(/hexadecimal commit/);
    expect(() => measureTokenToolingCapacity(revision, 0)).toThrow(/positive safe integer/);
  });

  it('measures current and 10× corpora without inventing a threshold', () => {
    const measurement = measureTokenToolingCapacity(revision, 1);

    expect(measurement.results.map((result) => result.name)).toEqual(['current', 'synthetic-10x']);
    expect(measurement.results[0]).toMatchObject({
      corpus: { factor: 1, tokens: 528, modeOverrides: 197 },
      output: { webFiles: 3, dtcgFiles: 7 },
      warm: { repetitions: 1 },
    });
    expect(measurement.results[1]).toMatchObject({
      corpus: { factor: 10, tokens: 5280, modeOverrides: 1970 },
      output: { webFiles: 3, dtcgFiles: 7 },
      warm: { repetitions: 1 },
    });
  });
});
