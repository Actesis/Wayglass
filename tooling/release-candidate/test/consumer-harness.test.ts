import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { withConsumerProject } from '../src/consumer-harness.ts';
import { consumerScenarios } from '../src/consumer.ts';
import { candidateDirectories, frozenSource } from '../src/constants.ts';
import { serializeEvidence } from '../src/evidence.ts';
import { sha256 } from '../src/hash.ts';
import type { CandidateEvidence, CommandRequest, CommandRunner } from '../src/types.ts';

const temporary: string[] = [];

function temp(prefix: string): string {
  const path = mkdtempSync(resolve(tmpdir(), prefix));
  temporary.push(path);
  return path;
}

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function evidenceFixture(): { readonly path: string; readonly store: string } {
  const root = temp('wayglass-rc-consumer-evidence-');
  const packages = resolve(root, 'packages');
  const store = resolve(root, 'store');
  mkdirSync(packages);
  mkdirSync(store);
  const candidates = candidateDirectories.map((directory) => {
    const file = `wayglass-${directory}-0.1.0.tgz`;
    const bytes = Buffer.from(`tarball:${directory}`);
    writeFileSync(resolve(packages, file), bytes);
    return {
      directory,
      name: `@wayglass/${directory}`,
      version: '0.1.0' as const,
      file,
      bytes: bytes.byteLength,
      sha256: sha256(bytes),
      manifestSha256: 'a'.repeat(64),
      inventorySha256: 'b'.repeat(64),
      unpackedBytes: 1,
      files: [],
    };
  });
  const evidence: CandidateEvidence = {
    schemaVersion: 1,
    source: frozenSource,
    tooling: { commit: 'c'.repeat(40), tree: 'd'.repeat(40) },
    environment: {
      platform: 'test',
      architecture: 'test',
      node: 'v22.13.0',
      pnpm: '11.9.0',
      npm: '11.0.0',
    },
    reproducibility: { runs: 2, byteIdentical: true },
    packages: candidates,
  };
  const path = resolve(root, 'evidence.json');
  writeFileSync(path, serializeEvidence(evidence));
  return { path, store };
}

describe('release-candidate consumer harness', () => {
  it('materializes, locks, installs, exposes the isolated context, and cleans up', async () => {
    const fixture = evidenceFixture();
    const requests: CommandRequest[] = [];
    const runner: CommandRunner = async (request) => {
      requests.push(request);
      return { stdout: '', stderr: '' };
    };
    let project = '';
    const result = await withConsumerProject(
      {
        evidencePath: fixture.path,
        storePath: fixture.store,
        template: {
          scenario: consumerScenarios()[0]!,
          files: [{ path: 'src/index.ts', contents: 'export {};\n' }],
        },
        runner,
        environment: { PATH: process.env.PATH },
      },
      async (context) => {
        project = context.root;
        expect(existsSync(resolve(project, 'package.json'))).toBe(true);
        expect(existsSync(resolve(project, 'vendor/wayglass-icons-0.1.0.tgz'))).toBe(true);
        expect(existsSync(resolve(project, 'vendor/wayglass-react-0.1.0.tgz'))).toBe(false);
        expect(readFileSync(resolve(project, 'pnpm-workspace.yaml'), 'utf8')).toContain(
          '"@wayglass/themes": "file:./vendor/wayglass-themes-0.1.0.tgz"',
        );
        expect(context.environment).toMatchObject({
          PNPM_CONFIG_OFFLINE: 'true',
          npm_config_ignore_scripts: 'true',
        });
        return 'probe-result';
      },
    );
    expect(result).toBe('probe-result');
    expect(existsSync(project)).toBe(false);
    expect(requests.map(({ arguments: arguments_ }) => arguments_)).toEqual([
      expect.arrayContaining([
        'install',
        '--lockfile-only',
        '--no-frozen-lockfile',
        '--offline',
        '--ignore-scripts',
      ]),
      expect.arrayContaining(['install', '--frozen-lockfile', '--offline', '--ignore-scripts']),
    ]);
    expect(
      requests.every(({ environment }) => environment?.npm_config_userconfig?.startsWith(project)),
    ).toBe(true);
  });

  it('cleans the owned project after install and probe failures', async () => {
    const fixture = evidenceFixture();
    let failedInstallRoot = '';
    const failingRunner: CommandRunner = async (request) => {
      failedInstallRoot = request.cwd;
      throw new Error('offline material unavailable');
    };
    const request = {
      evidencePath: fixture.path,
      storePath: fixture.store,
      template: {
        scenario: consumerScenarios()[0]!,
        files: [{ path: 'src/index.ts', contents: 'export {};\n' }],
      },
      environment: { PATH: process.env.PATH },
    } as const;
    await expect(
      withConsumerProject({ ...request, runner: failingRunner }, async () => undefined),
    ).rejects.toThrow(/WG_RC_CONSUMER_OFFLINE_MATERIAL.*offline material unavailable/);
    expect(existsSync(failedInstallRoot)).toBe(false);

    let failedProbeRoot = '';
    const runner: CommandRunner = async () => ({ stdout: '', stderr: '' });
    await expect(
      withConsumerProject({ ...request, runner }, async ({ root }) => {
        failedProbeRoot = root;
        throw new Error('probe failed');
      }),
    ).rejects.toThrow('probe failed');
    expect(existsSync(failedProbeRoot)).toBe(false);
  });

  it('rejects credentials and unsafe evidence or store paths before installation', async () => {
    const fixture = evidenceFixture();
    const runner: CommandRunner = async () => ({ stdout: '', stderr: '' });
    const template = {
      scenario: consumerScenarios()[0]!,
      files: [{ path: 'src/index.ts', contents: 'export {};\n' }],
    } as const;
    await expect(
      withConsumerProject(
        {
          evidencePath: fixture.path,
          storePath: fixture.store,
          template,
          runner,
          environment: { NPM_TOKEN: 'secret' },
        },
        async () => undefined,
      ),
    ).rejects.toThrow(/WG_RC_CREDENTIAL_EXPOSURE/);
    await expect(
      withConsumerProject(
        {
          evidencePath: fixture.path,
          storePath: 'relative',
          template,
          runner,
          environment: {},
        },
        async () => undefined,
      ),
    ).rejects.toThrow(/WG_RC_CONSUMER_STORE/);
  });
});
