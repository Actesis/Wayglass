import {
  chmodSync,
  linkSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { composeSite } from '../src/compose.ts';
import { assertSiteArtifactsEqual, verifySite } from '../src/verify.ts';
import { createSiteRepositoryFixture, type SiteRepositoryFixture } from './system-fixtures.ts';

const fixtures: SiteRepositoryFixture[] = [];

function fixture(): SiteRepositoryFixture {
  const value = createSiteRepositoryFixture();
  fixtures.push(value);
  return value;
}

async function artifact(value: SiteRepositoryFixture, name = 'site'): Promise<string> {
  const output = value.output(name);
  await composeSite({ repositoryRoot: value.root, output, command: value.command });
  return output;
}

afterEach(() => {
  for (const value of fixtures.splice(0)) value.cleanup();
});

describe('independent site verification', () => {
  it('accepts a complete artifact without changing its manifest', async () => {
    const value = fixture();
    const output = await artifact(value);
    const before = readFileSync(resolve(output, 'wayglass-site-manifest.json'));
    const result = verifySite(output);

    expect(result.input).toBe(output);
    expect(result.manifest.files).toHaveLength(6);
    expect(readFileSync(resolve(output, 'wayglass-site-manifest.json'))).toEqual(before);
  });

  it.each([
    ['added', (output: string) => writeFileSync(resolve(output, 'added.html'), 'added\n')],
    ['removed', (output: string) => rmSync(resolve(output, 'index.html'))],
    [
      'moved',
      (output: string) => renameSync(resolve(output, 'index.html'), resolve(output, 'moved.html')),
    ],
    ['truncated', (output: string) => writeFileSync(resolve(output, 'index.html'), '')],
    ['changed', (output: string) => writeFileSync(resolve(output, 'index.html'), 'changed\n')],
    ['extra-directory', (output: string) => mkdirSync(resolve(output, 'extra'))],
    ['bad-file-mode', (output: string) => chmodSync(resolve(output, 'index.html'), 0o600)],
    ['bad-directory-mode', (output: string) => chmodSync(resolve(output, 'storybook'), 0o700)],
    ['bad-root-mode', (output: string) => chmodSync(output, 0o700)],
  ])('rejects a %s artifact mutation', async (_name, mutate) => {
    const value = fixture();
    const output = await artifact(value);
    mutate(output);
    expect(() => verifySite(output)).toThrow(/WG_SITE_VERIFY_/);
  });

  it('rejects a symlink substituted at an admitted path', async () => {
    const value = fixture();
    const output = await artifact(value);
    rmSync(resolve(output, 'storybook/iframe.html'));
    symlinkSync('index.html', resolve(output, 'storybook/iframe.html'));
    expect(() => verifySite(output)).toThrow(/WG_SITE_VERIFY_/);
  });

  it('rejects a hard link substituted at an admitted path', async () => {
    const value = fixture();
    const output = await artifact(value);
    rmSync(resolve(output, 'storybook/iframe.html'));
    linkSync(resolve(output, 'storybook/index.html'), resolve(output, 'storybook/iframe.html'));
    expect(() => verifySite(output)).toThrow('WG_SITE_VERIFY_ENTRY');
  });

  it('rejects malformed, noncanonical, and missing manifests', async () => {
    for (const [name, replacement] of [
      ['malformed', '{'],
      ['noncanonical', '{}\n'],
      ['missing', undefined],
    ] as const) {
      const value = fixture();
      const output = await artifact(value, name);
      const manifest = resolve(output, 'wayglass-site-manifest.json');
      if (replacement === undefined) rmSync(manifest);
      else writeFileSync(manifest, replacement);
      expect(() => verifySite(output)).toThrow(/WG_SITE_(?:VERIFY_)?MANIFEST/);
    }
  });
});

describe('complete-byte artifact comparison', () => {
  it('accepts two identical independently verified compositions', async () => {
    const value = fixture();
    const first = await artifact(value, 'first');
    const second = await artifact(value, 'second');
    expect(assertSiteArtifactsEqual(first, second)).toBe(verifySite(first).manifest.bundleSha256);
  });

  it('rejects independently valid artifacts with different producer bytes', async () => {
    const firstFixture = fixture();
    const first = await artifact(firstFixture, 'first');
    const secondFixture = fixture();
    writeFileSync(
      resolve(secondFixture.root, 'apps/docs/.vitepress/dist/index.html'),
      '<h1>Different</h1>\n',
    );
    const second = await artifact(secondFixture, 'second');
    expect(() => assertSiteArtifactsEqual(first, second)).toThrow('WG_SITE_BUILD_DIFFERENCE');
  });
});
