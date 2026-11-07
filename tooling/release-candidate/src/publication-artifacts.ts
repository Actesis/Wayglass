import { dirname, resolve } from 'node:path';

import { frozenSource } from './constants.ts';
import { offlineEnvironment } from './environment.ts';
import { fail } from './error.ts';
import { readEvidence, verifyEvidenceFiles } from './evidence.ts';
import { sha256 } from './hash.ts';
import { serializeProjectedManifest } from './manifest.ts';
import { projectPublicationManifest } from './publication-plan.ts';
import { authenticateFrozenSource, identifyRepository } from './repository.ts';
import type { CommandRunner, PublicationEvidence } from './types.ts';

// This verifies retained bytes and exact frozen public manifest projections. It does not approve
// publication, authenticate a hosted run, or replace independent installed-consumer validation.
export async function verifyPublicationArtifacts(
  cwd: string,
  path: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
): Promise<PublicationEvidence> {
  const environment = offlineEnvironment(inputEnvironment);
  const evidence = readEvidence(path) as PublicationEvidence;
  if (
    evidence.artifactKind !== 'publication-review' ||
    evidence.publicationAuthorized !== false ||
    evidence.distTag !== null
  ) {
    fail('WG_RC_EVIDENCE_KIND', 'Expected explicitly unauthorized public-review evidence.');
  }
  verifyEvidenceFiles(path, {
    schemaVersion: evidence.schemaVersion,
    source: evidence.source,
    tooling: evidence.tooling,
    environment: evidence.environment,
    reproducibility: evidence.reproducibility,
    packages: evidence.packages,
  });
  const repository = await identifyRepository(cwd, runner);
  await authenticateFrozenSource(repository.root, frozenSource.commit, runner);
  for (const candidate of evidence.packages) {
    const source = await runner({
      command: 'git',
      arguments: ['show', `${frozenSource.commit}:packages/${candidate.directory}/package.json`],
      cwd: repository.root,
      environment,
    });
    const manifest = projectPublicationManifest(candidate.directory, JSON.parse(source.stdout));
    const expected = serializeProjectedManifest(manifest);
    // Stream the one manifest to stdout: do not extract an evidence-supplied archive to disk.
    const packed = await runner({
      command: 'tar',
      arguments: [
        '-xOzf',
        resolve(dirname(path), 'packages', candidate.file),
        'package/package.json',
      ],
      cwd: repository.root,
      environment,
    });
    if (packed.stdout !== expected || sha256(expected) !== candidate.manifestSha256) {
      fail('WG_RC_PUBLICATION_MANIFEST', `${candidate.name} is not the frozen public projection.`);
    }
  }
  return evidence;
}
