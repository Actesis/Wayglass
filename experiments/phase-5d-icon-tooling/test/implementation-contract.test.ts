import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const readRepositoryFile = (path: string) => readFileSync(join(repositoryRoot, path), 'utf8');

describe('Phase 5D private icon-tooling contract', () => {
  it('defines one private source and the exact authenticated output set', () => {
    const contract = readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md');

    expect(contract).toContain('**Status:** Accepted by the project owner on August 29, 2026.');
    expect(contract).toContain('`tooling/icon-pipeline/src/catalog.ts`');
    for (const output of [
      'packages/icons/src/generated/catalog.ts',
      'tooling/icon-pipeline/generated/source-manifest.json',
      'tooling/icon-pipeline/generated/output-manifest.json',
      'tooling/icon-pipeline/generated/review-index.html',
    ]) {
      expect(contract).toContain(output);
    }
    expect(contract).toContain('`pnpm icon-tooling:check`');
    expect(contract).toContain('`pnpm icon-tooling:generate`');
    expect(contract).toContain(
      'The production catalog initially remains exactly `close`, `menu`, `more`, and `refresh`',
    );
  });

  it('precommits the trimmed boundary and minimum-environment gate', () => {
    const contract = readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md');
    const decision = readRepositoryFile(
      'docs/architecture/adr/0034-private-icon-pipeline-architecture.md',
    );

    expect(contract).toContain('0. run the unchanged accepted proof');
    expect(contract).toContain('Node 22.13 and Linux');
    expect(contract).toContain('are not permanent tooling');
    expect(contract).toContain('Phase 5D-B remains deferred');
    expect(decision).toContain('- Status: accepted');
    expect(decision).toContain('one private catalog');
    expect(decision).toContain('Keep runtime behavior separate from generated data');
    expect(decision).toContain('Gate migration on the minimum environment');
  });

  it('publishes the proposal in documentation without migrating production', () => {
    const roadmap = readRepositoryFile('docs/phase-5.md');
    const charter = readRepositoryFile('docs/governance/explorations/phase-5d-icon-tooling.md');
    const docsConfig = readRepositoryFile('apps/docs/.vitepress/config.ts');
    const manifest = JSON.parse(readRepositoryFile('packages/icons/package.json')) as {
      exports: Record<string, unknown>;
    };

    expect(roadmap).toContain('./governance/icon-tooling-implementation-contract.md');
    expect(roadmap).toContain('./architecture/adr/0034-private-icon-pipeline-architecture.md');
    expect(charter).toContain('../icon-tooling-implementation-contract.md');
    expect(docsConfig).toContain('/governance/icon-tooling-implementation-contract');
    expect(docsConfig).toContain('/architecture/adr/0034-private-icon-pipeline-architecture');
    expect(Object.keys(manifest.exports)).toEqual(['.']);
    expect(existsSync(join(repositoryRoot, 'tooling/icon-pipeline'))).toBe(false);
  });
});
