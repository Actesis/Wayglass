import { isDeepStrictEqual } from 'node:util';

import { fail, type Manifest } from './manifest.ts';

const requiredFiles = ['package.json', 'README.md', 'LICENSE', 'NOTICE'] as const;

function exportTargets(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(exportTargets);
}

/**
 * Verifies one packed tarball against the manifest it must contain. `entries` are the archive's
 * paths as `tar -tzf` lists them.
 */
export function verifyTarball(
  entries: readonly string[],
  packedManifest: unknown,
  expectedManifest: Manifest,
): void {
  const name = expectedManifest.name;
  if (!isDeepStrictEqual(packedManifest, expectedManifest))
    fail('WG_RELEASE_PACKED_MANIFEST', `${name}: the packed package.json differs from the plan.`);

  const files = new Set<string>();
  for (const entry of entries) {
    if (entry.endsWith('/')) continue;
    if (!entry.startsWith('package/') || entry.includes('..'))
      fail('WG_RELEASE_ENTRY', `${name}: unexpected archive path ${entry}.`);
    files.add(entry.slice('package/'.length));
  }

  const allowed = (expectedManifest.files as string[]).map((file) => file.replace(/\/$/, ''));
  for (const file of files) {
    const permitted =
      file === 'package.json' ||
      allowed.some((root) => file === root || file.startsWith(`${root}/`));
    if (!permitted) fail('WG_RELEASE_ENTRY', `${name}: ${file} is outside the published files.`);
  }

  for (const file of requiredFiles)
    if (!files.has(file)) fail('WG_RELEASE_MISSING', `${name}: ${file} is missing.`);

  for (const target of exportTargets(expectedManifest.exports)) {
    const file = target.replace(/^\.\//, '');
    if (!files.has(file)) fail('WG_RELEASE_EXPORT', `${name}: export target ${target} is missing.`);
  }
}

export { exportTargets };
