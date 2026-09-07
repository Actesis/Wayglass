import {
  existsSync,
  linkSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { request as httpsRequest } from 'node:https';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';

import { buildCandidateWithAudit } from './assembler.ts';
import {
  bulkAdvisoryEndpoint,
  createBulkAdvisoryRequest,
  normalizeBulkAdvisoryResponse,
  type BulkAdvisoryRequest,
} from './advisory-bulk.ts';
import { serializeAdvisorySnapshot, type AdvisorySnapshotEvidence } from './advisory-snapshot.ts';
import { frozenSource } from './constants.ts';
import { serializeDependencyAudit, type DependencyAuditEvidence } from './dependency-audit.ts';
import { offlineEnvironment } from './environment.ts';
import { fail, ReleaseCandidateError } from './error.ts';
import { sha256 } from './hash.ts';
import { validateNewOutputPath } from './path-safety.ts';
import { identifyRepository, type RepositoryIdentity } from './repository.ts';
import type { CommandRunner } from './types.ts';

export interface BulkAdvisoryTransportResult {
  readonly statusCode: number;
  readonly contentType: string | undefined;
  readonly body: Uint8Array;
}

export type BulkAdvisoryTransport = (
  request: BulkAdvisoryRequest,
) => Promise<BulkAdvisoryTransportResult>;

export interface AdvisoryCaptureResult {
  readonly snapshotPath: string;
  readonly snapshotSha256: string;
  readonly responseSha256: string;
  readonly dependencyAuditSha256: string;
  readonly capturedAt: string;
  readonly validThrough: string;
  readonly findingCount: number;
}

interface AdvisoryAuditBuildResult {
  readonly dependencyAudit: DependencyAuditEvidence;
}

export interface AdvisoryCaptureOperations {
  readonly repository: typeof identifyRepository;
  readonly build: (
    cwd: string,
    source: string,
    output: string,
    runner: CommandRunner,
    environment: Readonly<Record<string, string>>,
  ) => Promise<AdvisoryAuditBuildResult>;
  readonly transport: BulkAdvisoryTransport;
  readonly now: () => Date;
}

const maximumResponseBytes = 1024 * 1024;
const validityMilliseconds = 24 * 60 * 60 * 1000;

function captureFailure(code: string, message: string): never {
  return fail(code, message);
}

function canonicalInstant(date: Date): string {
  if (!Number.isFinite(date.getTime()))
    captureFailure('WG_RC_CLOCK', 'Clock returned invalid time.');
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export async function queryBulkAdvisories(
  request: BulkAdvisoryRequest,
): Promise<BulkAdvisoryTransportResult> {
  if (request.endpoint !== bulkAdvisoryEndpoint) {
    captureFailure(
      'WG_RC_ADVISORY_TRANSPORT',
      'Bulk advisory endpoint differs from the accepted endpoint.',
    );
  }
  return new Promise((resolvePromise, rejectPromise) => {
    const operation = httpsRequest(
      request.endpoint,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-length': String(Buffer.byteLength(request.body)),
          'content-type': 'application/json',
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        let bytes = 0;
        const responseFailure = () => {
          rejectPromise(
            new ReleaseCandidateError(
              'WG_RC_ADVISORY_TRANSPORT',
              'Bulk advisory response ended before completion.',
            ),
          );
        };
        response.on('aborted', responseFailure);
        response.on('error', responseFailure);
        response.on('data', (chunk: Buffer) => {
          bytes += chunk.byteLength;
          if (bytes > maximumResponseBytes) {
            operation.destroy();
            rejectPromise(
              new ReleaseCandidateError(
                'WG_RC_ADVISORY_TRANSPORT',
                'Bulk advisory response exceeded the accepted byte limit.',
              ),
            );
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          const header = response.headers['content-type'];
          resolvePromise({
            statusCode: response.statusCode ?? 0,
            contentType: Array.isArray(header) ? header[0] : header,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    operation.setTimeout(30_000, () => {
      operation.destroy();
      rejectPromise(
        new ReleaseCandidateError('WG_RC_ADVISORY_TRANSPORT', 'Bulk advisory request timed out.'),
      );
    });
    operation.on('error', () => {
      rejectPromise(
        new ReleaseCandidateError('WG_RC_ADVISORY_TRANSPORT', 'Bulk advisory request failed.'),
      );
    });
    operation.end(request.body);
  });
}

const defaultOperations: AdvisoryCaptureOperations = Object.freeze({
  repository: identifyRepository,
  build: buildCandidateWithAudit,
  transport: queryBulkAdvisories,
  now: () => new Date(),
});

function verifyWrittenSnapshot(
  path: string,
  expected: string,
  dependencyAuditSha256: string,
  productionDependencies: BulkAdvisoryRequest['dependencies'],
  referenceTime: string,
): void {
  if (!existsSync(path) || !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()) {
    captureFailure('WG_RC_ADVISORY_OUTPUT', 'Advisory snapshot output must be a regular file.');
  }
  const observed = readFileSync(path, 'utf8');
  if (observed !== expected) {
    captureFailure(
      'WG_RC_ADVISORY_OUTPUT',
      'Advisory snapshot output bytes changed during retention.',
    );
  }
  let value: unknown;
  try {
    value = JSON.parse(observed) as unknown;
  } catch {
    return captureFailure('WG_RC_ADVISORY_OUTPUT', 'Advisory snapshot output is not valid JSON.');
  }
  if (
    serializeAdvisorySnapshot(value, {
      referenceTime,
      dependencyAuditSha256,
      productionDependencies,
    }) !== observed
  ) {
    captureFailure('WG_RC_ADVISORY_OUTPUT', 'Advisory snapshot output is not canonical.');
  }
}

export async function captureAdvisorySnapshot(
  cwd: string,
  source: string,
  outputArgument: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
  operations: AdvisoryCaptureOperations = defaultOperations,
): Promise<AdvisoryCaptureResult> {
  if (source !== frozenSource.commit) {
    captureFailure(
      'WG_RC_SOURCE_COMMIT',
      `Advisory capture requires frozen source ${frozenSource.commit}.`,
    );
  }
  const environment = offlineEnvironment(inputEnvironment);
  const repository: RepositoryIdentity = await operations.repository(cwd, runner);
  const output = validateNewOutputPath(outputArgument, repository.root);
  const work = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-advisory-capture-'));
  let staging: string | undefined;
  let outputCreated = false;
  let completed = false;
  try {
    const build = await operations.build(
      repository.root,
      source,
      resolve(work, 'candidate'),
      runner,
      environment,
    );
    const dependencyContents = serializeDependencyAudit(build.dependencyAudit);
    const dependencyAuditSha256 = sha256(dependencyContents);
    const request = createBulkAdvisoryRequest(build.dependencyAudit);
    const response = await operations.transport(request);
    if (response.statusCode !== 200) {
      captureFailure(
        'WG_RC_ADVISORY_TRANSPORT',
        'Bulk advisory endpoint did not return an accepted success response.',
      );
    }
    if (!response.contentType?.toLowerCase().startsWith('application/json')) {
      captureFailure(
        'WG_RC_ADVISORY_TRANSPORT',
        'Bulk advisory endpoint did not return JSON content.',
      );
    }
    if (response.body.byteLength === 0 || response.body.byteLength > maximumResponseBytes) {
      captureFailure('WG_RC_ADVISORY_TRANSPORT', 'Bulk advisory response size is invalid.');
    }
    const responseSha256 = sha256(response.body);
    const findings = normalizeBulkAdvisoryResponse(response.body, request);
    const captured = operations.now();
    const capturedAt = canonicalInstant(captured);
    const validThrough = canonicalInstant(new Date(captured.getTime() + validityMilliseconds));
    const snapshot: AdvisorySnapshotEvidence = {
      schemaVersion: 1,
      source: {
        provider: 'npm-security-advisories',
        captureMethod: 'approved-read-only-snapshot',
        capturedAt,
        validThrough,
        sha256: responseSha256,
      },
      scope: {
        lockfileSha256: frozenSource.lockfileSha256,
        dependencyAuditSha256,
        productionOnly: true,
      },
      findings,
      notices: [],
    };
    const contents = serializeAdvisorySnapshot(snapshot, {
      referenceTime: capturedAt,
      dependencyAuditSha256,
      productionDependencies: request.dependencies,
    });
    staging = mkdtempSync(resolve(dirname(output), `.${basename(output)}.partial-`));
    const stagedFile = resolve(staging, 'snapshot.json');
    writeFileSync(stagedFile, contents, { encoding: 'utf8', flag: 'wx' });
    linkSync(stagedFile, output);
    outputCreated = true;
    unlinkSync(stagedFile);
    verifyWrittenSnapshot(
      output,
      contents,
      dependencyAuditSha256,
      request.dependencies,
      capturedAt,
    );
    completed = true;
    return Object.freeze({
      snapshotPath: output,
      snapshotSha256: sha256(contents),
      responseSha256,
      dependencyAuditSha256,
      capturedAt,
      validThrough,
      findingCount: findings.length,
    });
  } catch (error) {
    if (error instanceof ReleaseCandidateError) throw error;
    throw new ReleaseCandidateError('WG_RC_ADVISORY_CAPTURE', 'Advisory capture failed.');
  } finally {
    rmSync(work, { recursive: true, force: true });
    if (staging !== undefined) rmSync(staging, { recursive: true, force: true });
    if (outputCreated && !completed) rmSync(output, { force: true });
  }
}
