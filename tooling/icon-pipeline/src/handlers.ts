import type { IconToolingCommandHandlers, IconToolingCommandIo } from './command.ts';
import { iconToolingExitCode, IconToolingDiagnostic } from './command.ts';

function failure(code: string, message: string, cause: unknown): IconToolingDiagnostic {
  return new IconToolingDiagnostic(code, message, iconToolingExitCode.failure, { cause });
}

export function createIconToolingCommandHandlers(
  io: IconToolingCommandIo,
): IconToolingCommandHandlers {
  return {
    check: async () => {
      try {
        const { checkRepositoryIconArtifacts } = await import('./repository.ts');
        const result = await checkRepositoryIconArtifacts();
        io.stdout(
          `WG_ICON_CHECK_OK: ${result.icons} icons and ${result.artifacts} generated artifacts verified.`,
        );
      } catch (error) {
        const drift =
          error instanceof Error && error.message.startsWith('WG_ICON_CHECK_DRIFT:')
            ? ` ${error.message}`
            : '';
        throw failure(
          'WG_ICON_CHECK_FAILED',
          `Generated icon artifacts are missing, changed, or fail integrity verification.${drift}`,
          error,
        );
      }
    },
    generate: async () => {
      try {
        const { generateRepositoryIconArtifacts } = await import('./repository.ts');
        const result = await generateRepositoryIconArtifacts();
        io.stdout(
          `WG_ICON_GENERATE_OK: ${result.created.length} created, ${result.updated.length} updated, and ${result.unchanged.length} unchanged.`,
        );
      } catch (error) {
        throw failure(
          'WG_ICON_GENERATE_FAILED',
          'Icon generation failed; preserve the lock and tool-owned siblings for integrity review.',
          error,
        );
      }
    },
    recover: async () => {
      try {
        const { recoverRepositoryIconWriter } = await import('./repository.ts');
        const result = await recoverRepositoryIconWriter();
        io.stdout(
          `WG_ICON_RECOVER_OK: removed stale lock for process ${result.pid}; ${result.restored.length} paths restored.`,
        );
      } catch (error) {
        throw failure(
          'WG_ICON_RECOVER_FAILED',
          'Icon writer recovery refused to proceed; verify the recorded process and committed set.',
          error,
        );
      }
    },
  };
}
