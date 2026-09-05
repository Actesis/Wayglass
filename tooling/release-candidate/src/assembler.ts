import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { candidateDirectories, candidatePackageNames, frozenSource } from './constants.ts';
import { serializeEvidence } from './evidence.ts';
import { fail } from './error.ts';
import { stagePackage } from './filesystem.ts';
import { projectCandidateInventory } from './manifest.ts';
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
  ProjectedManifest,
} from './types.ts';

interface AssemblyPass {
  readonly root: string;
  readonly packages: readonly PackedCandidate[];
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
  manifests: readonly ProjectedManifest[],
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<AssemblyPass> {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-pass-'));
  const worktree = resolve(root, 'worktree');
  const staging = resolve(root, 'staging');
  const tarballs = resolve(root, 'tarballs');
  const userConfig = resolve(root, 'empty-npmrc');
  writeFileSync(userConfig, '', { encoding: 'utf8', flag: 'wx' });
  const passEnvironment = { ...environment, npm_config_userconfig: userConfig };
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
      command: 'pnpm',
      arguments: ['check'],
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
    for (const [index, directory] of candidateDirectories.entries()) {
      const stagedPackage = resolve(staging, directory);
      const inspection = stagePackage(
        resolve(worktree, 'packages', directory),
        stagedPackage,
        manifests[index]!,
      );
      packages.push(
        await packAndInspect(
          directory,
          stagedPackage,
          tarballs,
          manifests[index]!,
          inspection,
          runner,
          passEnvironment,
        ),
      );
    }
    return Object.freeze({ root, packages: Object.freeze(packages) });
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

export async function buildCandidate(
  cwd: string,
  source: string,
  outputArgument: string,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<string> {
  const repository = await identifyRepository(cwd, runner);
  const output = validateNewOutputPath(outputArgument, repository.root);
  await assertCleanTooling(repository, runner);
  await authenticateFrozenSource(repository.root, source, runner);
  const manifests = await manifestsFromGit(repository.root, source, runner);
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
  let failure: unknown;
  try {
    second = await runAssemblyPass(repository.root, source, store, manifests, runner, environment);
    assertReproducibleCandidates(first.packages, second.packages);
    const pnpm = await commandText(runner, {
      command: 'pnpm',
      arguments: ['--version'],
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
    evidencePath = resolve(output, 'evidence.json');
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
  return evidencePath!;
}
