import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createDtcgExchange } from '../src/dtcg.js';
import { createWayglassTokenGraph } from '../src/source.js';
import { currentWebPolicy } from '../src/web-policy.js';
import { createWebThemeCss, createWebTokenCss } from '../src/web.js';

function measure(content: string): { readonly sha256: string; readonly bytes: number } {
  return {
    sha256: createHash('sha256').update(content, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(content, 'utf8'),
  };
}

describe('Phase 5B deterministic output fingerprint', () => {
  it('prints one authenticated fingerprint for cross-environment comparison', () => {
    const sourceRevision = process.env['WAYGLASS_SOURCE_REVISION'];
    expect(sourceRevision, 'Set WAYGLASS_SOURCE_REVISION to the validated commit.').toMatch(
      /^[0-9a-f]{7,64}$/i,
    );

    const experimentRoot = fileURLToPath(new URL('..', import.meta.url));
    const repositoryRoot = resolve(experimentRoot, '../..');
    const headRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }).trim();
    const trackedChanges = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }).trim();
    expect(sourceRevision, 'WAYGLASS_SOURCE_REVISION must equal the checked-out commit.').toBe(
      headRevision,
    );
    expect(trackedChanges, 'Commit tracked changes before validating determinism.').toBe('');

    const graph = createWayglassTokenGraph();
    const exchange = createDtcgExchange(graph, {
      defaultTheme: 'wayglass-dark',
      defaultDensity: 'compact',
      sourceRevision: sourceRevision!,
    });
    const fingerprint = {
      sourceRevision,
      graph: {
        tokens: graph.tokens.length,
        modes: graph.modes.length,
        overrides: graph.modes.reduce((total, mode) => total + mode.overrides.length, 0),
      },
      web: {
        tokens: measure(createWebTokenCss(graph)),
        themes: measure(createWebThemeCss(graph, currentWebPolicy)),
      },
      exchange: {
        status: exchange.manifest.status,
        includedTokens: exchange.manifest.includedTokens,
        omittedTokens: exchange.manifest.omittedTokens,
        omittedOverrides: exchange.manifest.omittedOverrides,
        files: Object.fromEntries(
          Object.entries(exchange.files)
            .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
            .map(([path, content]) => [path, measure(content)]),
        ),
      },
    };

    process.stdout.write(`WAYGLASS_PHASE5B_FINGERPRINT=${JSON.stringify(fingerprint)}\n`);
    expect(fingerprint.graph).toEqual({ tokens: 528, modes: 4, overrides: 197 });
    expect(Object.keys(fingerprint.exchange.files)).toEqual([
      'modes/density/comfortable.json',
      'modes/density/compact.json',
      'modes/theme/wayglass-dark.json',
      'modes/theme/wayglass-light.json',
      'resolver.json',
      'tokens.json',
      'wayglass-manifest.json',
    ]);
  });
});
