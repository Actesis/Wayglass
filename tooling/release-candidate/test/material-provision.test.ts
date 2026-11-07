import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { provisionConsumerMaterial } from '../src/material-provision.ts';

describe('explicit consumer dependency provisioning', () => {
  it('prepares only external dependencies without scripts and retains six lockfiles', async () => {
    const root = mkdtempSync(resolve(tmpdir(), 'wayglass-provision-test-'));
    const projects: string[] = [];
    try {
      await provisionConsumerMaterial(
        process.cwd(),
        root,
        resolve(root, 'result'),
        async (request) => {
          projects.push(request.cwd);
          expect(request.arguments).toContain('--ignore-scripts');
          expect(request.arguments).toContain('--offline=false');
          expect(request.arguments).toContain('https://registry.npmjs.org/');
          expect(readFileSync(resolve(request.cwd, 'package.json'), 'utf8')).not.toContain(
            '@wayglass/',
          );
          expect(request.environment?.npm_config_offline).toBe('false');
          writeFileSync(resolve(request.cwd, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
          return { stdout: '', stderr: '' };
        },
        { npm_execpath: process.execPath },
      );
      expect(projects).toHaveLength(6);
      expect(projects.every((path) => !existsSync(path))).toBe(true);
      expect(existsSync(resolve(root, 'result/complete.json'))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects credentials before executing any network preparation', async () => {
    let called = false;
    await expect(
      provisionConsumerMaterial(
        process.cwd(),
        '/absent',
        '/absent',
        async () => {
          called = true;
          return { stdout: '', stderr: '' };
        },
        { NPM_TOKEN: 'not-a-real-token' },
      ),
    ).rejects.toThrow('WG_RC_CREDENTIAL_EXPOSURE');
    expect(called).toBe(false);
  });

  it('cleans temporary projects and retains no completion marker on failure', async () => {
    const root = mkdtempSync(resolve(tmpdir(), 'wayglass-provision-failure-'));
    let project = '';
    try {
      await expect(
        provisionConsumerMaterial(
          process.cwd(),
          root,
          resolve(root, 'result'),
          async (request) => {
            project = request.cwd;
            throw new Error('registry unavailable');
          },
          { npm_execpath: process.execPath },
        ),
      ).rejects.toThrow('registry unavailable');
      expect(project).not.toBe('');
      expect(existsSync(project)).toBe(false);
      expect(existsSync(resolve(root, 'result/complete.json'))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
