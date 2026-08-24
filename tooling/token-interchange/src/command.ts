export const tokenToolingExitCode = {
  success: 0,
  failure: 1,
  usage: 2,
} as const;

export type TokenToolingExitCode = (typeof tokenToolingExitCode)[keyof typeof tokenToolingExitCode];

export type TokenToolingCommand =
  | { readonly name: 'check' }
  | { readonly name: 'generate:web' }
  | {
      readonly name: 'generate:exchange';
      readonly sourceRevision: string;
      readonly output: string;
    }
  | { readonly name: 'verify'; readonly output: string }
  | { readonly name: 'measure'; readonly sourceRevision: string };

type TokenToolingCommandName = TokenToolingCommand['name'];

export interface TokenToolingCommandHandlers {
  readonly authenticateSourceRevision: (sourceRevision: string) => void | Promise<void>;
  readonly check: () => void | Promise<void>;
  readonly generateWeb: () => void | Promise<void>;
  readonly generateExchange: (options: {
    readonly sourceRevision: string;
    readonly output: string;
  }) => void | Promise<void>;
  readonly verify: (options: { readonly output: string }) => void | Promise<void>;
  readonly measure: (options: { readonly sourceRevision: string }) => void | Promise<void>;
}

export interface TokenToolingCommandIo {
  readonly stdout: (message: string) => void;
  readonly stderr: (message: string) => void;
}

export class TokenToolingDiagnostic extends Error {
  readonly code: string;
  readonly exitCode: TokenToolingExitCode;

  constructor(
    code: string,
    message: string,
    exitCode: TokenToolingExitCode,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'TokenToolingDiagnostic';
    this.code = code;
    this.exitCode = exitCode;
  }
}

const commandNames = ['check', 'generate:web', 'generate:exchange', 'verify', 'measure'] as const;

const revisionPattern = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;

function usageError(code: string, message: string): TokenToolingDiagnostic {
  return new TokenToolingDiagnostic(code, message, tokenToolingExitCode.usage);
}

function isCommandName(value: string): value is TokenToolingCommandName {
  return commandNames.some((name) => name === value);
}

function optionValue(
  arguments_: readonly string[],
  option: '--source-revision' | '--output',
): string | undefined {
  const matches = arguments_.flatMap((value, index) => (value === option ? [index] : []));
  if (matches.length > 1) {
    throw usageError('WG-TOKEN-USAGE-004', `Option "${option}" may be provided only once.`);
  }

  const index = matches[0];
  if (index === undefined) {
    return undefined;
  }

  const value = arguments_[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw usageError('WG-TOKEN-USAGE-005', `Option "${option}" requires a value.`);
  }
  return value;
}

function assertKnownOptions(
  arguments_: readonly string[],
  allowed: readonly ('--source-revision' | '--output')[],
): void {
  const consumedValues = new Set<number>();
  for (const [index, value] of arguments_.entries()) {
    if (consumedValues.has(index)) {
      continue;
    }
    if (!allowed.includes(value as '--source-revision' | '--output')) {
      throw usageError('WG-TOKEN-USAGE-003', `Unexpected argument "${value}".`);
    }
    consumedValues.add(index + 1);
  }
}

function requireOption(value: string | undefined, option: string): string {
  if (value === undefined) {
    throw usageError('WG-TOKEN-USAGE-006', `Required option "${option}" is missing.`);
  }
  return value;
}

function requireRevision(value: string | undefined): string {
  const revision = requireOption(value, '--source-revision');
  if (!revisionPattern.test(revision)) {
    throw usageError(
      'WG-TOKEN-USAGE-007',
      'Option "--source-revision" must be a full 40- or 64-character hexadecimal commit.',
    );
  }
  return revision.toLowerCase();
}

export function parseTokenToolingCommand(arguments_: readonly string[]): TokenToolingCommand {
  const [commandName, ...rawOptions] = arguments_;
  if (commandName === undefined) {
    throw usageError('WG-TOKEN-USAGE-001', 'A token-tooling command is required.');
  }
  if (!isCommandName(commandName)) {
    throw usageError('WG-TOKEN-USAGE-002', `Unknown token-tooling command "${commandName}".`);
  }
  const options = rawOptions[0] === '--' ? rawOptions.slice(1) : rawOptions;

  if (commandName === 'check' || commandName === 'generate:web') {
    assertKnownOptions(options, []);
    return { name: commandName };
  }

  if (commandName === 'verify') {
    assertKnownOptions(options, ['--output']);
    return {
      name: commandName,
      output: requireOption(optionValue(options, '--output'), '--output'),
    };
  }

  if (commandName === 'measure') {
    assertKnownOptions(options, ['--source-revision']);
    return {
      name: commandName,
      sourceRevision: requireRevision(optionValue(options, '--source-revision')),
    };
  }

  assertKnownOptions(options, ['--source-revision', '--output']);
  return {
    name: commandName,
    sourceRevision: requireRevision(optionValue(options, '--source-revision')),
    output: requireOption(optionValue(options, '--output'), '--output'),
  };
}

export function tokenToolingHelp(): string {
  return [
    'Wayglass private token tooling',
    '',
    'Usage:',
    '  token-tooling check',
    '  token-tooling generate:web',
    '  token-tooling generate:exchange --source-revision <full-sha> --output <path>',
    '  token-tooling verify --output <path>',
    '  token-tooling measure --source-revision <full-sha>',
    '',
    'Options:',
    '  --help  Show this help without loading token source or writing files.',
  ].join('\n');
}

async function dispatch(
  command: TokenToolingCommand,
  handlers: TokenToolingCommandHandlers,
): Promise<void> {
  switch (command.name) {
    case 'check':
      await handlers.check();
      break;
    case 'generate:web':
      await handlers.generateWeb();
      break;
    case 'generate:exchange':
      await handlers.authenticateSourceRevision(command.sourceRevision);
      await handlers.generateExchange(command);
      break;
    case 'verify':
      await handlers.verify(command);
      break;
    case 'measure':
      await handlers.authenticateSourceRevision(command.sourceRevision);
      await handlers.measure(command);
      break;
  }
}

export async function runTokenToolingCommand(
  arguments_: readonly string[],
  handlers: TokenToolingCommandHandlers,
  io: TokenToolingCommandIo,
): Promise<TokenToolingExitCode> {
  if (arguments_.includes('--help')) {
    io.stdout(tokenToolingHelp());
    return tokenToolingExitCode.success;
  }

  try {
    await dispatch(parseTokenToolingCommand(arguments_), handlers);
    return tokenToolingExitCode.success;
  } catch (error) {
    if (error instanceof TokenToolingDiagnostic) {
      io.stderr(`${error.code}: ${error.message}`);
      return error.exitCode;
    }

    io.stderr('WG-TOKEN-INTERNAL-001: Token tooling failed unexpectedly.');
    return tokenToolingExitCode.failure;
  }
}
