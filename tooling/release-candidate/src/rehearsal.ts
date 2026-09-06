import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { buildCandidate } from './assembler.ts';
import { runBrowserConsumerMatrix, type BrowserConsumerMatrixResult } from './browser-probe.ts';
import { frozenSource } from './constants.ts';
import { validateConsumerStore } from './consumer-harness.ts';
import { offlineEnvironment } from './environment.ts';
import { fail } from './error.ts';
import { preflightConsumerMaterial } from './material-preflight.ts';
import { identifyRepository } from './repository.ts';
import type { CommandRunner } from './types.ts';

export interface RehearsalResult {
  readonly sourceCommit: string;
  readonly packages: 6;
  readonly vanillaScenarios: 2;
  readonly reactScenarios: 4;
  readonly browserCases: 36;
  readonly ephemeral: true;
}

export interface RehearsalOperations {
  readonly preflight: typeof preflightConsumerMaterial;
  readonly build: typeof buildCandidate;
  readonly consumers: (
    request: Parameters<typeof runBrowserConsumerMatrix>[0],
  ) => Promise<BrowserConsumerMatrixResult>;
}

const defaultOperations: RehearsalOperations = Object.freeze({
  preflight: preflightConsumerMaterial,
  build: buildCandidate,
  consumers: runBrowserConsumerMatrix,
});

export async function runIntegratedRehearsal(
  cwd: string,
  source: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
  operations: RehearsalOperations = defaultOperations,
): Promise<RehearsalResult> {
  if (source !== frozenSource.commit) {
    fail('WG_RC_SOURCE_COMMIT', `Rehearsal requires frozen source ${frozenSource.commit}.`);
  }
  const environment = offlineEnvironment(inputEnvironment);
  const repository = await identifyRepository(cwd, runner);
  const storePath = resolve(repository.root, '.pnpm-store');
  if (!existsSync(storePath)) {
    fail('WG_RC_CONSUMER_STORE', 'Repository .pnpm-store is missing.');
  }
  const store = validateConsumerStore(storePath);
  await operations.preflight(store, runner, environment);

  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-rehearsal-'));
  try {
    const evidencePath = await operations.build(
      repository.root,
      source,
      resolve(root, 'candidate'),
      runner,
      environment,
    );
    const matrix = await operations.consumers({
      evidencePath,
      storePath: store,
      runner,
      environment,
    });
    if (matrix.vanilla.length !== 2 || matrix.react.length !== 4 || matrix.browsers.length !== 36) {
      fail('WG_RC_REHEARSAL_MATRIX', 'Integrated rehearsal did not complete the exact matrix.');
    }
    return Object.freeze({
      sourceCommit: source,
      packages: 6,
      vanillaScenarios: 2,
      reactScenarios: 4,
      browserCases: 36,
      ephemeral: true,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
