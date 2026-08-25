import { describe, expect, it, vi } from 'vitest';

import {
  parseTokenToolingCommand,
  runTokenToolingCommand,
  tokenToolingExitCode,
  TokenToolingDiagnostic,
  type TokenToolingCommandHandlers,
} from '../src/command.js';

const revision = '0123456789abcdef0123456789abcdef01234567';

function handlers(): TokenToolingCommandHandlers {
  return {
    authenticateSourceRevision: vi.fn(),
    check: vi.fn(),
    generateWeb: vi.fn(),
    generateExchange: vi.fn(),
    verify: vi.fn(),
    measure: vi.fn(),
  };
}

function io() {
  return { stdout: vi.fn(), stderr: vi.fn() };
}

describe('token-tooling command parsing', () => {
  it('parses every accepted command shape', () => {
    expect(parseTokenToolingCommand(['check'])).toEqual({ name: 'check' });
    expect(parseTokenToolingCommand(['generate:web'])).toEqual({ name: 'generate:web' });
    expect(
      parseTokenToolingCommand([
        'generate:exchange',
        '--',
        '--output',
        '.token-output',
        '--source-revision',
        revision.toUpperCase(),
      ]),
    ).toEqual({
      name: 'generate:exchange',
      output: '.token-output',
      sourceRevision: revision,
    });
    expect(parseTokenToolingCommand(['verify', '--output', '/tmp/exchange'])).toEqual({
      name: 'verify',
      output: '/tmp/exchange',
    });
    expect(parseTokenToolingCommand(['measure', '--source-revision', revision])).toEqual({
      name: 'measure',
      sourceRevision: revision,
    });
  });

  it.each([
    { arguments_: [], code: 'WG-TOKEN-USAGE-001' },
    { arguments_: ['unknown'], code: 'WG-TOKEN-USAGE-002' },
    { arguments_: ['check', '--output', 'path'], code: 'WG-TOKEN-USAGE-003' },
    {
      arguments_: ['verify', '--output', 'one', '--output', 'two'],
      code: 'WG-TOKEN-USAGE-004',
    },
    { arguments_: ['verify', '--output'], code: 'WG-TOKEN-USAGE-005' },
    { arguments_: ['verify'], code: 'WG-TOKEN-USAGE-006' },
    {
      arguments_: ['measure', '--source-revision', 'deadbeef'],
      code: 'WG-TOKEN-USAGE-007',
    },
  ])('rejects invalid invocation with $code', ({ arguments_, code }) => {
    expect(() => parseTokenToolingCommand(arguments_)).toThrow(
      expect.objectContaining({ code, exitCode: tokenToolingExitCode.usage }),
    );
  });
});

describe('token-tooling command runner', () => {
  it('prints help without invoking a command handler', async () => {
    const commandHandlers = handlers();
    const commandIo = io();

    await expect(
      runTokenToolingCommand(['generate:exchange', '--help'], commandHandlers, commandIo),
    ).resolves.toBe(tokenToolingExitCode.success);
    expect(commandIo.stdout).toHaveBeenCalledWith(expect.stringContaining('token-tooling check'));
    expect(
      Object.values(commandHandlers).every((handler) => !vi.mocked(handler).mock.calls.length),
    ).toBe(true);
  });

  it('dispatches parsed values to the matching handler', async () => {
    const commandHandlers = handlers();

    await expect(
      runTokenToolingCommand(
        ['generate:exchange', '--source-revision', revision, '--output', 'release'],
        commandHandlers,
        io(),
      ),
    ).resolves.toBe(tokenToolingExitCode.success);
    expect(commandHandlers.generateExchange).toHaveBeenCalledWith({
      name: 'generate:exchange',
      sourceRevision: revision,
      output: 'release',
    });
    expect(commandHandlers.authenticateSourceRevision).toHaveBeenCalledWith(revision);
  });

  it('authenticates measurement before invoking its effect', async () => {
    const commandHandlers = handlers();

    await runTokenToolingCommand(['measure', '--source-revision', revision], commandHandlers, io());

    expect(commandHandlers.authenticateSourceRevision).toHaveBeenCalledWith(revision);
    expect(commandHandlers.measure).toHaveBeenCalledWith({
      name: 'measure',
      sourceRevision: revision,
    });
  });

  it('does not invoke an authenticated effect when source authentication fails', async () => {
    const commandHandlers = handlers();
    vi.mocked(commandHandlers.authenticateSourceRevision).mockRejectedValue(
      new TokenToolingDiagnostic(
        'WG-TOKEN-AUTH-001',
        'The requested source revision does not match the checked-out commit.',
        tokenToolingExitCode.failure,
      ),
    );

    await expect(
      runTokenToolingCommand(
        ['generate:exchange', '--source-revision', revision, '--output', 'release'],
        commandHandlers,
        io(),
      ),
    ).resolves.toBe(tokenToolingExitCode.failure);
    expect(commandHandlers.generateExchange).not.toHaveBeenCalled();
  });

  it('prints stable diagnostics and returns their assigned failure code', async () => {
    const commandIo = io();
    const commandHandlers = handlers();
    vi.mocked(commandHandlers.check).mockRejectedValue(
      new TokenToolingDiagnostic(
        'WG-TOKEN-CHECK-001',
        'Generated web artifacts have drifted.',
        tokenToolingExitCode.failure,
      ),
    );

    await expect(runTokenToolingCommand(['check'], commandHandlers, commandIo)).resolves.toBe(
      tokenToolingExitCode.failure,
    );
    expect(commandIo.stderr).toHaveBeenCalledWith(
      'WG-TOKEN-CHECK-001: Generated web artifacts have drifted.',
    );
  });

  it('does not expose unexpected error content', async () => {
    const commandIo = io();
    const commandHandlers = handlers();
    vi.mocked(commandHandlers.check).mockRejectedValue(
      new Error('secret or arbitrary source content'),
    );

    await expect(runTokenToolingCommand(['check'], commandHandlers, commandIo)).resolves.toBe(
      tokenToolingExitCode.failure,
    );
    expect(commandIo.stderr).toHaveBeenCalledWith(
      'WG-TOKEN-INTERNAL-001: Token tooling failed unexpectedly.',
    );
  });
});
