import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { composeSite } from '../src/compose.ts';
import { scanDirectory } from '../src/filesystem.ts';
import { normalizeStorybookManagerBundles } from '../src/normalize-storybook.ts';
import { createSiteRepositoryFixture, type SiteRepositoryFixture } from './system-fixtures.ts';

const fixtures: SiteRepositoryFixture[] = [];
const temporaryParents: string[] = [];

afterEach(() => {
  for (const value of fixtures.splice(0)) value.cleanup();
  for (const path of temporaryParents.splice(0)) rmSync(path, { recursive: true, force: true });
});

describe('Storybook manager normalization', () => {
  it('produces byte-identical complete sites from distinct absolute roots', async () => {
    const first = createSiteRepositoryFixture();
    fixtures.push(first);
    const secondParent = realpathSync(
      mkdtempSync(resolve(tmpdir(), 'wayglass-site-alternate-parent-')),
    );
    temporaryParents.push(secondParent);
    const secondRoot = resolve(secondParent, 'different', 'repository');
    mkdirSync(resolve(secondRoot, '..'), { recursive: true });
    cpSync(first.root, secondRoot, { recursive: true });

    const relativeBundle = 'apps/storybook/storybook-static/sb-addons/a11y-1/manager-bundle.js';
    writeFileSync(
      resolve(secondRoot, relativeBundle),
      'try{var alpha=()=>1;var beta=()=>2;console.log(alpha(),beta())}catch(cause){console.error(cause)}\n',
    );

    const firstResult = normalizeStorybookManagerBundles(first.root);
    const secondResult = normalizeStorybookManagerBundles(secondRoot);
    expect(firstResult.files).toEqual([
      'a11y-1/manager-bundle.js',
      'docs-1/manager-bundle.js',
      'storybook-core-server-presets-0/common-manager-bundle.js',
    ]);
    expect(secondResult.files).toEqual(firstResult.files);
    expect(readFileSync(resolve(first.root, relativeBundle))).toEqual(
      readFileSync(resolve(secondRoot, relativeBundle)),
    );

    const firstOutput = first.output('first-site');
    const secondOutput = resolve(secondParent, 'second-site');
    const firstSite = await composeSite({
      repositoryRoot: first.root,
      output: firstOutput,
      command: first.command,
    });
    const secondSite = await composeSite({
      repositoryRoot: secondRoot,
      output: secondOutput,
      command: first.command,
    });

    expect(secondSite.manifest).toEqual(firstSite.manifest);
    expect(secondSite.manifestSha256).toBe(firstSite.manifestSha256);
    expect(scanDirectory(secondOutput)).toEqual(scanDirectory(firstOutput));
  });

  it('fails closed when Storybook emits no manager addon bundles', () => {
    const value = createSiteRepositoryFixture();
    fixtures.push(value);
    rmSync(resolve(value.root, 'apps/storybook/storybook-static/sb-addons'), {
      recursive: true,
      force: true,
    });
    mkdirSync(resolve(value.root, 'apps/storybook/storybook-static/sb-addons'));

    expect(() => normalizeStorybookManagerBundles(value.root)).toThrow(
      'WG_SITE_STORYBOOK_NORMALIZE',
    );
  });
});
