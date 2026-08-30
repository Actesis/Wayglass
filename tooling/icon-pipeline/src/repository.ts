import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { iconCatalog } from './catalog.ts';
import { detectGeneratedArtifactDrift, type ArtifactDrift } from './drift.ts';
import { generateIconArtifacts, type GeneratedIconArtifacts } from './generation.ts';
import { verifyGeneratedArtifactIntegrity } from './integrity.ts';
import {
  readCommittedIconArtifacts,
  recoverStaleIconWriterLock,
  writeIconArtifacts,
  type IconRecoveryResult,
  type IconWriterResult,
} from './writer.ts';

export const iconRepositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));

async function readIconPackageVersion(repositoryRoot: string): Promise<string> {
  const path = join(repositoryRoot, 'packages/icons/package.json');
  const value: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (
    typeof value !== 'object' ||
    value === null ||
    !('version' in value) ||
    typeof value.version !== 'string'
  ) {
    throw new Error('WG_ICON_REPOSITORY_VERSION: @wayglass/icons has no valid package version.');
  }
  return value.version;
}

export async function createRepositoryIconArtifacts(
  repositoryRoot = iconRepositoryRoot,
): Promise<GeneratedIconArtifacts> {
  const artifacts = generateIconArtifacts(iconCatalog, {
    iconPackageVersion: await readIconPackageVersion(repositoryRoot),
  });
  verifyGeneratedArtifactIntegrity(artifacts);
  return artifacts;
}

export interface IconCheckResult {
  readonly artifacts: number;
  readonly icons: number;
}

export class IconDriftError extends Error {
  readonly drift: readonly ArtifactDrift[];

  constructor(drift: readonly ArtifactDrift[]) {
    super(
      `WG_ICON_CHECK_DRIFT: ${drift.map(({ artifact, kind }) => `${kind} ${artifact}`).join('; ')}`,
    );
    this.drift = drift;
    this.name = 'IconDriftError';
  }
}

export async function checkRepositoryIconArtifacts(
  repositoryRoot = iconRepositoryRoot,
): Promise<IconCheckResult> {
  const expected = await createRepositoryIconArtifacts(repositoryRoot);
  const actual = await readCommittedIconArtifacts(repositoryRoot);
  const drift = detectGeneratedArtifactDrift(actual, expected);
  if (drift.length > 0) throw new IconDriftError(drift);
  verifyGeneratedArtifactIntegrity(expected);
  return Object.freeze({ artifacts: Object.keys(expected).length, icons: iconCatalog.length });
}

export async function generateRepositoryIconArtifacts(
  repositoryRoot = iconRepositoryRoot,
): Promise<IconWriterResult> {
  return writeIconArtifacts(repositoryRoot, await createRepositoryIconArtifacts(repositoryRoot));
}

export async function recoverRepositoryIconWriter(
  repositoryRoot = iconRepositoryRoot,
): Promise<IconRecoveryResult> {
  return recoverStaleIconWriterLock(repositoryRoot);
}
