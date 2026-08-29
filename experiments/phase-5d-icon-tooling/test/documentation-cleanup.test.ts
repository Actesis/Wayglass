import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const experimentRoot = join(repositoryRoot, 'experiments/phase-5d-icon-tooling');
const evidenceRoot = join(experimentRoot, 'evidence');
const charterPath = join(repositoryRoot, 'docs/governance/explorations/phase-5d-icon-tooling.md');

const expectedEvidence = [
  'current-contract-and-source-inventory.md',
  'deterministic-generation-and-drift.md',
  'documentation-cleanup-and-proposed-disposition.md',
  'environment-and-capacity.md',
  'maintenance-and-task-comparison.md',
  'node-22-linux-validation.md',
  'runtime-compatibility-and-isolation.md',
  'security-dependency-and-removal.md',
  'static-review-and-accessibility.md',
] as const;

describe('Phase 5D evidence documentation and cleanup', () => {
  it('indexes every retained evidence record and marks the charter dispositioned', () => {
    const evidenceFiles = readdirSync(evidenceRoot)
      .filter((name) => name.endsWith('.md'))
      .sort();
    const readme = readFileSync(join(experimentRoot, 'README.md'), 'utf8');
    const charter = readFileSync(charterPath, 'utf8');

    expect(evidenceFiles).toEqual([...expectedEvidence].sort());
    for (const evidence of expectedEvidence) expect(readme).toContain(`evidence/${evidence}`);
    expect(charter).toContain('| Lifecycle state    | `dispositioned`');
    expect(charter).toContain('### Claims not supported');
    expect(charter).toContain('Accepted by the project owner on 2026-08-29');
    expect(charter).toContain('../icon-runtime-contract-reconciliation.md');
    for (const id of Array.from({ length: 9 }, (_, index) => `P5D-A-E0${index + 1}`))
      expect(charter).toContain(`\`${id}\``);
  });

  it('retains only the four authenticated generated artifacts and no temporary proof residue', () => {
    expect(readdirSync(join(experimentRoot, 'generated')).sort()).toEqual([
      'output-manifest.json',
      'review-index.html',
      'runtime-catalog.ts',
      'source-manifest.json',
    ]);

    const allNames = readdirSync(experimentRoot, { recursive: true }).map(String);
    expect(allNames).not.toContain('.benchmark-dist');
    expect(allNames.some((name) => /(?:\.bak|\.orig|\.tmp|~)$/.test(name))).toBe(false);
    expect(allNames.some((name) => /(?:^|\/)trace(?:s)?(?:\/|$)/i.test(name))).toBe(false);
  });
});
