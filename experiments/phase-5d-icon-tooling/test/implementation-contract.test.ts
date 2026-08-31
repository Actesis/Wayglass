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
    expect(contract).toContain('**Stage 0 result:** Passed on August 29, 2026.');
    expect(contract).toContain('node-22-linux-validation.md');
    expect(contract).toContain('are not permanent tooling');
    expect(contract).toContain('Phase 5D-B remains deferred');
    expect(decision).toContain('- Status: accepted');
    expect(decision).toContain('one private catalog');
    expect(decision).toContain('Keep runtime behavior separate from generated data');
    expect(decision).toContain('Gate migration on the minimum environment');
  });

  it('publishes the completed Stage 5 integration and validation', () => {
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
    expect(Object.keys(manifest.exports)).toEqual(['.', './icon']);
    expect(existsSync(join(repositoryRoot, 'tooling/icon-pipeline/src/catalog.ts'))).toBe(true);
    expect(existsSync(join(repositoryRoot, 'tooling/icon-pipeline/src/generation.ts'))).toBe(true);
    for (const output of [
      'packages/icons/src/generated/catalog.ts',
      'tooling/icon-pipeline/generated/source-manifest.json',
      'tooling/icon-pipeline/generated/output-manifest.json',
      'tooling/icon-pipeline/generated/review-index.html',
    ]) {
      expect(existsSync(join(repositoryRoot, output))).toBe(true);
    }
    expect(roadmap).toMatch(/Stage 6 proof\s+cleanup is the next authorized implementation step/);
    expect(readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md')).toContain(
      '**Stage 1 result:** Implemented on August 30, 2026.',
    );
    expect(readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md')).toContain(
      '**Stage 2 result:** Implemented on August 30, 2026.',
    );
    expect(readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md')).toContain(
      '**Stage 3 result:** Implemented on August 30, 2026.',
    );
    expect(readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md')).toContain(
      '**Stage 4A result:** Implemented on August 30, 2026.',
    );
    expect(readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md')).toContain(
      '**Stage 4B result:** Implemented on August 30, 2026.',
    );
    expect(readRepositoryFile('docs/governance/icon-tooling-implementation-contract.md')).toContain(
      '**Stage 5 result:** Implemented and validated on August 30, 2026.',
    );
    expect(existsSync(join(repositoryRoot, 'tests/browser/icons.spec.ts'))).toBe(true);
    expect(existsSync(join(repositoryRoot, 'apps/storybook/stories/icons.stories.ts'))).toBe(true);
    expect(
      existsSync(join(repositoryRoot, 'docs/accessibility/phase-5d-icon-runtime-validation.md')),
    ).toBe(true);
    expect(
      existsSync(
        join(repositoryRoot, 'tooling/icon-pipeline/evidence/stage-5-validation-matrix.md'),
      ),
    ).toBe(true);
    expect(docsConfig).toContain('/accessibility/phase-5d-icon-tooling-validation');
    expect(readRepositoryFile('package.json')).toContain('"icon-tooling:check"');
    expect(readRepositoryFile('package.json')).toContain('"icon-tooling:generate"');
  });
});
