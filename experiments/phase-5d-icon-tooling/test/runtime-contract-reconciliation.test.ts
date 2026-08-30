import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const readRepositoryFile = (path: string) => readFileSync(join(repositoryRoot, path), 'utf8');

describe('Phase 5D runtime-contract reconciliation', () => {
  it('keeps the accepted foundation API authoritative', () => {
    const record = readRepositoryFile('docs/governance/icon-runtime-contract-reconciliation.md');
    const foundationContract = readRepositoryFile('docs/foundations/foundation-contracts.md');

    expect(record).toContain('**Status:** Accepted on August 29, 2026 by the project owner.');
    expect(record).toMatch(/remains the\s+authoritative runtime contract/);
    expect(record).toContain('`@wayglass/icons/icon` is the component-specific entry');
    expect(record).toContain('Missing or unknown names render nothing');
    expect(record).toContain('A non-empty label exposes one non-focusable image');
    expect(record).toContain('`compact`, `standard`, or `prominent`; default `standard`');
    expect(record).toContain('`auto`, `ltr`, or `rtl`; default `auto`');
    expect(record).toContain('The proof-only `arrow-inline-start` remains synthetic');
    expect(foundationContract).toContain('../governance/icon-runtime-contract-reconciliation.md');
  });

  it('records that reconciliation does not silently migrate the current runtime', () => {
    const record = readRepositoryFile('docs/governance/icon-runtime-contract-reconciliation.md');
    const roadmap = readRepositoryFile('docs/phase-5.md');
    const runtime = readRepositoryFile('packages/icons/src/index.ts');
    const manifest = JSON.parse(readRepositoryFile('packages/icons/package.json')) as {
      exports: Record<string, unknown>;
    };

    expect(record).toContain('This decision does not change production code.');
    expect(record).toContain('authorizes no production source change');
    expect(runtime).toContain("this.name = 'more';");
    expect(runtime).toContain("this.setAttribute('aria-hidden', 'true');");
    expect(runtime).not.toContain('declare label:');
    expect(Object.keys(manifest.exports)).toEqual(['.']);
    expect(roadmap).toContain('./governance/icon-tooling-implementation-contract.md');
    expect(roadmap).toContain('./architecture/adr/0034-private-icon-pipeline-architecture.md');
    expect(roadmap).toContain('Stage 0 passed on Node 22.13/Linux');
    expect(roadmap).toMatch(/The next\s+authorized implementation step is Stage 3/);
  });

  it('records the project-owner deferral of Phase 5D-B', () => {
    const record = readRepositoryFile('docs/governance/icon-runtime-contract-reconciliation.md');
    const roadmap = readRepositoryFile('docs/phase-5.md');

    expect(record).toContain('Phase 5D-B design-library work is deferred by the project owner');
    expect(roadmap).toContain('Phase 5D-B design-library work was deferred by the project owner');
  });
});
