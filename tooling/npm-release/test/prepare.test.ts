import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { prepare, verifyInstall } from '../src/cli.ts';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixtureWorkspace(version: string): string {
  const root = mkdtempSync(join(tmpdir(), 'wayglass-npm-release-'));
  roots.push(root);
  const write = (path: string, content: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), content);
  };
  write('packages/icons/dist/index.js', 'export const icon = true;\n');
  write('packages/icons/dist/index.d.ts', 'export declare const icon: boolean;\n');
  write('packages/icons/src/index.ts', 'export const icon = true;\n');
  for (const file of ['README.md', 'LICENSE', 'NOTICE'])
    write(`packages/icons/${file}`, `${file}\n`);
  write(
    'packages/icons/package.json',
    `${JSON.stringify(
      {
        name: '@wayglass/icons',
        version,
        private: true,
        type: 'module',
        files: ['dist', 'README.md', 'LICENSE', 'NOTICE'],
        exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
        scripts: { build: 'tsc' },
        devDependencies: { typescript: '6.0.3' },
      },
      null,
      2,
    )}\n`,
  );
  const git = (...args: string[]) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  git('init', '--quiet');
  git('add', '.');
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'x');
  return root;
}

describe('prepare', () => {
  it('packs public tarballs, records hashes, and restores the workspace manifest', () => {
    const root = fixtureWorkspace('0.1.1');
    const output = join(root, 'out');
    const before = readFileSync(join(root, 'packages/icons/package.json'), 'utf8');

    const plan = prepare(root, 'icons', '0.1.1', output);

    expect(readFileSync(join(root, 'packages/icons/package.json'), 'utf8')).toBe(before);
    expect(plan.tag).toBe('icons-v0.1.1');
    expect(plan.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(plan.packages).toEqual([
      expect.objectContaining({
        name: '@wayglass/icons',
        version: '0.1.1',
        file: 'wayglass-icons-0.1.1.tgz',
      }),
    ]);
    expect(readFileSync(join(output, 'SHA256SUMS'), 'utf8')).toBe(
      `${plan.packages[0]!.sha256}  wayglass-icons-0.1.1.tgz\n`,
    );
    expect(() => verifyInstall(output)).not.toThrow();
  }, 60_000);

  it('refuses a release whose version the manifest does not carry', () => {
    const root = fixtureWorkspace('0.1.0');
    expect(() => prepare(root, 'icons', '0.1.1', join(root, 'out'))).toThrow(/requires 0.1.1/);
  });

  it('detects a tarball changed after planning', () => {
    const root = fixtureWorkspace('0.1.1');
    const output = join(root, 'out');
    prepare(root, 'icons', '0.1.1', output);
    writeFileSync(join(output, 'wayglass-icons-0.1.1.tgz'), 'tampered');
    expect(() => verifyInstall(output)).toThrow(/SHA-256/);
  }, 60_000);
});
