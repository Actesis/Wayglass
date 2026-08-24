import type { TokenToolingCommandHandlers, TokenToolingCommandIo } from './command.ts';
import { tokenToolingExitCode, TokenToolingDiagnostic } from './command.ts';

function failure(code: string, message: string, cause: unknown): TokenToolingDiagnostic {
  return new TokenToolingDiagnostic(code, message, tokenToolingExitCode.failure, { cause });
}

export function createTokenToolingCommandHandlers(
  io: TokenToolingCommandIo,
): TokenToolingCommandHandlers {
  return {
    authenticateSourceRevision: async (sourceRevision) => {
      const [{ readRepositorySourceState }, { authenticateSourceRevision }] = await Promise.all([
        import('./repository.ts'),
        import('./source-revision.ts'),
      ]);
      authenticateSourceRevision(sourceRevision, readRepositorySourceState());
    },
    check: async () => {
      const [{ runTokenToolingCheck }, { readRepositorySourceState }] = await Promise.all([
        import('./check.ts'),
        import('./repository.ts'),
      ]);
      const summary = await runTokenToolingCheck({
        sourceRevision: readRepositorySourceState().headRevision,
      });
      io.stdout(
        `WG-TOKEN-CHECK-OK: ${summary.tokens} tokens, ${summary.overrides} overrides, ${summary.webArtifacts} web artifacts, and ${summary.exchangeFiles} exchange files verified at ${summary.sourceRevision}.`,
      );
    },
    generateWeb: async () => {
      try {
        const { generateWebArtifacts } = await import('./generate-web.ts');
        const result = await generateWebArtifacts();
        io.stdout(
          `WG-TOKEN-GENERATE-WEB-OK: ${result.created.length} created, ${result.updated.length} updated, and ${result.unchanged.length} unchanged.`,
        );
      } catch (error) {
        throw failure(
          'WG-TOKEN-WEB-001',
          'Web artifact generation failed; inspect tracked outputs and tool-owned sibling temporaries before retrying.',
          error,
        );
      }
    },
    generateExchange: async ({ sourceRevision, output }) => {
      try {
        const [
          { createDtcgExchange },
          { resolveExchangeOutputPath },
          { createWayglassTokenGraph },
          { currentWebPolicy },
          writer,
        ] = await Promise.all([
          import('./dtcg.ts'),
          import('./output-path.ts'),
          import('./source.ts'),
          import('./web-policy.ts'),
          import('./writer.ts'),
        ]);
        const exchange = createDtcgExchange(createWayglassTokenGraph(), {
          defaultTheme: currentWebPolicy.defaultTheme,
          defaultDensity: 'compact',
          sourceRevision,
        });
        const resolvedOutput = await resolveExchangeOutputPath(output);
        const result = await writer.writeDtcgExchange(exchange, resolvedOutput, { replace: true });
        io.stdout(
          `WG-TOKEN-GENERATE-EXCHANGE-OK: ${result.status} release ${result.release} at ${resolvedOutput}.`,
        );
      } catch (error) {
        throw failure(
          'WG-TOKEN-EXCHANGE-001',
          'Private exchange generation failed; verify the output root, lock, and accepted release before retrying.',
          error,
        );
      }
    },
    verify: async ({ output }) => {
      try {
        const [{ resolveExchangeOutputPath }, { verifyDtcgExchangeRoot }] = await Promise.all([
          import('./output-path.ts'),
          import('./writer.ts'),
        ]);
        const resolvedOutput = await resolveExchangeOutputPath(output);
        const pointer = await verifyDtcgExchangeRoot(resolvedOutput);
        io.stdout(
          `WG-TOKEN-VERIFY-OK: release ${pointer.release} at ${resolvedOutput} matches source ${pointer.sourceRevision}.`,
        );
      } catch (error) {
        throw failure(
          'WG-TOKEN-VERIFY-001',
          'Private exchange verification failed; preserve the output for integrity review.',
          error,
        );
      }
    },
    measure: async ({ sourceRevision }) => {
      try {
        const { measureTokenToolingCapacity } = await import('./capacity.ts');
        const measurement = measureTokenToolingCapacity(sourceRevision);
        io.stdout(`WG-TOKEN-MEASURE-OK: ${JSON.stringify(measurement)}`);
      } catch (error) {
        throw failure(
          'WG-TOKEN-MEASURE-001',
          'Token-tooling capacity measurement failed before producing complete results.',
          error,
        );
      }
    },
  };
}
