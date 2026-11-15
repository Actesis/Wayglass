import { execFileSync } from 'node:child_process';
import { createHash, generateKeyPairSync, verify, X509Certificate } from 'node:crypto';
import { resolve } from 'node:path';
import { getCACertificates } from 'node:tls';

import { describe, expect, it, vi } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { prepareCertificateGatedEnvelopes } from '../src/certificate-gated-dsse.ts';
import { retainedPublicationArchive } from '../src/publication-preflight.ts';
import { prepareSigningInputs } from '../src/signing-inputs.ts';
import { signAndVerifyReleaseBatch } from '../src/signing-batch.ts';
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

function batchFixture() {
  const leaf = new X509Certificate(getCACertificates('bundled')[0]!).raw;
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const transport = vi.fn<typeof fetch>().mockImplementation(async (_url, options) => {
    const proposal = JSON.parse(String(options?.body));
    const { verifiers } = proposal.spec.proposedContent;
    const body = Buffer.from(
      JSON.stringify({
        kind: 'dsse',
        apiVersion: '0.0.1',
        spec: { signatures: [{ verifier: verifiers[0] }] },
      }),
    ).toString('base64');
    return Response.json(
      {
        ['a'.repeat(80)]: {
          body,
          logID: 'ab'.repeat(32),
          logIndex: 500,
          integratedTime: 1770000000,
          verification: {
            signedEntryTimestamp: 'AQ==',
            inclusionProof: {
              logIndex: 0,
              treeSize: 1,
              rootHash: 'ab'.repeat(32),
              hashes: [],
              checkpoint: 'synthetic',
            },
          },
        },
      },
      { status: 201 },
    );
  });
  const verifyCertificate = vi.fn();
  const verifyBundle = vi
    .fn<Parameters<typeof signAndVerifyReleaseBatch>[0]['verifyBundle']>()
    .mockResolvedValue();
  const report = vi.fn();
  return { input, leaf, privateKey, transport, verifyCertificate, verifyBundle, report };
}

it('returns the ordered six-bundle set only after each receipt is verified', async () => {
  const fixture = batchFixture();
  const bundles = await signAndVerifyReleaseBatch(fixture);
  expect(bundles.map(({ file }) => file)).toEqual(archives.map(({ file }) => file));
  expect(fixture.transport).toHaveBeenCalledTimes(6);
  expect(fixture.verifyCertificate).toHaveBeenCalledTimes(1);
  for (const { bundle, sha256 } of bundles)
    expect(sha256).toBe(createHash('sha256').update(bundle).digest('hex'));
  expect(fixture.report).toHaveBeenCalledTimes(12);
});

it('does not submit after certificate rejection or after the first unverified receipt', async () => {
  const fixture = batchFixture();
  fixture.verifyCertificate.mockImplementationOnce(() => {
    throw new Error('certificate rejected');
  });
  await expect(signAndVerifyReleaseBatch(fixture)).rejects.toThrow('certificate rejected');
  expect(fixture.transport).not.toHaveBeenCalled();
  fixture.verifyBundle.mockResolvedValueOnce().mockRejectedValueOnce(new Error('proof rejected'));
  await expect(signAndVerifyReleaseBatch(fixture)).rejects.toThrow(/WG_REKOR_SUBMISSION/);
  expect(fixture.transport).toHaveBeenCalledTimes(2);
  expect(fixture.report.mock.calls.map(([progress]) => progress.status)).toEqual([
    'attempting',
    'verified',
    'attempting',
    'unverified-stop',
  ]);
});

it('creates six local DSSE envelopes only after the certificate gate accepts the matching key', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const leaf = Buffer.from('synthetic leaf');
  const expected = prepareUnsignedStatements(prepareSigningInputs(input));
  await expect(
    prepareCertificateGatedEnvelopes(input, leaf, privateKey, async () => {
      throw new Error('certificate rejected');
    }),
  ).rejects.toThrow('certificate rejected');
  let verified = 0;
  const envelopes = await prepareCertificateGatedEnvelopes(
    input,
    leaf,
    privateKey,
    (policy, der, key) => {
      expect(policy).toEqual(expected[0]!.certificatePolicy);
      expect(der).toEqual(leaf);
      expect(key.equals(publicKey)).toBe(true);
      verified++;
    },
  );
  expect(verified).toBe(1);
  expect(envelopes).toHaveLength(6);
  for (const [index, { file, envelope }] of envelopes.entries()) {
    expect(file).toBe(expected[index]!.file);
    expect(envelope.payloadType).toBe('application/vnd.in-toto+json');
    const payload = Buffer.from(envelope.payload, 'base64');
    expect(JSON.parse(payload.toString())).toEqual(expected[index]!.statement);
    const pae = Buffer.concat([
      Buffer.from(`DSSEv1 28 application/vnd.in-toto+json ${payload.length} `),
      payload,
    ]);
    expect(
      verify('sha256', pae, publicKey, Buffer.from(envelope.signatures[0]!.sig, 'base64')),
    ).toBe(true);
  }
});

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
    expect(options).toHaveProperty('ctLogThreshold', 1);
    expect(options).not.toHaveProperty('ctlogThreshold');
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
