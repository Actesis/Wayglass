import { tokenToolingExitCode, TokenToolingDiagnostic } from './command.js';

export interface RepositorySourceState {
  readonly headRevision: string;
  readonly trackedChanges: readonly string[];
}

export function authenticateSourceRevision(
  requestedRevision: string,
  repository: RepositorySourceState,
): void {
  if (requestedRevision.toLowerCase() !== repository.headRevision.toLowerCase()) {
    throw new TokenToolingDiagnostic(
      'WG-TOKEN-AUTH-001',
      'The requested source revision does not match the checked-out commit.',
      tokenToolingExitCode.failure,
    );
  }

  if (repository.trackedChanges.length > 0) {
    throw new TokenToolingDiagnostic(
      'WG-TOKEN-AUTH-002',
      'Authenticated token tooling requires a checkout with no tracked changes.',
      tokenToolingExitCode.failure,
    );
  }
}
