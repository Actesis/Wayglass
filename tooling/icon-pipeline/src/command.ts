export const iconToolingExitCode = Object.freeze({
  success: 0,
  failure: 1,
  invocation: 2,
} as const);

export type IconToolingExitCode = (typeof iconToolingExitCode)[keyof typeof iconToolingExitCode];

export interface IconToolingCommandIo {
  readonly stdout: (message: string) => void;
  readonly stderr: (message: string) => void;
}

export interface IconToolingCommandHandlers {
  readonly check: () => Promise<void>;
  readonly generate: () => Promise<void>;
  readonly recover: () => Promise<void>;
}

export class IconToolingDiagnostic extends Error {
  readonly code: string;
  readonly exitCode: IconToolingExitCode;

  constructor(
    code: string,
    message: string,
    exitCode: IconToolingExitCode,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.code = code;
    this.exitCode = exitCode;
    this.name = 'IconToolingDiagnostic';
  }
}

const help = `Wayglass private icon tooling

Usage:
  pnpm icon-tooling:check
  pnpm icon-tooling:generate
  node --experimental-strip-types tooling/icon-pipeline/src/cli.ts recover

Commands:
  check     Validate source and compare the four committed artifacts without writing
  generate  Transactionally replace only the four contract-owned artifacts
  recover   Recover a stale interrupted writer only after its process is confirmed absent
`;

function supportedNodeVersion(version: string): boolean {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return major > 22 || (major === 22 && minor >= 13);
}

function invocation(message: string): IconToolingDiagnostic {
  return new IconToolingDiagnostic(
    'WG_ICON_COMMAND_USAGE',
    message,
    iconToolingExitCode.invocation,
  );
}

export async function runIconToolingCommand(
  args: readonly string[],
  handlers: IconToolingCommandHandlers,
  io: IconToolingCommandIo,
  nodeVersion = process.versions.node,
): Promise<IconToolingExitCode> {
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    io.stdout(help);
    return iconToolingExitCode.success;
  }

  try {
    if (args.length !== 1) throw invocation('Provide exactly one command; use --help for usage.');
    if (!supportedNodeVersion(nodeVersion)) {
      throw new IconToolingDiagnostic(
        'WG_ICON_COMMAND_ENVIRONMENT',
        `Node ${nodeVersion} is unsupported; Wayglass icon tooling requires Node 22.13 or newer.`,
        iconToolingExitCode.invocation,
      );
    }
    switch (args[0]) {
      case 'check':
        await handlers.check();
        break;
      case 'generate':
        await handlers.generate();
        break;
      case 'recover':
        await handlers.recover();
        break;
      default:
        throw invocation(`Unknown command "${args[0]}"; use --help for usage.`);
    }
    return iconToolingExitCode.success;
  } catch (error) {
    const diagnostic =
      error instanceof IconToolingDiagnostic
        ? error
        : new IconToolingDiagnostic(
            'WG_ICON_COMMAND_INTERNAL',
            'Icon tooling failed without a classified diagnostic.',
            iconToolingExitCode.failure,
            { cause: error },
          );
    io.stderr(`${diagnostic.code}: ${diagnostic.message}`);
    return diagnostic.exitCode;
  }
}
