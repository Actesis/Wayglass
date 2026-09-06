import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { BrowserConsumerMatrixResult } from '../src/browser-probe.ts';
import { frozenSource } from '../src/constants.ts';
import { runIntegratedRehearsal, type RehearsalOperations } from '../src/rehearsal.ts';
import type { ReactBuildProbeResult, VanillaBuildProbeResult } from '../src/types.ts';
import { repositoryRoot } from './fixtures.ts';

function commandRunner(request: { readonly arguments: readonly string[] }) {
  const target = request.arguments.at(-1);
  if (target === '--show-toplevel')
    return Promise.resolve({ stdout: `${repositoryRoot}\n`, stderr: '' });
  if (target === 'HEAD') return Promise.resolve({ stdout: `${'a'.repeat(40)}\n`, stderr: '' });
  if (target === 'HEAD^{tree}')
    return Promise.resolve({ stdout: `${'b'.repeat(40)}\n`, stderr: '' });
  throw new Error(`Unexpected command ${request.arguments.join(' ')}`);
}

function matrix(browserCases = 36): BrowserConsumerMatrixResult {
  return {
    vanilla: Array.from({ length: 2 }, () => ({}) as VanillaBuildProbeResult),
    react: Array.from({ length: 4 }, () => ({}) as ReactBuildProbeResult),
    browsers: Array.from({ length: browserCases }, () => ({}) as never),
  };
}

describe('integrated release-candidate rehearsal', () => {
  it('preflights, builds, consumes the exact matrix, and deletes all candidate evidence', async () => {
    let rehearsalRoot: string | undefined;
    let preflighted = false;
    const operations: RehearsalOperations = {
      preflight: async (store) => {
        expect(store).toBe(resolve(repositoryRoot, '.pnpm-store'));
        preflighted = true;
      },
      build: async (_cwd, source, output) => {
        expect(preflighted).toBe(true);
        expect(source).toBe(frozenSource.commit);
        rehearsalRoot = resolve(output, '..');
        mkdirSync(resolve(output, 'packages'), { recursive: true });
        const evidence = resolve(output, 'evidence.json');
        writeFileSync(evidence, '{}');
        return evidence;
      },
      consumers: async ({ evidencePath, storePath }) => {
        expect(evidencePath).toBe(resolve(rehearsalRoot!, 'candidate/evidence.json'));
        expect(storePath).toBe(resolve(repositoryRoot, '.pnpm-store'));
        return matrix();
      },
    };
    await expect(
      runIntegratedRehearsal(repositoryRoot, frozenSource.commit, commandRunner, {}, operations),
    ).resolves.toEqual({
      sourceCommit: frozenSource.commit,
      packages: 6,
      vanillaScenarios: 2,
      reactScenarios: 4,
      browserCases: 36,
      ephemeral: true,
    });
    expect(rehearsalRoot).toBeDefined();
    expect(existsSync(rehearsalRoot!)).toBe(false);
  });

  it('rejects an incomplete matrix and removes the disposable candidate', async () => {
    let rehearsalRoot: string | undefined;
    const operations: RehearsalOperations = {
      preflight: async () => undefined,
      build: async (_cwd, _source, output) => {
        rehearsalRoot = resolve(output, '..');
        mkdirSync(output, { recursive: true });
        return resolve(output, 'evidence.json');
      },
      consumers: async () => matrix(35),
    };
    await expect(
      runIntegratedRehearsal(repositoryRoot, frozenSource.commit, commandRunner, {}, operations),
    ).rejects.toThrow(/WG_RC_REHEARSAL_MATRIX/);
    expect(existsSync(rehearsalRoot!)).toBe(false);
  });

  it('rejects any source other than the accepted freeze before running operations', async () => {
    const operations: RehearsalOperations = {
      preflight: async () => {
        throw new Error('should not run');
      },
      build: async () => {
        throw new Error('should not run');
      },
      consumers: async () => matrix(),
    };
    await expect(
      runIntegratedRehearsal(repositoryRoot, '0'.repeat(40), commandRunner, {}, operations),
    ).rejects.toThrow(/WG_RC_SOURCE_COMMIT/);
  });
});
