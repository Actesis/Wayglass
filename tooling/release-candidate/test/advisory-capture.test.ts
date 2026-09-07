import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  bulkAdvisoryEndpoint,
  createBulkAdvisoryRequest,
  normalizeBulkAdvisoryResponse,
} from '../src/advisory-bulk.ts';
import {
  captureAdvisorySnapshot,
  type AdvisoryCaptureOperations,
} from '../src/advisory-capture.ts';
import {
  frozenSource,
  candidateDirectories,
  expectedDependencies,
  expectedPeerDependencies,
} from '../src/constants.ts';
import { serializeDependencyAudit, type DependencyAuditEvidence } from '../src/dependency-audit.ts';
import { ReleaseCandidateError } from '../src/error.ts';
import { sha256 } from '../src/hash.ts';

const temporary: string[] = [];
const capturedAt = '2026-09-08T12:00:00Z';

function temp(prefix: string): string {
  const path = mkdtempSync(resolve(tmpdir(), prefix));
  temporary.push(path);
  return path;
}

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function dependencyAudit(): DependencyAuditEvidence {
  const node = (
    name: string,
    version: string,
    dependencies: readonly { readonly name: string; readonly version: string }[] = [],
  ) => ({
    name,
    version,
    packageJsonSha256: sha256(`manifest:${name}`),
    declaredLicense: 'BSD-3-Clause',
    licenseFiles: [{ path: 'LICENSE', bytes: 10, sha256: sha256(`license:${name}`) }],
    lifecycleScripts: [],
    dependencies,
    peerDependencies: {},
  });
  return {
    schemaVersion: 1,
    releaseUnits: candidateDirectories.map((directory) => ({
      name: `@wayglass/${directory}`,
      dependencies: expectedDependencies[directory] ?? {},
      peerDependencies: expectedPeerDependencies[directory] ?? {},
    })),
    productionRoots: [
      { name: '@lit/react', version: '1.0.8' },
      { name: 'lit', version: '3.3.3' },
    ],
    productionGraph: [
      node('@lit-labs/ssr-dom-shim', '1.6.0'),
      node('@lit/react', '1.0.8'),
      node('@lit/reactive-element', '2.1.2', [
        { name: '@lit-labs/ssr-dom-shim', version: '1.6.0' },
      ]),
      node('@types/trusted-types', '2.0.7'),
      node('lit-element', '4.2.2', [
        { name: '@lit-labs/ssr-dom-shim', version: '1.6.0' },
        { name: '@lit/reactive-element', version: '2.1.2' },
        { name: 'lit-html', version: '3.3.3' },
      ]),
      node('lit-html', '3.3.3', [{ name: '@types/trusted-types', version: '2.0.7' }]),
      node('lit', '3.3.3', [
        { name: '@lit/reactive-element', version: '2.1.2' },
        { name: 'lit-element', version: '4.2.2' },
        { name: 'lit-html', version: '3.3.3' },
      ]),
    ],
    allProductionNodesReachable: true,
  };
}

function successfulResponse(): Uint8Array {
  return Buffer.from(
    JSON.stringify({
      lit: [
        {
          id: 200,
          name: 'lit',
          severity: 'moderate',
          vulnerable_versions: '<3.4.0',
          patched_versions: '>=3.4.0',
          title: 'Fixture advisory',
          url: 'https://example.invalid/advisory/200',
        },
      ],
      '@lit/react': [
        {
          id: 'GHSA-abcd-1234-wxyz',
          name: '@lit/react',
          severity: 'low',
          vulnerable_versions: '<1.1.0',
          title: 'Fixture advisory without a published fix',
          url: 'https://example.invalid/advisory/GHSA-abcd-1234-wxyz',
        },
      ],
    }),
  );
}

