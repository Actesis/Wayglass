import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  checkRepositoryIconArtifacts,
  createRepositoryIconArtifacts,
  generateRepositoryIconArtifacts,
} from '../src/repository.js';

const roots: string[] = [];

async function root(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'wayglass-icon-repository-'));
  roots.push(path);
  await writeFile(join(path, 'package.json'), '{}\n', 'utf8');
  const packageDirectory = join(path, 'packages/icons');
  await mkdir(packageDirectory, { recursive: true });
  await writeFile(join(packageDirectory, 'package.json'), '{"version":"0.0.0"}\n', 'utf8');
  return path;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe('fixed repository adapter', () => {
  it('links generation to the icon package version', async () => {
    const destination = await root();
    const artifacts = await createRepositoryIconArtifacts(destination);
    expect(artifacts['tooling/icon-pipeline/generated/source-manifest.json']).toContain(
      '"iconPackageVersion": "0.0.0"',
    );
  });

  it('keeps check write-free when outputs are missing', async () => {
    const destination = await root();
    const before = (await readdir(destination)).sort();
    await expect(checkRepositoryIconArtifacts(destination)).rejects.toThrow(/WG_ICON_CHECK_DRIFT/);
    expect((await readdir(destination)).sort()).toEqual(before);
  });

  it('generates then verifies only the fixed repository outputs', async () => {
    const destination = await root();
    await expect(generateRepositoryIconArtifacts(destination)).resolves.toMatchObject({
      created: expect.arrayContaining([
        'packages/icons/src/generated/catalog.ts',
        'tooling/icon-pipeline/generated/output-manifest.json',
      ]),
    });
    await expect(checkRepositoryIconArtifacts(destination)).resolves.toEqual({
      artifacts: 4,
      icons: 4,
    });
    expect(await readFile(join(destination, 'package.json'), 'utf8')).toBe('{}\n');
  });
});
