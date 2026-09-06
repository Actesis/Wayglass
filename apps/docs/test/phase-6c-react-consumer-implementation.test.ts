import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-react-consumer-implementation.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-D3 React consumer implementation record', () => {
  it('records the exact four-way version cross-product', () => {
    for (const fact of ['`5.9.3`', '`6.0.3`', '`19.0.0`', '`19.2.8`', '`19.2.17`', '`19.2.3`']) {
      expect(record).toContain(fact);
    }
    expect(record).toContain('Vite remains exact at `8.1.5`');
  });

  it('keeps client fallback distinct from unsupported hydration and SSR', () => {
    expect(record).toContain('client-only fallback rather than server rendering');
    expect(record).toContain('does not call `hydrateRoot`, claim SSR');
    expect(record).toContain('discarded deliberately before client ownership begins');
  });

  it('records guarded registration, parity, and event adaptation', () => {
    expect(record).toContain('imports only the `@wayglass/react/toggle` wrapper');
    expect(record).toContain('unrelated direct `wg-boolean-value` element was not registered');
    expect(record).toContain('typed `onWgToggleRequest` adapter');
    expect(record).toContain('wrapper/direct parity');
  });

  it('requires tree-shaking and complete React removal', () => {
    expect(record).toContain('rejects unused `wg-media-viewer` and `wg-tabs`');
    for (const name of ['`@wayglass/react`', '`react`', '`react-dom`', '`@types/react`']) {
      expect(record).toContain(name);
    }
    expect(record).toContain('`WG_REACT_BINDING_REMOVED`');
  });

  it('retains the material limitation and D4 acceptance gate', () => {
    expect(record).toContain('**Status:** Proposed for project-owner acceptance');
    expect(record).toContain('release-candidate suite passes 64 assertions');
    expect(record).toContain('all 14 scheduled builds');
    expect(record).toContain('all 20 scheduled typecheck tasks');
    expect(record).toContain('all 20 scheduled package and application test tasks');
    expect(record).toContain('including 242 documentation assertions');
    expect(record).toContain('the minimum compiler and React lines are absent');
    expect(record).toContain('authorizes Phase 6C-D4 cross-browser consumer proof only');
    expect(record).toContain('does not accept a Vanilla, React, or browser result');
  });
});
