import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

import { fail } from './error.ts';

function isWithin(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path !== '' && !path.startsWith('..') && !isAbsolute(path);
}

export function validateNewSiteOutputPath(output: string, repositoryRoot: string): string {
  if (!isAbsolute(output)) fail('WG_SITE_OUTPUT_ABSOLUTE', 'Output must be an absolute path.');
  const normalized = resolve(output);
  if (existsSync(normalized)) fail('WG_SITE_OUTPUT_EXISTS', 'Output already exists.');

  const parent = dirname(normalized);
  if (!existsSync(parent)) fail('WG_SITE_OUTPUT_PARENT', 'Output parent must already exist.');
  const parentStatus = lstatSync(parent);
  if (!parentStatus.isDirectory() || parentStatus.isSymbolicLink()) {
    fail('WG_SITE_OUTPUT_PARENT', 'Output parent must be a real directory.');
  }

  const temporaryRoot = realpathSync(tmpdir());
  const resolvedParent = realpathSync(parent);
  const resolvedOutput = resolve(resolvedParent, relative(parent, normalized));
  if (!isWithin(temporaryRoot, resolvedOutput)) {
    fail('WG_SITE_OUTPUT_TEMP', 'Output must be a new descendant of the temporary directory.');
  }

  const repository = realpathSync(repositoryRoot);
  if (resolvedOutput === repository || isWithin(repository, resolvedOutput)) {
    fail('WG_SITE_OUTPUT_REPOSITORY', 'Output must remain outside the repository.');
  }
  return resolvedOutput;
}
