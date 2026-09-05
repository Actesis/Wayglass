import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { fail } from './error.ts';

function isWithin(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path !== '' && !path.startsWith('..') && !isAbsolute(path);
}

function closestExistingParent(path: string): string {
  let cursor = dirname(path);
  while (!existsSync(cursor)) {
    const next = dirname(cursor);
    if (next === cursor) fail('WG_RC_OUTPUT_PARENT', `No existing parent for ${path}.`);
    cursor = next;
  }
  if (!lstatSync(cursor).isDirectory())
    fail('WG_RC_OUTPUT_PARENT', `${cursor} is not a directory.`);
  return cursor;
}

export function validateNewOutputPath(output: string, repositoryRoot: string): string {
  if (!isAbsolute(output)) fail('WG_RC_OUTPUT_ABSOLUTE', 'Output must be an absolute path.');
  const normalized = resolve(output);
  if (existsSync(normalized)) fail('WG_RC_OUTPUT_EXISTS', `Output already exists: ${normalized}.`);
  const temporaryRoot = realpathSync(tmpdir());
  const parent = closestExistingParent(normalized);
  const resolvedParent = realpathSync(parent);
  const resolvedOutput = resolve(resolvedParent, relative(parent, normalized));
  if (!isWithin(temporaryRoot, resolvedOutput)) {
    fail('WG_RC_OUTPUT_TEMP', `Output must be a new child of ${temporaryRoot}.`);
  }
  const repository = realpathSync(repositoryRoot);
  if (resolvedOutput === repository || isWithin(repository, resolvedOutput)) {
    fail('WG_RC_OUTPUT_REPOSITORY', 'Output must remain outside the repository.');
  }
  return resolvedOutput;
}
