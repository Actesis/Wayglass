import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { retainedPublicationArchive } from '../src/publication-preflight.ts';
import { createInitialStagingProtocol } from '../src/staging-protocol.ts';
import type { StageUploadIntent } from '../src/staging-protocol.ts';
import { repositoryRoot } from './fixtures.ts';

const archives = candidateDirectories.map((directory) => {
  const file = `wayglass-${directory}-0.1.0.tgz`;
  return {
    file,
    bytes: execFileSync('unzip', [
      '-p',
      resolve(repositoryRoot, retainedPublicationArchive.path),
      `assembly/packages/${file}`,
    ]),
  };
});

function receipt(intent: StageUploadIntent, index = 0, changes: Record<string, unknown> = {}) {
  const { package: pkg } = intent;
  return JSON.stringify({
    [pkg.name]: {
      id: `${pkg.name}@${pkg.version}`,
      name: pkg.name,
      version: pkg.version,
      filename: pkg.file,
      size: pkg.size,
      shasum: pkg.shasum,
      integrity: pkg.integrity,
      stageId: `12345678-1234-1234-1234-${String(index).padStart(12, '0')}`,
      ...changes,
    },
  });
}

describe('transport-free initial stage protocol', () => {
  it('admits exactly the retained six archives and fixes every argument without invoking npm', () => {
    const review = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, 'docs/governance/initial-npm-release-proposal.json'),
        'utf8',
      ),
    );
    const protocol = createInitialStagingProtocol(archives);
    const ids: string[] = [];
    for (let index = 0; index < 6; index++) {
      const intent = protocol.beginNext()!;
      expect(intent.package).toMatchObject({
        name: review.packages[index].name,
        version: '0.1.0',
        size: review.packages[index].bytes,
        sha256: review.packages[index].sha256,
      });
      expect(intent.npmVersion).toBe('11.21.2');
      expect(intent.arguments).toEqual([
        'stage',
        'publish',
        `./packages/${intent.package.file}`,
        '--registry=https://registry.npmjs.org/',
        '--access=public',
        '--tag=next',
        '--ignore-scripts',
        '--workspaces=false',
        '--provenance',
        '--json',
        '--fetch-retries=0',
        '--audit=false',
        '--fund=false',
        '--update-notifier=false',
      ]);
      expect(Object.isFrozen(intent.arguments)).toBe(true);
      expect(protocol.snapshot().pendingPackage).toBe(intent.package.name);
      protocol.completeUpload(receipt(intent, index));
      ids.push(protocol.snapshot().confirmed[index]!.stageId);
    }
    expect(new Set(ids).size).toBe(6);
    expect(protocol.beginNext()).toBeNull();
    expect(protocol.snapshot()).toMatchObject({
      status: 'uploads-reported-human-review-required',
      readyToPromote: false,
      registryActionsAuthorized: false,
      publicationAuthorized: false,
      provenanceVerified: false,
      placeholderState: 'unobserved',
      automaticRetryAllowed: false,
    });
    expect(
      protocol
        .snapshot()
        .confirmed.every((stage) => stage.provenanceVerification === 'pending-independent-review'),
    ).toBe(true);
  });
  it('checks the entire set before issuing even the first upload intent', () => {
    const last = archives[5]!;
    for (const invalid of [
      archives.slice(0, 5),
      [...archives, archives[0]!],
      [...archives].reverse(),
      [...archives.slice(0, 5), { ...last, file: '../escape.tgz' }],
      [...archives.slice(0, 5), { ...last, bytes: Buffer.from('wrong') }],
      [...archives.slice(0, 5), { ...last, bytes: Buffer.alloc(last.bytes.length) }],
    ])
      expect(() => createInitialStagingProtocol(invalid)).toThrow(/WG_STAGE_ARCHIVES/);
  });
  it('does not alias mutable caller bytes or expose a credential/transport/approval method', () => {
    const input = archives.map(({ file, bytes }) => ({ file, bytes: Buffer.from(bytes) }));
    const protocol = createInitialStagingProtocol(input);
    input[0]!.bytes.fill(0);
    expect(protocol.beginNext()!.package.sha256).toBe(
      'a04bc68be7e7503eaa0be77845dd933762b4b522d1bb2c9f97d6fdc13ad709c3',
    );
    expect(Object.keys(protocol).sort()).toEqual([
      'beginNext',
      'completeUpload',
      'failUpload',
      'snapshot',
    ]);
    expect(Object.isFrozen(protocol.snapshot().confirmed)).toBe(true);
  });
  it('cannot issue a second upload while a response is unresolved', () => {
    const protocol = createInitialStagingProtocol(archives);
    protocol.beginNext();
    expect(() => protocol.beginNext()).toThrow(/WG_STAGE_SEQUENCE/);
    expect(protocol.snapshot().confirmed).toHaveLength(0);
    expect(protocol.snapshot().status).toBe('upload-unresolved');
  });
  it('retains confirmed IDs but marks the failed operation uncertain and refuses all retries', () => {
    const protocol = createInitialStagingProtocol(archives);
    protocol.completeUpload(receipt(protocol.beginNext()!));
    protocol.beginNext();
    protocol.failUpload();
    expect(protocol.snapshot()).toMatchObject({
      status: 'stopped',
      uncertainPackage: '@wayglass/tokens',
      pendingPackage: null,
      tokenRevocationRequiredAfterExecution: true,
      readyToPromote: false,
    });
    expect(protocol.snapshot().confirmed).toHaveLength(1);
    expect(() => protocol.beginNext()).toThrow(/WG_STAGE_SEQUENCE/);
    expect(() => protocol.completeUpload('{}')).toThrow(/WG_STAGE_SEQUENCE/);
    expect(() => protocol.failUpload()).toThrow(/WG_STAGE_SEQUENCE/);
  });
  it('fails closed for malformed, wrong-identity, direct-publish, or missing stage receipts', () => {
    for (const change of [
      { id: '@wayglass/core@0.2.0' },
      { name: '@wayglass/other' },
      { version: '0.0.0-stage' },
      { filename: '../escape.tgz' },
      { size: 0 },
      { shasum: '0'.repeat(40) },
      { integrity: 'sha512-wrong' },
      { stageId: null },
      { stageId: 'not-a-uuid' },
    ]) {
      const protocol = createInitialStagingProtocol(archives);
      expect(() => protocol.completeUpload(receipt(protocol.beginNext()!, 0, change))).toThrow(
        /WG_STAGE_RECEIPT/,
      );
      expect(protocol.snapshot()).toMatchObject({
        status: 'stopped',
        uncertainPackage: '@wayglass/core',
      });
    }
    for (const invalid of [
      'not-json',
      '[]',
      'null',
      '{}',
      '{"error":"npm_secret"}',
      'x'.repeat(2 * 1024 * 1024 + 1),
    ]) {
      const protocol = createInitialStagingProtocol(archives);
      protocol.beginNext();
      expect(() => protocol.completeUpload(invalid)).toThrow(/WG_STAGE_RECEIPT/);
      expect(() => protocol.beginNext()).toThrow(/WG_STAGE_SEQUENCE/);
      expect(JSON.stringify(protocol.snapshot())).not.toContain('npm_secret');
    }
  });
  it('rejects a multi-package receipt and stage ID reuse without losing earlier evidence', () => {
    const first = createInitialStagingProtocol(archives);
    const intent = first.beginNext()!;
    const valid = JSON.parse(receipt(intent));
    expect(() =>
      first.completeUpload(JSON.stringify({ ...valid, unexpected: valid[intent.package.name] })),
    ).toThrow(/WG_STAGE_RECEIPT/);
    const protocol = createInitialStagingProtocol(archives);
    protocol.completeUpload(receipt(protocol.beginNext()!));
    expect(() => protocol.completeUpload(receipt(protocol.beginNext()!))).toThrow(
      /WG_STAGE_RECEIPT/,
    );
    expect(protocol.snapshot().confirmed).toHaveLength(1);
    expect(protocol.snapshot().uncertainPackage).toBe('@wayglass/tokens');
  });
});
