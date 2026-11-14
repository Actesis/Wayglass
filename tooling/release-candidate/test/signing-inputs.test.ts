import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { retainedPublicationArchive } from '../src/publication-preflight.ts';
import { prepareSigningInputs } from '../src/signing-inputs.ts';
import type { PublicationEvidence } from '../src/types.ts';
import { repositoryRoot } from './fixtures.ts';

const zip = resolve(repositoryRoot, retainedPublicationArchive.path);
const extract = (path: string) => execFileSync('unzip', ['-p', zip, path]);
const evidence = JSON.parse(
  extract('assembly/publication-evidence.json').toString(),
) as PublicationEvidence;
const archives = candidateDirectories.map((directory) => {
  const file = `wayglass-${directory}-0.1.0.tgz`;
  return { file, bytes: extract(`assembly/packages/${file}`) };
});
const environment = {
  GITHUB_ACTIONS: 'true',
  RUNNER_ENVIRONMENT: 'github-hosted',
  GITHUB_REPOSITORY: 'Actesis/Wayglass',
  GITHUB_SERVER_URL: 'https://github.com',
  GITHUB_EVENT_NAME: 'workflow_dispatch',
  GITHUB_REF: 'refs/heads/main',
  GITHUB_WORKFLOW_REF:
    'Actesis/Wayglass/.github/workflows/initial-release-signing.yml@refs/heads/main',
  GITHUB_SHA: evidence.tooling.commit,
  GITHUB_WORKFLOW_SHA: evidence.tooling.commit,
  GITHUB_RUN_ID: '99',
  GITHUB_RUN_ATTEMPT: '1',
};
const input = { archives, evidence, environment, buildRun: { id: '99', attempt: '1' } };

describe('unsigned signing input preparation (fictional run context)', () => {
  it('binds six exact bytes to single-subject identities without granting signing authority', () => {
    const manifest = prepareSigningInputs(input);
    expect(manifest.signingAuthorized).toBe(false);
    expect(manifest.publicationAuthorized).toBe(false);
    expect(manifest.source).toEqual(evidence.source);
    expect(manifest.build).toMatchObject({
      commit: evidence.tooling.commit,
      runId: '99',
      runAttempt: '1',
    });
    expect(manifest.packages.map(({ subject }) => subject)).toEqual(
      archives.map(({ bytes }, index) => ({
        name: `pkg:npm/%40wayglass/${candidateDirectories[index]}@0.1.0`,
        digest: { sha512: createHash('sha512').update(bytes).digest('hex') },
      })),
    );
  });

  it('rejects another run, attempt, commit, workflow, or npm credentials', () => {
    for (const change of [
      { GITHUB_RUN_ID: '100' },
      { GITHUB_RUN_ATTEMPT: '2' },
      { GITHUB_SHA: 'a'.repeat(40) },
      { GITHUB_WORKFLOW_REF: 'other' },
      { NODE_AUTH_TOKEN: 'fictional' },
    ])
      expect(() =>
        prepareSigningInputs({ ...input, environment: { ...environment, ...change } }),
      ).toThrow();
  });

  it('rejects changed bytes, a missing archive, or a metadata substitution', () => {
    expect(() => prepareSigningInputs({ ...input, archives: archives.slice(1) })).toThrow(
      /WG_SIGNING_INPUTS/,
    );
    expect(() =>
      prepareSigningInputs({
        ...input,
        archives: [
          { ...archives[0]!, bytes: Buffer.alloc(archives[0]!.bytes.length) },
          ...archives.slice(1),
        ],
      }),
    ).toThrow(/WG_STAGE_ARCHIVES/);
    expect(() =>
      prepareSigningInputs({
        ...input,
        evidence: {
          ...evidence,
          packages: [
            { ...evidence.packages[0]!, sha256: '0'.repeat(64) },
            ...evidence.packages.slice(1),
          ],
        },
      }),
    ).toThrow(/WG_SIGNING_INPUTS/);
  });
});
