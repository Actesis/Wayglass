import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { retainedPublicationArchive } from '../src/publication-preflight.ts';
import { prepareSigningInputs } from '../src/signing-inputs.ts';
import { signingVerificationOptions, verifySigningBundle } from '../src/signing-bundle-verifier.ts';
import {
  assertSigningStatementPolicy,
  prepareUnsignedStatements,
} from '../src/signing-statement.ts';
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

it('requires verification of the exact bundle and rejects a mismatched subject', async () => {
  const expected = prepareUnsignedStatements(prepareSigningInputs(input))[0]!;
  const bytes = (statement: unknown, proof: object | null = {}) =>
    Buffer.from(
      JSON.stringify({
        dsseEnvelope: {
          payloadType: 'application/vnd.in-toto+json',
          payload: Buffer.from(JSON.stringify(statement)).toString('base64'),
          signatures: [{}],
        },
        verificationMaterial: { tlogEntries: [{ inclusionProof: proof }] },
      }),
    );
  let checked = 0;
  const simulate: Parameters<typeof verifySigningBundle>[2] = async (_bundle, options) => {
    checked++;
    expect(options.certificateIssuer).toBe(expected.certificatePolicy.issuer);
    const matcher = new RegExp(options.certificateIdentityURI);
    expect(matcher.test(expected.certificatePolicy.identity)).toBe(true);
    expect(
      matcher.test(expected.certificatePolicy.identity.replace('github.com', 'githubXcom')),
    ).toBe(false);
    const commit = Buffer.from(
      `0c28${Buffer.from(expected.certificatePolicy.commit).toString('hex')}`,
      'hex',
    );
    expect(options.certificateOIDs).toEqual({
      '1.3.6.1.4.1.57264.1.13': commit,
      '1.3.6.1.4.1.57264.1.19': commit,
      '1.3.6.1.4.1.57264.1.21': Buffer.concat([
        Buffer.from([0x0c, 62]),
        Buffer.from('https://github.com/Actesis/Wayglass/actions/runs/99/attempts/1'),
      ]),
    });
    expect(options.tlogThreshold).toBe(1);
  };
  await verifySigningBundle(expected, bytes(expected.statement), simulate);
  await expect(
    verifySigningBundle(expected, bytes({ ...expected.statement, subject: [] }), simulate),
  ).rejects.toThrow(/WG_SIGNING_VERIFIER/);
  await expect(
    verifySigningBundle(expected, bytes(expected.statement, null), simulate),
  ).rejects.toThrow(/WG_SIGNING_VERIFIER/);
  expect(checked).toBe(2);
  await expect(
    verifySigningBundle(expected, bytes(expected.statement), async () => {
      throw new Error('invalid signature');
    }),
  ).rejects.toThrow(/WG_SIGNING_VERIFIER/);
});

it('encodes long certificate claims using DER byte lengths', () => {
  const expected = prepareUnsignedStatements(prepareSigningInputs(input))[0]!;
  const invocationId = 'é'.repeat(64);
  const { certificateOIDs } = signingVerificationOptions({
    ...expected,
    certificatePolicy: { ...expected.certificatePolicy, invocationId },
  });
  expect(certificateOIDs['1.3.6.1.4.1.57264.1.21'].toString('hex')).toBe(
    `0c8180${'c3a9'.repeat(64)}`,
  );
});

it('binds each unsigned statement to the exact subject, frozen source and workflow invocation', () => {
  const inputs = prepareSigningInputs(input);
  const statements = prepareUnsignedStatements(inputs);
  expect(statements).toHaveLength(6);
  for (const [index, expected] of statements.entries()) {
    expect(expected.statement.subject).toEqual([inputs.packages[index]!.subject]);
    expect(
      expected.statement.predicate.buildDefinition.resolvedDependencies.map(
        ({ digest }) => digest.gitCommit,
      ),
    ).toEqual([inputs.build.commit, inputs.source.commit]);
    expect(expected.certificatePolicy.invocationId).toBe(
      'https://github.com/Actesis/Wayglass/actions/runs/99/attempts/1',
    );
    const verified = { statement: expected.statement, certificate: expected.certificatePolicy };
    expect(() => assertSigningStatementPolicy(expected, verified)).not.toThrow();
    for (const field of ['issuer', 'identity', 'commit', 'invocationId'] as const) {
      expect(() =>
        assertSigningStatementPolicy(expected, {
          ...verified,
          certificate: { ...verified.certificate, [field]: 'wrong' },
        }),
      ).toThrow(/WG_SIGNING_POLICY/);
    }
    expect(() =>
      assertSigningStatementPolicy(expected, {
        ...verified,
        statement: { ...verified.statement, subject: [] },
      }),
    ).toThrow(/WG_SIGNING_POLICY/);
  }
});

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
