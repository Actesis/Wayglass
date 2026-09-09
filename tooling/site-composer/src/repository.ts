import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

import { SITE_SURFACES } from './constants.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import type { SiteRepositoryContext, SiteSurfaceId } from './types.ts';

export type LocalCommand = (
  command: string,
  arguments_: readonly string[],
  cwd: string,
) => Uint8Array;

const gitObjectPattern = /^[0-9a-f]{40}$/;

export const runLocalCommand: LocalCommand = (command, arguments_, cwd) => {
  try {
    return execFileSync(command, arguments_, {
      cwd,
      encoding: 'buffer',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    fail('WG_SITE_COMMAND', `Local ${command} command failed.`);
  }
};

function text(bytes: Uint8Array, code: string, label: string): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
  } catch {
    fail(code, `${label} is not valid UTF-8.`);
  }
}

function git(command: LocalCommand, root: string, arguments_: readonly string[]): Uint8Array {
  return command('git', arguments_, root);
}

function gitObject(value: string, label: string): string {
  if (!gitObjectPattern.test(value))
    fail('WG_SITE_SOURCE_IDENTITY', `${label} is not a Git object.`);
  return value;
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return left.byteLength === right.byteLength && left.every((byte, index) => byte === right[index]);
}

function committedFile(command: LocalCommand, root: string, path: string): Uint8Array {
  return git(command, root, ['show', `HEAD:${path}`]);
}

function matchingTrackedFile(command: LocalCommand, root: string, path: string): Uint8Array {
  const committed = committedFile(command, root, path);
  let working: Uint8Array;
  try {
    working = readFileSync(resolve(root, path));
  } catch {
    fail('WG_SITE_SOURCE_FILE', `${path} must exist as a regular tracked file.`);
  }
  if (!equalBytes(committed, working)) {
    fail('WG_SITE_SOURCE_CHANGED', `${path} differs from committed HEAD bytes.`);
  }
  return committed;
}

function packageIdentity(bytes: Uint8Array, expected: string, path: string): string {
  let value: unknown;
  try {
    value = JSON.parse(text(bytes, 'WG_SITE_PACKAGE_JSON', path)) as unknown;
  } catch {
    fail('WG_SITE_PACKAGE_JSON', `${path} must be valid JSON.`);
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail('WG_SITE_PACKAGE_JSON', `${path} must contain an object.`);
  }
  const record = value as Record<string, unknown>;
  if (record.name !== expected || typeof record.version !== 'string') {
    fail('WG_SITE_PACKAGE_IDENTITY', `${path} has the wrong package identity.`);
  }
  return record.version;
}

function packageManagerVersion(bytes: Uint8Array): string {
  let value: unknown;
  try {
    value = JSON.parse(text(bytes, 'WG_SITE_ROOT_PACKAGE', 'package.json')) as unknown;
  } catch {
    fail('WG_SITE_ROOT_PACKAGE', 'package.json must be valid JSON.');
  }
  const packageManager =
    value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>).packageManager
      : undefined;
  if (typeof packageManager !== 'string' || !packageManager.startsWith('pnpm@')) {
    fail('WG_SITE_PACKAGE_MANAGER', 'package.json must pin pnpm with packageManager.');
  }
  const version = packageManager.slice('pnpm@'.length);
  if (version.length === 0) fail('WG_SITE_PACKAGE_MANAGER', 'The pinned pnpm version is empty.');
  return version;
}

export function validateSiteRepository(
  repositoryRoot: string,
  command: LocalCommand = runLocalCommand,
): SiteRepositoryContext {
  const requestedRoot = realpathSync(repositoryRoot);
  const discoveredRoot = realpathSync(
    text(
      git(command, requestedRoot, ['rev-parse', '--show-toplevel']),
      'WG_SITE_REPOSITORY',
      'root',
    ),
  );
  if (requestedRoot !== discoveredRoot) {
    fail('WG_SITE_REPOSITORY', 'site:compose must run at the repository root.');
  }

  const commit = gitObject(
    text(git(command, requestedRoot, ['rev-parse', 'HEAD']), 'WG_SITE_SOURCE_IDENTITY', 'HEAD'),
    'HEAD',
  );
  const tree = gitObject(
    text(
      git(command, requestedRoot, ['rev-parse', 'HEAD^{tree}']),
      'WG_SITE_SOURCE_IDENTITY',
      'HEAD tree',
    ),
    'HEAD tree',
  );
  const status = git(command, requestedRoot, [
    'status',
    '--porcelain=v1',
    '-z',
    '--untracked-files=all',
    '--',
    '.',
  ]);
  if (status.byteLength !== 0) {
    fail('WG_SITE_SOURCE_DIRTY', 'Repository source outside producer outputs must be clean.');
  }

  const lockfile = matchingTrackedFile(command, requestedRoot, 'pnpm-lock.yaml');
  const versions = {} as Record<SiteSurfaceId, string>;
  for (const surface of SITE_SURFACES) {
    versions[surface.id] = packageIdentity(
      matchingTrackedFile(command, requestedRoot, surface.packageManifest),
      surface.packageName,
      surface.packageManifest,
    );
  }
  const expectedPnpm = packageManagerVersion(
    matchingTrackedFile(command, requestedRoot, 'package.json'),
  );
  const actualPnpm = text(
    command('pnpm', ['--version'], requestedRoot),
    'WG_SITE_PACKAGE_MANAGER',
    'pnpm version',
  );
  if (actualPnpm !== expectedPnpm) {
    fail('WG_SITE_PACKAGE_MANAGER', 'The active pnpm version differs from packageManager.');
  }

  return {
    root: requestedRoot,
    source: { commit, tree, lockfileSha256: sha256(lockfile) },
    tooling: { commit, tree },
    environment: {
      node: process.version.replace(/^v/, ''),
      pnpm: actualPnpm,
      platform: process.platform,
      architecture: process.arch,
    },
    versions,
  };
}