describe('bulk advisory request and normalization', () => {
  it('creates one canonical request containing only the exact seven public dependency versions', () => {
    const request = createBulkAdvisoryRequest(dependencyAudit());
    expect(request.endpoint).toBe(bulkAdvisoryEndpoint);
    expect(request.dependencies).toHaveLength(7);
    expect(request.dependencies.map(({ name }) => name)).not.toContain(
      expect.stringMatching(/^@wayglass\//),
    );
    expect(JSON.parse(request.body)).toEqual(
      Object.fromEntries(request.dependencies.map(({ name, version }) => [name, [version]])),
    );
    expect(request.body.endsWith('\n')).toBe(true);
  });

  it('normalizes every returned advisory into sorted graph-bound findings', () => {
    const request = createBulkAdvisoryRequest(dependencyAudit());
    expect(normalizeBulkAdvisoryResponse(successfulResponse(), request)).toEqual([
      {
        package: '@lit/react',
        version: '1.0.8',
        advisoryId: 'GHSA-abcd-1234-wxyz',
        severity: 'low',
        affectedRange: '<1.1.0',
        patchedVersions: null,
      },
      {
        package: 'lit',
        version: '3.3.3',
        advisoryId: '200',
        severity: 'moderate',
        affectedRange: '<3.4.0',
        patchedVersions: '>=3.4.0',
      },
    ]);
  });

  it('rejects malformed, out-of-graph, and duplicate provider results', () => {
    const request = createBulkAdvisoryRequest(dependencyAudit());
    expect(() => normalizeBulkAdvisoryResponse(Buffer.from('{'), request)).toThrow(
      /WG_RC_ADVISORY_BULK/,
    );
    expect(() =>
      normalizeBulkAdvisoryResponse(Buffer.from(JSON.stringify({ unknown: [{ id: 1 }] })), request),
    ).toThrow(/WG_RC_ADVISORY_BULK/);
    const duplicate = JSON.parse(Buffer.from(successfulResponse()).toString('utf8')) as Record<
      string,
      unknown[]
    >;
    duplicate.lit!.push(duplicate.lit![0]);
    expect(() =>
      normalizeBulkAdvisoryResponse(Buffer.from(JSON.stringify(duplicate)), request),
    ).toThrow(/WG_RC_ADVISORY_BULK/);
  });
});

interface Harness {
  readonly root: string;
  readonly repository: string;
  readonly output: string;
  readonly counts: { builds: number; transports: number };
  readonly operations: AdvisoryCaptureOperations;
}

function harness(response = successfulResponse()): Harness {
  const root = temp('wayglass-advisory-capture-test-');
  const repository = resolve(root, 'repository');
  mkdirSync(repository);
  const output = resolve(root, 'snapshot.json');
  const counts = { builds: 0, transports: 0 };
  const operations: AdvisoryCaptureOperations = {
    repository: async () => ({ root: repository, commit: 'a'.repeat(40), tree: 'b'.repeat(40) }),
    build: async () => {
      counts.builds += 1;
      return { dependencyAudit: dependencyAudit() };
    },
    transport: async (request) => {
      counts.transports += 1;
      expect(request.endpoint).toBe(bulkAdvisoryEndpoint);
      return { statusCode: 200, contentType: 'application/json; charset=utf-8', body: response };
    },
    now: () => new Date(capturedAt),
  };
  return { root, repository, output, counts, operations };
}

async function runHarness(value: Harness, operations = value.operations) {
  return captureAdvisorySnapshot(
    value.repository,
    frozenSource.commit,
    value.output,
    async () => ({ stdout: '', stderr: '' }),
    {},
    operations,
  );
}

function expectNoOwnedOutput(value: Harness): void {
  expect(existsSync(value.output)).toBe(false);
  expect(readdirSync(value.root).some((name) => name.startsWith('.snapshot.json.partial-'))).toBe(
    false,
  );
}

describe('advisory capture effect adapter', () => {
  it('writes and independently verifies one canonical 24-hour snapshot', async () => {
    const value = harness();
    const result = await runHarness(value);
    expect(value.counts).toEqual({ builds: 1, transports: 1 });
    expect(result.capturedAt).toBe(capturedAt);
    expect(result.validThrough).toBe('2026-09-09T12:00:00Z');
    expect(result.findingCount).toBe(2);
    expect(result.responseSha256).toBe(sha256(successfulResponse()));
    expect(result.dependencyAuditSha256).toBe(sha256(serializeDependencyAudit(dependencyAudit())));
    expect(result.snapshotSha256).toBe(sha256(readFileSync(value.output)));
    expect(JSON.parse(readFileSync(value.output, 'utf8'))).toMatchObject({
      source: { sha256: result.responseSha256 },
      scope: { dependencyAuditSha256: result.dependencyAuditSha256, productionOnly: true },
      findings: expect.any(Array),
    });
  });

  it.each(['build', 'transport'] as const)(
    'fails once at the %s boundary without retrying or retaining output',
    async (stage) => {
      const value = harness();
      const injected = async (): Promise<never> => {
        throw new ReleaseCandidateError('WG_RC_INJECTED', `Injected ${stage} failure.`);
      };
      const operations: AdvisoryCaptureOperations = {
        ...value.operations,
        ...(stage === 'build' ? { build: injected } : {}),
        ...(stage === 'transport' ? { transport: injected } : {}),
      };
      await expect(runHarness(value, operations)).rejects.toThrow(/WG_RC_INJECTED/);
      expect(value.counts.builds).toBeLessThanOrEqual(1);
      expect(value.counts.transports).toBeLessThanOrEqual(1);
      expectNoOwnedOutput(value);
    },
  );

  it('fails closed on a non-success response, invalid content, and an oversized response', async () => {
    for (const response of [
      { statusCode: 503, contentType: 'application/json', body: Buffer.from('{}') },
      { statusCode: 200, contentType: 'text/html', body: Buffer.from('{}') },
      { statusCode: 200, contentType: 'application/json', body: Buffer.alloc(1024 * 1024 + 1) },
    ]) {
      const value = harness();
      const operations: AdvisoryCaptureOperations = {
        ...value.operations,
        transport: async () => {
          value.counts.transports += 1;
          return response;
        },
      };
      await expect(runHarness(value, operations)).rejects.toThrow(/WG_RC_ADVISORY_TRANSPORT/);
      expect(value.counts).toEqual({ builds: 1, transports: 1 });
      expectNoOwnedOutput(value);
    }
  });

  it('never overwrites a path created concurrently after validation', async () => {
    const value = harness();
    const operations: AdvisoryCaptureOperations = {
      ...value.operations,
      transport: async (request) => {
        value.counts.transports += 1;
        writeFileSync(value.output, 'concurrent owner');
        expect(request.endpoint).toBe(bulkAdvisoryEndpoint);
        return {
          statusCode: 200,
          contentType: 'application/json',
          body: successfulResponse(),
        };
      },
    };
    await expect(runHarness(value, operations)).rejects.toThrow(/WG_RC_ADVISORY_CAPTURE/);
    expect(readFileSync(value.output, 'utf8')).toBe('concurrent owner');
    expect(value.counts).toEqual({ builds: 1, transports: 1 });
  });

  it('rejects release credentials before building or querying', async () => {
    const value = harness();
    await expect(
      captureAdvisorySnapshot(
        value.repository,
        frozenSource.commit,
        value.output,
        async () => ({ stdout: '', stderr: '' }),
        { NPM_TOKEN: 'not-authorized' },
        value.operations,
      ),
    ).rejects.toThrow(/WG_RC_CREDENTIAL_EXPOSURE/);
    expect(value.counts).toEqual({ builds: 0, transports: 0 });
    expectNoOwnedOutput(value);
  });
});
