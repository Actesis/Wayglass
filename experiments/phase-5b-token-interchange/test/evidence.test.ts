import { describe, expect, it } from 'vitest';

import {
  densityTokenOverrides,
  themeTokenOverrides,
} from '../../../packages/themes/src/definitions.js';
import { tokens } from '../../../packages/tokens/src/definitions.js';
import { createDtcgExchange, type DtcgExchange } from '../src/dtcg.js';
import { compareDtcgArtifacts, verifyDtcgExchange } from '../src/evidence.js';
import { createNormalizedTokenGraph, type NormalizedTokenGraph } from '../src/normalize.js';
import { createWayglassTokenGraph } from '../src/source.js';
import { createWebTokenCss } from '../src/web.js';

const policy = {
  defaultTheme: 'wayglass-dark',
  defaultDensity: 'compact',
  sourceRevision: '0123456789abcdef0123456789abcdef01234567',
} as const;

function exchange(graph = createWayglassTokenGraph()): DtcgExchange {
  return createDtcgExchange(graph, policy);
}

describe('DTCG exchange evidence', () => {
  it('records the pinned schema, source revision, every reversible identity, and artifact hashes', () => {
    const result = exchange();

    expect(result.manifest).toMatchObject({
      sourceRevision: policy.sourceRevision,
      schemaVersion: '2025.10',
    });
    expect(result.manifest.identities).toHaveLength(createWayglassTokenGraph().tokens.length);
    expect(result.manifest.identities[0]).toEqual({
      source: 'border.semantic.function',
      exchange: 'border.semantic.function',
    });
    expect(result.manifest.identities).toContainEqual({
      source: 'component.panel.space',
      exchange: 'component.panel.space.$root',
    });
    expect(Object.keys(result.manifest.artifacts)).toEqual([
      'modes/density/comfortable.json',
      'modes/density/compact.json',
      'modes/theme/wayglass-dark.json',
      'modes/theme/wayglass-light.json',
      'resolver.json',
      'tokens.json',
    ]);
    expect(result.manifest.artifacts['tokens.json']).toMatchObject({
      sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      bytes: expect.any(Number),
    });
  });

  it('verifies an intact exchange and rejects changed content with a stable diagnostic', () => {
    const result = exchange();
    expect(() => verifyDtcgExchange(result)).not.toThrow();

    const changed = {
      ...result,
      files: { ...result.files, 'tokens.json': `${result.files['tokens.json']} ` },
    };
    expect(() => verifyDtcgExchange(changed)).toThrow(
      /^DTCG exchange artifact "tokens.json" failed SHA-256 verification:/,
    );
  });

  it('rejects missing or unexpected artifact paths before checking content', () => {
    const result = exchange();
    const { 'tokens.json': removed, ...withoutTokens } = result.files;
    expect(removed).toBeDefined();
    expect(() => verifyDtcgExchange({ ...result, files: withoutTokens })).toThrow(
      /^DTCG exchange artifact inventory mismatch:/,
    );

    expect(() =>
      verifyDtcgExchange({
        ...result,
        files: { ...result.files, 'unexpected.json': '{}\n' },
      }),
    ).toThrow(/^DTCG exchange artifact inventory mismatch:/);
  });

  it('produces identical files and measurements when raw input order is reversed', () => {
    const reversedGraph = createNormalizedTokenGraph({
      tokens: Object.fromEntries(Object.entries(tokens).reverse()),
      themes: Object.fromEntries(
        Object.entries(themeTokenOverrides)
          .reverse()
          .map(([name, overrides]) => [
            name,
            Object.fromEntries(Object.entries(overrides).reverse()),
          ]),
      ),
      densities: Object.fromEntries(
        Object.entries(densityTokenOverrides)
          .reverse()
          .map(([name, overrides]) => [
            name,
            Object.fromEntries(Object.entries(overrides).reverse()),
          ]),
      ),
    });

    expect(exchange(reversedGraph)).toEqual(exchange());
  });

  it('reports a targeted artifact drift for one meaningful source-value change', () => {
    const graph = createWayglassTokenGraph();
    const changedGraph: NormalizedTokenGraph = {
      ...graph,
      tokens: graph.tokens.map((token) =>
        token.source === 'color.reference.blue.500' ? { ...token, value: '#508dff' } : token,
      ),
    };

    expect(compareDtcgArtifacts(exchange(graph), exchange(changedGraph))).toEqual({
      added: [],
      changed: ['tokens.json'],
      removed: [],
    });
  });

  it('carries one authoritative value change through both outputs without identity drift', () => {
    const graph = createWayglassTokenGraph();
    const changedGraph: NormalizedTokenGraph = {
      ...graph,
      tokens: graph.tokens.map((token) =>
        token.source === 'color.reference.blue.500' ? { ...token, value: '#508dff' } : token,
      ),
    };
    const baselineExchange = exchange(graph);
    const changedExchange = exchange(changedGraph);

    expect(createWebTokenCss(changedGraph)).toBe(
      createWebTokenCss(graph).replace(
        '--wg-color-reference-blue-500: #4f8cff;',
        '--wg-color-reference-blue-500: #508dff;',
      ),
    );
    expect(compareDtcgArtifacts(baselineExchange, changedExchange)).toEqual({
      added: [],
      changed: ['tokens.json'],
      removed: [],
    });
    expect(changedExchange.manifest.identities).toEqual(baselineExchange.manifest.identities);
    expect(changedExchange.manifest.omittedTokens).toEqual(baselineExchange.manifest.omittedTokens);
    expect(changedExchange.manifest.omittedOverrides).toEqual(
      baselineExchange.manifest.omittedOverrides,
    );
  });

  it('rejects duplicate output paths and invalid source revisions before returning artifacts', () => {
    const graph = createWayglassTokenGraph();
    const duplicateModeGraph: NormalizedTokenGraph = {
      ...graph,
      modes: [...graph.modes, graph.modes[0]!],
    };

    expect(() => exchange(duplicateModeGraph)).toThrow(
      'DTCG exchange output path "modes/theme/wayglass-dark.json" is duplicated.',
    );
    expect(() => createDtcgExchange(graph, { ...policy, sourceRevision: 'working-tree' })).toThrow(
      'DTCG exchange source revision must be a 7–64 character hexadecimal commit.',
    );
  });
});
