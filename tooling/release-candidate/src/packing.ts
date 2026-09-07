import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { fail } from './error.ts';
import { readPackageFiles } from './filesystem.ts';
import { sha256 } from './hash.ts';
import { inspectPackageFiles } from './inspection.ts';
import type {
  CandidateDirectory,
  CommandRunner,
  PackageInspection,
  PackedCandidate,
  PackageFile,
  ProjectedManifest,
} from './types.ts';

interface NpmPackResult {
  readonly filename?: unknown;
  readonly size?: unknown;
}

export async function packAndInspect(
  directory: CandidateDirectory,
  stagedPackage: string,
  tarballDirectory: string,
  manifest: ProjectedManifest,
  stagedInspection: PackageInspection,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
  observeFiles?: (files: readonly PackageFile[]) => void,
): Promise<PackedCandidate> {
  mkdirSync(tarballDirectory, { recursive: true });
  const userConfig = resolve(tarballDirectory, `.empty-npmrc-${directory}`);
  writeFileSync(userConfig, '', { encoding: 'utf8', flag: 'wx' });
  const { stdout } = await runner({
    command: 'npm',
    arguments: [
      'pack',
      '--offline',
      '--ignore-scripts',
      '--json',
      '--pack-destination',
      tarballDirectory,
    ],
    cwd: stagedPackage,
    environment: {
      ...environment,
      npm_config_cache: resolve(tarballDirectory, '.npm-cache'),
      npm_config_userconfig: userConfig,
    },
  });
  let result: NpmPackResult[];
  try {
    result = JSON.parse(stdout) as NpmPackResult[];
  } catch {
    return fail('WG_RC_PACK_OUTPUT', 'npm pack did not return JSON.');
  }
  const filename = result.length === 1 ? result[0]?.filename : undefined;
  if (
    typeof filename !== 'string' ||
    basename(filename) !== filename ||
    !filename.endsWith('.tgz')
  ) {
    fail('WG_RC_PACK_OUTPUT', 'npm pack returned an unsafe tarball filename.');
  }
  const tarball = resolve(tarballDirectory, filename);
  const bytes = readFileSync(tarball);
  const extraction = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-extract-'));
  try {
    await runner({
      command: 'tar',
      arguments: ['-xzf', tarball, '-C', extraction],
      cwd: extraction,
      environment,
    });
    const files = readPackageFiles(resolve(extraction, 'package'));
    const inspected = inspectPackageFiles(files, manifest);
    if (inspected.inventorySha256 !== stagedInspection.inventorySha256) {
      fail('WG_RC_PACK_INVENTORY', `${manifest.name} changed while packing.`);
    }
    observeFiles?.(files);
    return Object.freeze({
      directory,
      name: manifest.name,
      version: '0.1.0',
      file: filename,
      bytes: bytes.byteLength,
      sha256: sha256(bytes),
      manifestSha256: inspected.files.find(({ path }) => path === 'package.json')!.sha256,
      inventorySha256: inspected.inventorySha256,
      unpackedBytes: inspected.totalBytes,
      files: inspected.files,
    });
  } finally {
    rmSync(extraction, { recursive: true, force: true });
  }
}
