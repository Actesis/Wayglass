import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TokenToolingCommandIo } from '../src/command.js';
import { createTokenToolingCommandHandlers } from '../src/handlers.js';

const revision = '0123456789abcdef0123456789abcdef01234567';
const roots: string[] = [];

async function outputRoot(): Promise<string> {
  const parent = await mkdtemp(join(tmpdir(), 'wayglass-handler-'));
  roots.push(parent);
  return join(parent, 'exchange');
}

function io(): TokenToolingCommandIo {
  return { stdout: vi.fn(), stderr: vi.fn() };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe('token-tooling command effects', () => {
  it('generates, replaces, and verifies one explicit private exchange root', async () => {
    const output = await outputRoot();
    const commandIo = io();
    const handlers = createTokenToolingCommandHandlers(commandIo);

    await handlers.generateExchange({ sourceRevision: revision, output });
    await handlers.generateExchange({ sourceRevision: revision, output });
    await handlers.verify({ output });

    expect(commandIo.stdout).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/^WG-TOKEN-GENERATE-EXCHANGE-OK: created release [0-9a-f]{64} at /),
    );
    expect(commandIo.stdout).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/^WG-TOKEN-GENERATE-EXCHANGE-OK: unchanged release [0-9a-f]{64} at /),
    );
    expect(commandIo.stdout).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/^WG-TOKEN-VERIFY-OK: release [0-9a-f]{64} at /),
    );
  });

  it('maps exchange-integrity failures to a stable diagnostic without source content', async () => {
    const commandIo = io();
    const handlers = createTokenToolingCommandHandlers(commandIo);

    await expect(handlers.verify({ output: await outputRoot() })).rejects.toMatchObject({
      code: 'WG-TOKEN-VERIFY-001',
      message: 'Private exchange verification failed; preserve the output for integrity review.',
      exitCode: 1,
    });
  });
});
