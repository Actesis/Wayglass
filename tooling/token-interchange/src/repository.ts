import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { tokenToolingExitCode, TokenToolingDiagnostic } from './command.ts';
import type { RepositorySourceState } from './source-revision.ts';

export const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));

function git(arguments_: readonly string[]): string {
  try {
    return execFileSync('git', arguments_, {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (error) {
    throw new TokenToolingDiagnostic(
      'WG-TOKEN-ENV-001',
      'Token tooling requires a readable Git checkout and Git executable.',
      tokenToolingExitCode.usage,
      { cause: error },
    );
  }
}

export function readRepositorySourceState(): RepositorySourceState {
  const headRevision = git(['rev-parse', '--verify', 'HEAD']);
  if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(headRevision)) {
    throw new TokenToolingDiagnostic(
      'WG-TOKEN-ENV-002',
      'The checked-out Git revision is not a supported full commit identifier.',
      tokenToolingExitCode.usage,
    );
  }

  const status = git(['status', '--porcelain=v1', '--untracked-files=no']);
  return {
    headRevision: headRevision.toLowerCase(),
    trackedChanges: status ? status.split('\n') : [],
  };
}
