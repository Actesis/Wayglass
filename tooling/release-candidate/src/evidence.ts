import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { candidateDirectories, frozenSource } from './constants.ts';
import type { CandidateEvidence } from './types.ts';

export function serializeEvidence(evidence: CandidateEvidence): string {
  return `${JSON.stringify(evidence, null, 2)}\n`;
}

export function readEvidence(path: string): CandidateEvidence {
  if (!isAbsolute(path) || !existsSync(path)) {
    fail('WG_RC_EVIDENCE_PATH', 'Evidence must be an existing absolute path.');
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as CandidateEvidence;
  } catch {
    return fail('WG_RC_EVIDENCE_JSON', 'Evidence must be valid JSON.');
  }
}

export function verifyEvidenceFiles(path: string, evidence: CandidateEvidence): void {
  if (
    evidence.schemaVersion !== 1 ||
    evidence.source?.commit !== frozenSource.commit ||
    evidence.source.tree !== frozenSource.tree ||
    evidence.source.lockfileSha256 !== frozenSource.lockfileSha256 ||
    !/^[a-f0-9]{40}$/.test(evidence.tooling?.commit ?? '') ||
    !/^[a-f0-9]{40}$/.test(evidence.tooling?.tree ?? '') ||
    evidence.reproducibility?.runs !== 2 ||
    evidence.reproducibility.byteIdentical !== true ||
    JSON.stringify(evidence.packages?.map(({ directory }) => directory)) !==
      JSON.stringify(candidateDirectories)
  ) {
    fail('WG_RC_EVIDENCE_SCHEMA', 'Evidence does not carry the accepted reproducibility result.');
  }
  const root = dirname(path);
  for (const candidate of evidence.packages) {
    if (
      candidate.name !== `@wayglass/${candidate.directory}` ||
      candidate.version !== '0.1.0' ||
      basenameOnly(candidate.file) !== candidate.file ||
      !/^[a-f0-9]{64}$/.test(candidate.sha256) ||
      !/^[a-f0-9]{64}$/.test(candidate.manifestSha256) ||
      !/^[a-f0-9]{64}$/.test(candidate.inventorySha256) ||
      !Number.isSafeInteger(candidate.bytes) ||
      candidate.bytes < 1
    ) {
      fail('WG_RC_EVIDENCE_FILE', `Unsafe evidence filename ${candidate.file}.`);
    }
    const tarball = resolve(root, 'packages', candidate.file);
    if (!existsSync(tarball)) {
      fail('WG_RC_EVIDENCE_HASH', `${candidate.name} tarball is missing.`);
    }
    const bytes = readFileSync(tarball);
    if (bytes.byteLength !== candidate.bytes || sha256(bytes) !== candidate.sha256) {
      fail('WG_RC_EVIDENCE_HASH', `${candidate.name} tarball hash does not match evidence.`);
    }
  }
}

function basenameOnly(path: string): string {
  return path.split(/[\\/]/).at(-1) ?? '';
}
