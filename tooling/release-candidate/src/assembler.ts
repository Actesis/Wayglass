import {
  accessSync,
  constants,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { delimiter, isAbsolute, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { candidateDirectories, candidatePackageNames, frozenSource } from './constants.ts';
import { auditProductionDependencies, type DependencyAuditEvidence } from './dependency-audit.ts';
import { serializeEvidence } from './evidence.ts';
import { offlineEnvironment } from './environment.ts';
import { fail } from './error.ts';
import { stagePackage } from './filesystem.ts';
import { projectCandidateInventory } from './manifest.ts';
import { readInstalledProductionDependencies } from './installed-dependencies.ts';
import {
  auditPackedPackages,
  type PackageAuditEvidence,
  type PackedPackageAuditInput,
} from './package-audit.ts';
import { packAndInspect } from './packing.ts';
import { validateNewOutputPath } from './path-safety.ts';
import {
  assertCleanTooling,
  assertWorktreeIdentity,
  authenticateFrozenSource,
  identifyRepository,
} from './repository.ts';
import { commandText } from './process.ts';
import { assertReproducibleCandidates } from './reproducibility.ts';
import type {
  CandidateEvidence,
  CandidateSource,
  CommandRunner,
  PackedCandidate,
  PackableManifest,
  ProjectedManifest,
} from './types.ts';

interface AssemblyPass {
  readonly root: string;
  readonly worktree: string;
  readonly packages: readonly PackedCandidate[];
  readonly auditInputs: readonly PackedPackageAuditInput[];
}

export interface CandidateBuildResult {
  readonly evidencePath: string;
  readonly packageAudit: PackageAuditEvidence;
  readonly dependencyAudit: DependencyAuditEvidence;
}

export function assemblyPassEnvironment(
  environment: Readonly<Record<string, string>>,
  store: string,
  userConfig: string,
  packageManagerBin: string,
): Readonly<Record<string, string>> {
  return Object.freeze({
    ...environment,
    PATH: `${packageManagerBin}${delimiter}${environment.PATH ?? ''}`,
    npm_config_store_dir: store,
    npm_config_userconfig: userConfig,
  });
}

export function packageManagerExecutable(environment: Readonly<Record<string, string>>): string {
  const executable = environment.npm_execpath;
  if (executable === undefined || !isAbsolute(executable) || !existsSync(executable)) {
    fail(
      'WG_RC_PACKAGE_MANAGER_EXECUTABLE',
      'Rehearsal must be launched by the repository-pinned pnpm executable.',
    );
  }
  return executable;
}

export function packageManagerInvocation(
  environment: Readonly<Record<string, string>>,
  arguments_: readonly string[],
): { readonly command: string; readonly arguments: readonly string[] } {
  const executable = packageManagerExecutable(environment);
  try {
    accessSync(executable, constants.X_OK);
    return Object.freeze({ command: executable, arguments: Object.freeze([...arguments_]) });
  } catch {
    return Object.freeze({
      command: process.execPath,
      arguments: Object.freeze([executable, ...arguments_]),
    });
  }
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function createPackageManagerShim(
  root: string,
  environment: Readonly<Record<string, string>>,
): string {
  const bin = resolve(root, 'package-manager-bin');
  mkdirSync(bin);
  const executable = packageManagerExecutable(environment);
  const shim = resolve(bin, 'pnpm');
  try {
    accessSync(executable, constants.X_OK);
    symlinkSync(executable, shim);
  } catch {
    writeFileSync(
      shim,
      `#!/bin/sh\nexec ${shellQuote(process.execPath)} ${shellQuote(executable)} "$@"\n`,
      { encoding: 'utf8', flag: 'wx', mode: 0o700 },
    );
  }
  return bin;
}

async function manifestsFromGit(
  repositoryRoot: string,
  source: string,
  runner: CommandRunner,
): Promise<readonly ProjectedManifest[]> {
  const candidates: CandidateSource[] = [];
  for (const directory of candidateDirectories) {
    const { stdout } = await runner({
      command: 'git',
      arguments: ['show', `${source}:packages/${directory}/package.json`],
      cwd: repositoryRoot,
    });
    let manifest: unknown;
    try {
      manifest = JSON.parse(stdout);
    } catch {
      return fail('WG_RC_SOURCE_MANIFEST', `packages/${directory}/package.json is not valid JSON.`);
    }
    candidates.push({ directory, manifest });
  }
  return projectCandidateInventory(candidates);
}

export async function checkCandidateSource(
  cwd: string,
  source: string,
  runner: CommandRunner,
): Promise<void> {
  const repository = await identifyRepository(cwd, runner);
  await authenticateFrozenSource(repository.root, source, runner);
  await manifestsFromGit(repository.root, source, runner);
}

async function runAssemblyPass(
  repositoryRoot: string,
  source: string,
  store: string,
  manifests: readonly PackableManifest[],
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<AssemblyPass> {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-pass-'));
  const worktree = resolve(root, 'worktree');
  const staging = resolve(root, 'staging');
  const tarballs = resolve(root, 'tarballs');
  const userConfig = resolve(root, 'empty-npmrc');
  writeFileSync(userConfig, '', { encoding: 'utf8', flag: 'wx' });
  const packageManagerBin = createPackageManagerShim(root, environment);
  const passEnvironment = assemblyPassEnvironment(
    environment,
    store,
    userConfig,
    packageManagerBin,
  );
  let attached = false;
  try {
    await runner({
      command: 'git',
      arguments: ['worktree', 'add', '--detach', worktree, source],
      cwd: repositoryRoot,
      environment: passEnvironment,
    });
    attached = true;
    await assertWorktreeIdentity(worktree, runner, passEnvironment);
    try {
      await runner({
        command: 'pnpm',
        arguments: [
          'install',
          '--offline',
          '--frozen-lockfile',
          '--ignore-scripts',
          '--store-dir',
          store,
        ],
        cwd: worktree,
        environment: passEnvironment,
      });
    } catch (error) {
      fail(
        'WG_RC_OFFLINE_MATERIAL',
        `Offline frozen installation failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
    await runner({
      ...packageManagerInvocation(environment, ['check']),
      cwd: worktree,
      environment: passEnvironment,
    });
    for (const name of candidatePackageNames) {
      await runner({
        command: 'pnpm',
        arguments: ['--filter', name, 'build'],
        cwd: worktree,
        environment: passEnvironment,
      });
    }

    mkdirSync(staging);
    const packages: PackedCandidate[] = [];
    const auditInputs: PackedPackageAuditInput[] = [];
    for (const [index, directory] of candidateDirectories.entries()) {
      const stagedPackage = resolve(staging, directory);
      const inspection = stagePackage(
        resolve(worktree, 'packages', directory),
        stagedPackage,
        manifests[index]!,
      );
      let observedFiles: PackedPackageAuditInput['files'] | undefined;
      packages.push(
        await packAndInspect(
          directory,
          stagedPackage,
          tarballs,
          manifests[index]!,
          inspection,
          runner,
          passEnvironment,
          (files) => {
            observedFiles = files;
          },
        ),
      );
      if (observedFiles === undefined) {
        fail('WG_RC_PACKAGE_AUDIT', `${manifests[index]!.name} packed bytes were not observed.`);
      }
      const manifest = manifests[index]!;
      // The existing private audit format must not silently admit public-review artifacts.
      if (manifest.private) auditInputs.push({ directory, manifest, files: observedFiles });
    }
    return Object.freeze({
      root,
      worktree,
      packages: Object.freeze(packages),
      auditInputs: Object.freeze(auditInputs),
    });
  } catch (error) {
    if (attached) {
      try {
        await runner({
          command: 'git',
          arguments: ['worktree', 'remove', '--force', worktree],
          cwd: repositoryRoot,
          environment: passEnvironment,
        });
      } catch (cleanupError) {
        fail(
          'WG_RC_CLEANUP',
          `Assembly failed and its worktree could not be removed: ${cleanupError instanceof Error ? cleanupError.message : 'unknown error'}`,
        );
      }
    }
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}

async function removePass(
  repositoryRoot: string,
  pass: AssemblyPass,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<void> {
  await runner({
    command: 'git',
    arguments: ['worktree', 'remove', '--force', resolve(pass.root, 'worktree')],
    cwd: repositoryRoot,
    environment,
  });
  rmSync(pass.root, { recursive: true, force: true });
}

async function buildCandidateInternal(
  cwd: string,
  source: string,
  outputArgument: string,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
  collectAudits: boolean,
  artifactKind: 'private' | 'publication-review' = 'private',
): Promise<{
  readonly evidencePath: string;
  readonly packageAudit?: PackageAuditEvidence;
  readonly dependencyAudit?: DependencyAuditEvidence;
}> {
  const repository = await identifyRepository(cwd, runner);
  const output = validateNewOutputPath(outputArgument, repository.root);
  await assertCleanTooling(repository, runner);
  await authenticateFrozenSource(repository.root, source, runner);
  const privateManifests = await manifestsFromGit(repository.root, source, runner);
  const manifests: readonly PackableManifest[] =
    artifactKind === 'private'
      ? privateManifests
      : privateManifests.map((manifest) => Object.freeze({ ...manifest, private: false as const }));
  const store = resolve(repository.root, '.pnpm-store');
  const first = await runAssemblyPass(
    repository.root,
    source,
    store,
    manifests,
    runner,
    environment,
  );
  let second: AssemblyPass | undefined;
  let outputCreated = false;
  let evidencePath: string | undefined;
  let packageAudit: PackageAuditEvidence | undefined;
  let dependencyAudit: DependencyAuditEvidence | undefined;
  let failure: unknown;
  try {
    second = await runAssemblyPass(repository.root, source, store, manifests, runner, environment);
    assertReproducibleCandidates(first.packages, second.packages);
    if (collectAudits) {
      if (artifactKind !== 'private')
        fail('WG_RC_PRIVACY', 'Private audits require private candidates.');
      packageAudit = auditPackedPackages(first.auditInputs);
      dependencyAudit = auditProductionDependencies(
        packageAudit,
        readInstalledProductionDependencies(first.worktree, packageAudit),
      );
    }
    const pnpm = await commandText(runner, {
      ...packageManagerInvocation(environment, ['--version']),
      cwd: repository.root,
      environment,
    });
    const npm = await commandText(runner, {
      command: 'npm',
      arguments: ['--version'],
      cwd: repository.root,
      environment,
    });
    const evidence: CandidateEvidence = Object.freeze({
      schemaVersion: 1,
      source: frozenSource,
      tooling: { commit: repository.commit, tree: repository.tree },
      environment: {
        platform: process.platform,
        architecture: process.arch,
        node: process.version,
        pnpm,
        npm,
      },
      reproducibility: { runs: 2 as const, byteIdentical: true as const },
      packages: first.packages,
      ...(artifactKind === 'private'
        ? {}
        : {
            artifactKind: 'publication-review' as const,
            publicationAuthorized: false as const,
            distTag: null,
          }),
    });
    mkdirSync(output);
    outputCreated = true;
    const outputPackages = resolve(output, 'packages');
    mkdirSync(outputPackages);
    for (const candidate of first.packages) {
      cpSync(
        resolve(first.root, 'tarballs', candidate.file),
        resolve(outputPackages, candidate.file),
        {
          errorOnExist: true,
        },
      );
    }
    evidencePath = resolve(
      output,
      artifactKind === 'private' ? 'evidence.json' : 'publication-evidence.json',
    );
    writeFileSync(evidencePath, serializeEvidence(evidence), { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    failure = error;
  }
  for (const pass of [first, second]) {
    if (pass === undefined) continue;
    try {
      await removePass(repository.root, pass, runner, environment);
    } catch (error) {
      failure ??= error;
    }
  }
  if (failure !== undefined) {
    if (outputCreated) rmSync(output, { recursive: true, force: true });
    throw failure;
  }
  return Object.freeze({
    evidencePath: evidencePath!,
    ...(packageAudit === undefined ? {} : { packageAudit }),
    ...(dependencyAudit === undefined ? {} : { dependencyAudit }),
  });
}

export async function buildCandidateWithAudit(
  cwd: string,
  source: string,
  outputArgument: string,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<CandidateBuildResult> {
  const result = await buildCandidateInternal(
    cwd,
    source,
    outputArgument,
    runner,
    environment,
    true,
  );
  if (result.packageAudit === undefined || result.dependencyAudit === undefined) {
    fail('WG_RC_PACKAGE_AUDIT', 'Candidate audit collection did not complete.');
  }
  return Object.freeze({
    evidencePath: result.evidencePath,
    packageAudit: result.packageAudit,
    dependencyAudit: result.dependencyAudit,
  });
}

export async function buildCandidate(
  cwd: string,
  source: string,
  outputArgument: string,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<string> {
  return (await buildCandidateInternal(cwd, source, outputArgument, runner, environment, false))
    .evidencePath;
}

// This explicit entry point builds review artifacts only. It never reclassifies accepted private
// candidates, selects a dist-tag, creates tags, or supplies publishing credentials.
export async function buildPublicationArtifacts(
  cwd: string,
  source: string,
  outputArgument: string,
  runner: CommandRunner,
  inputEnvironment: NodeJS.ProcessEnv,
): Promise<string> {
  const environment = offlineEnvironment(inputEnvironment);
  return (
    await buildCandidateInternal(
      cwd,
      source,
      outputArgument,
      runner,
      environment,
      false,
      'publication-review',
    )
  ).evidencePath;
}
