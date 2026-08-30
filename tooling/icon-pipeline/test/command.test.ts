import { describe, expect, it, vi } from 'vitest';

import {
  iconToolingExitCode,
  IconToolingDiagnostic,
  runIconToolingCommand,
  type IconToolingCommandHandlers,
} from '../src/command.js';

function harness() {
  const handlers: IconToolingCommandHandlers = {
    check: vi.fn(async () => undefined),
    generate: vi.fn(async () => undefined),
    recover: vi.fn(async () => undefined),
  };
  const stdout = vi.fn<(message: string) => void>();
  const stderr = vi.fn<(message: string) => void>();
  return { handlers, io: { stdout, stderr }, stderr, stdout };
}

describe('icon tooling command', () => {
  it('prints help without invoking a handler or enforcing the runtime', async () => {
    const { handlers, io, stdout } = harness();
    await expect(runIconToolingCommand(['--help'], handlers, io, '1.0.0')).resolves.toBe(0);
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('pnpm icon-tooling:check'));
    expect(handlers.check).not.toHaveBeenCalled();
    expect(handlers.generate).not.toHaveBeenCalled();
    expect(handlers.recover).not.toHaveBeenCalled();
  });

  it.each([
    [[], 'Provide exactly one command'],
    [['check', '--extra'], 'Provide exactly one command'],
    [['unknown'], 'Unknown command'],
  ] as const)('rejects invalid invocation %j with exit 2', async (args, message) => {
    const { handlers, io, stderr } = harness();
    await expect(runIconToolingCommand(args, handlers, io)).resolves.toBe(
      iconToolingExitCode.invocation,
    );
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  it('rejects an unsupported Node runtime with exit 2', async () => {
    const { handlers, io, stderr } = harness();
    await expect(runIconToolingCommand(['check'], handlers, io, '22.12.0')).resolves.toBe(2);
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining('WG_ICON_COMMAND_ENVIRONMENT'));
    expect(handlers.check).not.toHaveBeenCalled();
  });

  it.each(['check', 'generate', 'recover'] as const)('dispatches %s', async (command) => {
    const { handlers, io } = harness();
    await expect(runIconToolingCommand([command], handlers, io, '22.13.0')).resolves.toBe(0);
    expect(handlers[command]).toHaveBeenCalledOnce();
  });

  it('preserves classified failure codes and exit 1', async () => {
    const { handlers, io, stderr } = harness();
    vi.mocked(handlers.check).mockRejectedValue(
      new IconToolingDiagnostic('WG_ICON_CHECK_FAILED', 'drift found', 1),
    );
    await expect(runIconToolingCommand(['check'], handlers, io)).resolves.toBe(1);
    expect(stderr).toHaveBeenCalledWith('WG_ICON_CHECK_FAILED: drift found');
  });
});
