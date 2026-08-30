import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url));

function run(...args: string[]) {
  return spawnSync(process.execPath, ['--experimental-strip-types', cli, ...args], {
    cwd: tmpdir(),
    encoding: 'utf8',
  });
}

describe('Node strip-only CLI entry', () => {
  it('runs help from outside the repository without loading effect modules', () => {
    const result = run('--help');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Wayglass private icon tooling');
    expect(result.stderr).toBe('');
  });

  it('loads the fixed repository handler from outside the repository', () => {
    const result = run('check');
    expect([0, 1]).toContain(result.status);
    expect(`${result.stdout}${result.stderr}`).toMatch(/WG_ICON_(?:CHECK_OK|CHECK_FAILED):/);
    expect(`${result.stdout}${result.stderr}`).not.toMatch(
      /ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX|ERR_MODULE_NOT_FOUND/,
    );
  });
});
