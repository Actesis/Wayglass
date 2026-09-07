import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-package-dependency-audits.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E2 package and dependency audit record', () => {
  it('binds package findings to exact bytes from the accepted packing path', () => {
    expect(record).toContain('exact projected manifest and unpacked `PackageFile` byte array');
    expect(record).toContain('reuses the existing package-file inspector');
    expect(record).toContain('packed `LICENSE` and `NOTICE` hashes');
    expect(record).toContain('workspace as a substitute for packed bytes');
  });

  it('proves an exact reachable production graph from actual package evidence', () => {
    expect(record).toContain("actual installed package's `package.json`");
    expect(record).toContain('any package-root license or notice file bytes');
    expect(record).toContain('every retained node is reachable from a production root');
    expect(record).toContain('seven-node reachable production graph');
    expect(record).toContain(
      'does not infer a license, dependency, or version from a package name',
    );
  });

  it('keeps lifecycle scripts and canonical verification explicit', () => {
    expect(record).toContain('retains an empty `licenseFiles` array');
    expect(record).toContain('requires owner disposition');
    expect(record).toContain('missing or empty manifest license still fails closed');
    expect(record).toContain('neither retained nor executed by this pure audit');
    expect(record).toContain('literal `allProductionNodesReachable: true` flag is necessary');
    expect(record).toContain('serializers share one recursive canonical JSON implementation');
    expect(record).toContain('91 focused tests across 18 files');
  });

  it('authorizes only E3 after owner acceptance', () => {
    expect(record).toContain('Acceptance completes Phase 6C-E2 and authorizes Phase 6C-E3');
    expect(record).toContain('does not accept a candidate or evidence bundle');
    expect(record).toContain('E2 performs no advisory lookup');
  });
});
