import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { runIsolationAudit } from '../src/isolation.js';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));

describe('Phase 5E Stage 3 isolation and removal audit', () => {
  it('finds no production source, bundle, dependency, secret, endpoint, or removal leak', () => {
    const audit = runIsolationAudit(repositoryRoot, 'working-tree-test');

    expect(audit.productionSourceFilesScanned).toBeGreaterThan(0);
    expect(audit.builtFilesScanned).toBeGreaterThanOrEqual(0);
    expect(audit.proofExecutableFilesScanned).toBeGreaterThan(0);
    expect(audit.lockfileProofReferences).toBe(0);
    expect(audit.productionMarkerMatches).toEqual([]);
    expect(audit.builtMarkerMatches).toEqual([]);
    expect(audit.secretMatches).toEqual([]);
    expect(audit.endpointMatches).toEqual([]);
    expect(audit.unexpectedRetainedReferences).toEqual([]);
    if (audit.builtFilesScanned > 0) expect(audit.pass).toBe(true);
  });
});
