import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { frozenSource } from './constants.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { commandText } from './process.ts';
import type { CommandRunner } from './types.ts';

export interface RepositoryIdentity {
  readonly root: string;
  readonly commit: string;
  readonly tree: string;
}

export async function identifyRepository(
  cwd: string,
  runner: CommandRunner,
): Promise<RepositoryIdentity> {
  const root = await commandText(runner, {
    command: 'git',
    arguments: ['rev-parse', '--show-toplevel'],
    cwd,
  });
  const commit = await commandText(runner, {
    command: 'git',
    arguments: ['rev-parse', 'HEAD'],
    cwd: root,
  });
  const tree = await commandText(runner, {
    command: 'git',
    arguments: ['rev-parse', 'HEAD^{tree}'],
    cwd: root,
  });
  return Object.freeze({ root, commit, tree });
}

export async function assertCleanTooling(
  identity: RepositoryIdentity,
  runner: CommandRunner,
): Promise<void> {
  const status = await commandText(runner, {
    command: 'git',
    arguments: ['status', '--porcelain=v1'],
    cwd: identity.root,
  });
  if (status !== '') fail('WG_RC_TOOLING_DIRTY', 'Tooling commit has working-tree changes.');
}

export async function authenticateFrozenSource(
  root: string,
  source: string,
  runner: CommandRunner,
): Promise<void> {
  if (!/^[a-f0-9]{40}$/.test(source) || source !== frozenSource.commit) {
    fail('WG_RC_SOURCE_COMMIT', `Source must equal the accepted commit ${frozenSource.commit}.`);
  }
  const commit = await commandText(runner, {
    command: 'git',
    arguments: ['rev-parse', `${source}^{commit}`],
    cwd: root,
  });
  const tree = await commandText(runner, {
    command: 'git',
    arguments: ['rev-parse', `${source}^{tree}`],
    cwd: root,
  });
  const lockfile = (
    await runner({
      command: 'git',
      arguments: ['show', `${source}:pnpm-lock.yaml`],
      cwd: root,
    })
  ).stdout;
  if (commit !== frozenSource.commit || tree !== frozenSource.tree) {
    fail('WG_RC_SOURCE_IDENTITY', 'Source commit or tree differs from the accepted freeze.');
  }
  if (sha256(lockfile) !== frozenSource.lockfileSha256) {
    fail('WG_RC_SOURCE_LOCKFILE', 'Source lockfile differs from the accepted freeze.');
  }
}

export async function assertWorktreeIdentity(
  path: string,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<void> {
  const commit = await commandText(runner, {
    command: 'git',
    arguments: ['rev-parse', 'HEAD'],
    cwd: path,
    environment,
  });
  const tree = await commandText(runner, {
    command: 'git',
    arguments: ['rev-parse', 'HEAD^{tree}'],
    cwd: path,
    environment,
  });
  const status = await commandText(runner, {
    command: 'git',
    arguments: ['status', '--porcelain=v1'],
    cwd: path,
    environment,
  });
  const lockfileHash = sha256(readFileSync(resolve(path, 'pnpm-lock.yaml')));
  if (
    commit !== frozenSource.commit ||
    tree !== frozenSource.tree ||
    lockfileHash !== frozenSource.lockfileSha256 ||
    status !== ''
  ) {
    fail('WG_RC_WORKTREE_IDENTITY', 'Detached worktree does not match the clean accepted freeze.');
  }
}
