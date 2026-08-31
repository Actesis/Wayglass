import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const experimentRoot = join(repositoryRoot, 'experiments/phase-5d-icon-tooling');

const retiredPaths = [
  'experiments/phase-5d-icon-tooling/generated',
  'experiments/phase-5d-icon-tooling/src',
  'experiments/phase-5d-icon-tooling/test',
  'experiments/phase-5d-icon-tooling/README.md',
  'experiments/phase-5d-icon-tooling/removal-plan.json',
  'experiments/phase-5d-icon-tooling/tsconfig.json',
  'experiments/phase-5d-icon-tooling/vitest.config.ts',
  'tests/browser/phase-5d-icon-review.spec.ts',
  'tests/browser/phase-5d-runtime-isolation.spec.ts',
  'tooling/icon-pipeline/test/runtime-parity.test.ts',
] as const;

const historicalEvidence = [
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

describe('retired Phase 5D executable proof', () => {
  it('keeps the executable proof and migration-only parity fixture absent', () => {
    for (const path of retiredPaths) {
      expect(existsSync(join(repositoryRoot, path)), `${path} must stay retired`).toBe(false);
    }
  });

  it('retains the complete historical evidence set without executable siblings', () => {
    expect(readdirSync(experimentRoot).filter((entry) => entry !== 'node_modules')).toEqual([
      'evidence',
    ]);
    expect(readdirSync(join(experimentRoot, 'evidence')).sort()).toEqual(historicalEvidence);
  });

  it('keeps governance and permanent validation records discoverable', () => {
    for (const path of [
      'docs/architecture/adr/0034-private-icon-pipeline-architecture.md',
      'docs/governance/explorations/phase-5d-icon-tooling.md',
      'docs/governance/icon-runtime-contract-reconciliation.md',
      'docs/governance/icon-tooling-implementation-contract.md',
      'tooling/icon-pipeline/evidence/stage-5-validation-matrix.md',
      'tooling/icon-pipeline/evidence/stage-6-cleanup.md',
    ]) {
      expect(
        readFileSync(join(repositoryRoot, path), 'utf8').length,
        `${path} is empty`,
      ).toBeGreaterThan(0);
    }
  });
});
