import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { assemblyPassEnvironment, checkCandidateSource } from '../src/assembler.ts';
import { frozenSource } from '../src/constants.ts';
import {
  assertNoReleaseCredentials,
  assertSupportedNode,
  offlineEnvironment,
} from '../src/environment.ts';
import { stagePackage } from '../src/filesystem.ts';
import { projectPackageManifest } from '../src/manifest.ts';
import { packAndInspect } from '../src/packing.ts';
import { validateNewOutputPath } from '../src/path-safety.ts';
import { runCommand } from '../src/process.ts';
import { repositoryRoot, sourceManifest } from './fixtures.ts';

const temporary: string[] = [];

function temp(prefix: string): string {
  const path = mkdtempSync(resolve(tmpdir(), prefix));
  temporary.push(path);
  return path;
}

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

describe('release-candidate effect boundary', () => {
  it('rejects release credentials without confusing unrelated GitHub and system variables', () => {
    expect(() =>
      assertNoReleaseCredentials({ GH_PAGER: 'cat', __CF_USER_TEXT_ENCODING: 'x' }),
    ).not.toThrow();
    expect(() => assertNoReleaseCredentials({ NODE_AUTH_TOKEN: 'secret' })).toThrowError(
      /WG_RC_CREDENTIAL_EXPOSURE/,
    );
    expect(() => assertNoReleaseCredentials({ CLOUDFLARE_API_TOKEN: 'secret' })).toThrowError(
      /WG_RC_CREDENTIAL_EXPOSURE/,
    );
  });

  it('constructs explicit offline and no-script process controls', () => {
    expect(offlineEnvironment({ PATH: '/bin' })).toMatchObject({
      PATH: '/bin',
      PNPM_CONFIG_OFFLINE: 'true',
      npm_config_ignore_scripts: 'true',
      npm_config_offline: 'true',
      TURBO_FORCE: 'true',
    });
  });

  it('pins the dedicated store for top-level and nested assembly commands', () => {
    expect(
      assemblyPassEnvironment(
        { PNPM_CONFIG_OFFLINE: 'true' },
        '/tmp/wayglass-store',
        '/tmp/wayglass-npmrc',
      ),
    ).toEqual({
      PNPM_CONFIG_OFFLINE: 'true',
      npm_config_store_dir: '/tmp/wayglass-store',
      npm_config_userconfig: '/tmp/wayglass-npmrc',
    });
  });

  it('accepts only the frozen package Node engine range', () => {
    expect(() => assertSupportedNode('v22.13.0')).not.toThrow();
    expect(() => assertSupportedNode('26.9.1')).not.toThrow();
    expect(() => assertSupportedNode('v22.12.0')).toThrowError(/WG_RC_UNSUPPORTED_NODE/);
    expect(() => assertSupportedNode('v27.0.0')).toThrowError(/WG_RC_UNSUPPORTED_NODE/);
  });

  it('accepts only a nonexistent absolute output below the operating-system temp root', () => {
    const parent = temp('wayglass-rc-output-parent-');
    const output = resolve(parent, 'candidate');
    expect(validateNewOutputPath(output, repositoryRoot)).toBe(
      resolve(realpathSync(parent), 'candidate'),
    );
    mkdirSync(output);
    expect(() => validateNewOutputPath(output, repositoryRoot)).toThrowError(/WG_RC_OUTPUT_EXISTS/);
    expect(() => validateNewOutputPath('relative', repositoryRoot)).toThrowError(
      /WG_RC_OUTPUT_ABSOLUTE/,
    );
    expect(() =>
      validateNewOutputPath(resolve(repositoryRoot, 'candidate'), repositoryRoot),
    ).toThrowError(/WG_RC_OUTPUT_TEMP/);
  });

  it('executes argv without a shell', async () => {
    const marker = '$(printf unsafe)';
    const result = await runCommand({
      command: process.execPath,
      arguments: ['-e', 'console.log(process.argv[1])', marker],
      cwd: repositoryRoot,
      environment: { PATH: process.env.PATH ?? '' },
    });
    expect(result.stdout.trim()).toBe(marker);
  });

  it('authenticates and projects the exact frozen Git source without writing', async () => {
    await expect(
      checkCandidateSource(repositoryRoot, frozenSource.commit, runCommand),
    ).resolves.toBeUndefined();
    await expect(
      checkCandidateSource(repositoryRoot, '0'.repeat(40), runCommand),
    ).rejects.toThrowError(/WG_RC_SOURCE_COMMIT/);
  });

  it('stages, locally packs, unpacks, and re-inspects a private package', async () => {
    const root = temp('wayglass-rc-pack-');
    const staged = resolve(root, 'staged');
    const tarballs = resolve(root, 'tarballs');
    const manifest = projectPackageManifest('core', sourceManifest('core'));
    const inspection = stagePackage(resolve(repositoryRoot, 'packages/core'), staged, manifest);
    const packed = await packAndInspect(
      'core',
      staged,
      tarballs,
      manifest,
      inspection,
      runCommand,
      offlineEnvironment({ PATH: process.env.PATH ?? '' }),
    );
    expect(packed).toMatchObject({
      name: '@wayglass/core',
      version: '0.1.0',
      inventorySha256: inspection.inventorySha256,
    });
    expect(packed.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(existsSync(resolve(tarballs, packed.file))).toBe(true);
    expect(readFileSync(resolve(staged, 'package.json'), 'utf8')).toContain('"private": true');
  });
});
