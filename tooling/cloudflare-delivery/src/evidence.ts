import {
  closeSync,
  existsSync,
  linkSync,
  openSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import { fail } from './error.ts';

export function resolveEvidenceOutputPath(candidate: string): string {
  if (!isAbsolute(candidate) || existsSync(candidate)) {
    fail('WG_CLOUDFLARE_EVIDENCE_OUTPUT', 'Evidence output must be a new absolute path.');
  }
  const parent = dirname(resolve(candidate));
  let realParent: string;
  try {
    realParent = realpathSync(parent);
  } catch {
    fail('WG_CLOUDFLARE_EVIDENCE_OUTPUT', 'Evidence output parent must already exist.');
  }
  const temporaryRoot = realpathSync(tmpdir());
  const fromTemporaryRoot = relative(temporaryRoot, realParent);
  if (fromTemporaryRoot.startsWith('..') || isAbsolute(fromTemporaryRoot)) {
    fail(
      'WG_CLOUDFLARE_EVIDENCE_OUTPUT',
      'Evidence output must remain inside the OS temporary root.',
    );
  }
  return resolve(realParent, basename(candidate));
}

export function writeSanitizedEvidence(path: string, evidence: unknown): void {
  const staging = `${path}.${randomUUID()}.tmp`;
  let descriptor: number | undefined;
  try {
    descriptor = openSync(staging, 'wx', 0o600);
    writeFileSync(descriptor, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
    closeSync(descriptor);
    descriptor = undefined;
    linkSync(staging, path);
    rmSync(staging);
  } catch {
    if (descriptor !== undefined) closeSync(descriptor);
    rmSync(staging, { force: true });
    fail('WG_CLOUDFLARE_EVIDENCE_OUTPUT', 'Could not write sanitized evidence transactionally.');
  }
}
