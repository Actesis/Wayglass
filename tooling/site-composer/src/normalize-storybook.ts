import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { minifySync } from 'rolldown/utils';

import { fail } from './error.ts';
import { assertRealDirectoryPath, normalizeMode, scanDirectory } from './filesystem.ts';

const managerBundlePattern = /^[^/]+\/manager-bundle\.js$/;
const normalizedTemporaryName = '.manager-bundle.js.wayglass-normalized';

export interface StorybookManagerNormalizationResult {
  readonly files: readonly string[];
}

/**
 * Storybook 10 creates manager entry wrappers containing absolute package paths. Esbuild's
 * collision-avoidance names can therefore vary when an otherwise identical checkout moves. A
 * second whole-file Oxc pass removes those path-derived local names before site inventory.
 */
export function normalizeStorybookManagerBundles(
  repositoryRoot: string,
): StorybookManagerNormalizationResult {
  const storybookRoot = assertRealDirectoryPath(
    repositoryRoot,
    resolve(repositoryRoot, 'apps/storybook/storybook-static'),
  );
  const addonsRoot = assertRealDirectoryPath(storybookRoot, resolve(storybookRoot, 'sb-addons'));
  const files = scanDirectory(addonsRoot)
    .filter((entry) => entry.kind === 'file' && managerBundlePattern.test(entry.path))
    .map((entry) => entry.path)
    .sort();
  if (files.length === 0) {
    fail('WG_SITE_STORYBOOK_NORMALIZE', 'Storybook emitted no manager addon bundles to normalize.');
  }

  for (const path of files) {
    const absolute = resolve(addonsRoot, path);
    const temporary = resolve(absolute, '..', normalizedTemporaryName);
    if (existsSync(temporary)) {
      fail('WG_SITE_STORYBOOK_NORMALIZE', 'A stale Storybook normalization file exists.');
    }
    try {
      const source = readFileSync(absolute, 'utf8');
      const normalized = minifySync('storybook-manager-bundle.js', source, {
        compress: true,
        mangle: true,
      });
      if (normalized.errors.length > 0) {
        fail('WG_SITE_STORYBOOK_NORMALIZE', 'Storybook manager normalization was not clean.');
      }
      writeFileSync(temporary, normalized.code, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
      normalizeMode(temporary, 'file');
      renameSync(temporary, absolute);
      normalizeMode(absolute, 'file');
    } finally {
      if (existsSync(temporary)) rmSync(temporary, { force: true });
    }
  }

  return { files };
}
