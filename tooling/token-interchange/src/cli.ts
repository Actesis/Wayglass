#!/usr/bin/env node

import {
  runTokenToolingCommand,
  tokenToolingExitCode,
  TokenToolingDiagnostic,
  type TokenToolingCommandHandlers,
} from './command.ts';

const io = {
  stdout: (message: string) => console.log(message),
  stderr: (message: string) => console.error(message),
};

function unavailable(command: string): never {
  throw new TokenToolingDiagnostic(
    'WG-TOKEN-USAGE-008',
    `Command "${command}" is not available in the current migration stage.`,
    tokenToolingExitCode.usage,
  );
}

const handlers: TokenToolingCommandHandlers = {
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
      throw new TokenToolingDiagnostic(
        'WG-TOKEN-WEB-001',
        'Web artifact generation failed; inspect tracked outputs and tool-owned sibling temporaries before retrying.',
        tokenToolingExitCode.failure,
        { cause: error },
      );
    }
  },
  generateExchange: () => unavailable('generate:exchange'),
  verify: () => unavailable('verify'),
  measure: () => unavailable('measure'),
};

process.exitCode = await runTokenToolingCommand(process.argv.slice(2), handlers, io);
