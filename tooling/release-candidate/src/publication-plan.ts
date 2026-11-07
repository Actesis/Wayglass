import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { candidateDirectories, frozenSource } from './constants.ts';
import { offlineEnvironment } from './environment.ts';
import { sha256 } from './hash.ts';
import { projectPackageManifest } from './manifest.ts';
import { validateNewOutputPath } from './path-safety.ts';
import { assertCleanTooling, authenticateFrozenSource, identifyRepository } from './repository.ts';
import type { CandidateDirectory, CommandRunner, ProjectedManifest } from './types.ts';

export type PublicationManifest = Omit<ProjectedManifest, 'private'> & { readonly private: false };

// Keep the private-candidate projection unchanged. This separate review-only projection changes
// exactly the publication guard in isolated output, never the frozen source or accepted tarballs.
export function projectPublicationManifest(
  directory: CandidateDirectory,
  source: unknown,
): PublicationManifest {
  const candidate = projectPackageManifest(directory, source);
  return Object.freeze({ ...candidate, private: false });
}

export async function preparePublicationPlan(
  cwd: string,
  source: string,
  outputPath: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
): Promise<void> {
  const environment = offlineEnvironment(inputEnvironment);
  const repository = await identifyRepository(cwd, runner);
  await assertCleanTooling(repository, runner);
  await authenticateFrozenSource(repository.root, source, runner);
  const output = validateNewOutputPath(outputPath, repository.root);
  const packages = [];
  for (const directory of candidateDirectories) {
    const result = await runner({
      command: 'git',
      arguments: ['show', `${source}:packages/${directory}/package.json`],
      cwd: repository.root,
      environment,
    });
    const manifest = projectPublicationManifest(directory, JSON.parse(result.stdout));
    const bytes = `${JSON.stringify(manifest, null, 2)}\n`;
    packages.push({ directory, manifest, bytes, sha256: sha256(bytes) });
  }
  mkdirSync(output);
  try {
    for (const entry of packages) {
      const directory = resolve(output, entry.directory);
      mkdirSync(directory);
      const path = resolve(directory, 'package.json');
      writeFileSync(path, entry.bytes, { flag: 'wx' });
      if (sha256(readFileSync(path)) !== entry.sha256)
        throw new Error('Publication manifest changed during retention.');
    }
    writeFileSync(
      resolve(output, 'publication-plan.json'),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          publicationAuthorized: false,
          distTag: null,
          source: frozenSource,
          tooling: { commit: repository.commit, tree: repository.tree },
          packages: packages.map(({ directory, manifest, sha256: digest }) => ({
            directory,
            name: manifest.name,
            version: manifest.version,
            manifestSha256: digest,
            manifestPath: `${directory}/package.json`,
          })),
        },
        null,
        2,
      )}\n`,
      { flag: 'wx' },
    );
  } catch (error) {
    rmSync(output, { recursive: true, force: true });
    throw error;
  }
}
