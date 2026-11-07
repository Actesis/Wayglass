import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { candidateDirectories, frozenSource } from '../src/constants.ts';
import { readEvidence, serializeEvidence, verifyEvidenceFiles } from '../src/evidence.ts';
import { sha256 } from '../src/hash.ts';
import type { CandidateEvidence } from '../src/types.ts';

let root: string | undefined;

afterEach(() => {
  if (root !== undefined) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

function fixture(): { readonly evidence: CandidateEvidence; readonly path: string } {
  root = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-evidence-'));
  const packages = resolve(root, 'packages');
  mkdirSync(packages);
  const candidates = candidateDirectories.map((directory) => {
    const file = `wayglass-${directory}-0.1.0.tgz`;
    const bytes = Buffer.from(`tarball:${directory}`);
    writeFileSync(resolve(packages, file), bytes);
    return {
      directory,
      name: `@wayglass/${directory}`,
      version: '0.1.0' as const,
      file,
      bytes: bytes.byteLength,
      sha256: sha256(bytes),
      manifestSha256: 'a'.repeat(64),
      inventorySha256: 'b'.repeat(64),
      unpackedBytes: 1,
      files: [],
    };
  });
  const evidence: CandidateEvidence = {
    schemaVersion: 1,
    source: frozenSource,
    tooling: { commit: 'c'.repeat(40), tree: 'd'.repeat(40) },
    environment: {
      platform: 'test',
      architecture: 'test',
      node: 'v22.13.0',
      pnpm: '11.9.0',
      npm: '11.0.0',
    },
    reproducibility: { runs: 2, byteIdentical: true },
    packages: candidates,
  };
  const path = resolve(root, 'evidence.json');
  writeFileSync(path, serializeEvidence(evidence));
  return { evidence, path };
}

describe('release-candidate retained evidence', () => {
  it('round-trips and rehashes the exact ordered tarball set', () => {
    const { path } = fixture();
    expect(() => verifyEvidenceFiles(path, readEvidence(path))).not.toThrow();
  });

  it('rejects artifact tampering and source identity drift', () => {
    const { evidence, path } = fixture();
    writeFileSync(resolve(root!, 'packages', evidence.packages[0]!.file), 'changed');
    expect(() => verifyEvidenceFiles(path, evidence)).toThrowError(/WG_RC_EVIDENCE_HASH/);
    expect(() =>
      verifyEvidenceFiles(path, {
        ...evidence,
        source: { ...evidence.source, commit: '0'.repeat(40) },
      }),
    ).toThrowError(/WG_RC_EVIDENCE_SCHEMA/);
  });

  it('does not let private consumers silently accept public-review evidence', () => {
    const { evidence, path } = fixture();
    expect(() =>
      verifyEvidenceFiles(path, {
        ...evidence,
        artifactKind: 'publication-review',
        publicationAuthorized: false,
        distTag: null,
      } as CandidateEvidence),
    ).toThrowError(/WG_RC_EVIDENCE_KIND/);
  });
});
