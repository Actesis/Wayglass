import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { preflightConsumerMaterial } from '../src/material-preflight.ts';
import type { CommandRequest, CommandRunner } from '../src/types.ts';

const temporary: string[] = [];

function store(): string {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-preflight-store-'));
  temporary.push(root);
  return root;
}

afterEach(() => {
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('release-candidate consumer material preflight', () => {
  it('resolves and installs all six exact scenarios offline before cleaning its root', async () => {
    const requests: CommandRequest[] = [];
    const roots = new Set<string>();
    const runner: CommandRunner = async (request) => {
      requests.push(request);
      roots.add(dirname(request.cwd));
      const manifest = readFileSync(resolve(request.cwd, 'package.json'), 'utf8');
      expect(manifest).not.toContain('@wayglass/');
      expect(request.arguments).toContain('--offline');
      expect(request.arguments).toContain('--ignore-scripts');
      return { stdout: '', stderr: '' };
    };
    await preflightConsumerMaterial(store(), runner, { PNPM_CONFIG_OFFLINE: 'true' });
    expect(requests).toHaveLength(12);
    expect(
      requests.filter(({ arguments: arguments_ }) => arguments_.includes('--lockfile-only')),
    ).toHaveLength(6);
    expect([...roots].every((root) => !existsSync(root))).toBe(true);
  });

  it('reports the exact missing scenario and cleans up after failure', async () => {
    const roots = new Set<string>();
    const runner: CommandRunner = async (request) => {
      roots.add(dirname(request.cwd));
      if (request.cwd.endsWith('react-19.0.0-ts-5.9.3')) throw new Error('not in store');
      return { stdout: '', stderr: '' };
    };
    await expect(
      preflightConsumerMaterial(store(), runner, { PNPM_CONFIG_OFFLINE: 'true' }),
    ).rejects.toThrow(/WG_RC_CONSUMER_OFFLINE_MATERIAL.*react-19\.0\.0-ts-5\.9\.3/);
    expect([...roots].every((root) => !existsSync(root))).toBe(true);
  });
});
