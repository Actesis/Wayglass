import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { assertAdmittedPath, assertNoCredentialContent, destinationPath } from './admission.ts';
import { SITE_MANIFEST_PATH } from './constants.ts';
import { fail } from './error.ts';
import { scanDirectory } from './filesystem.ts';
import { sha256 } from './hash.ts';
import type { InventoryEntry, SiteManifest, VerifiedSiteResult } from './types.ts';
import { parseIndependentlyVerifiedManifest } from './verify-manifest.ts';

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function equalBytes(left: Uint8Array | undefined, right: Uint8Array | undefined): boolean {
  if (left === undefined || right === undefined) return left === right;
  return left.byteLength === right.byteLength && left.every((byte, index) => byte === right[index]);
}

function decodeManifest(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    fail('WG_SITE_VERIFY_MANIFEST', 'Site manifest must be valid UTF-8.');
  }
}

function expectedDirectoryPaths(manifest: SiteManifest): readonly string[] {
  const paths = new Set<string>();
  for (const file of manifest.files) {
    const segments = file.path.split('/');
    for (let index = 1; index < segments.length; index += 1) {
      paths.add(segments.slice(0, index).join('/'));
    }
  }
  return [...paths].sort(compareText);
}

function assertExactPaths(entries: readonly InventoryEntry[], manifest: SiteManifest): void {
  const actualFiles = entries
    .filter((entry) => entry.kind === 'file')
    .map((entry) => entry.path)
    .sort(compareText);
  const expectedFiles = [...manifest.files.map((file) => file.path), SITE_MANIFEST_PATH].sort(
    compareText,
  );
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    fail('WG_SITE_VERIFY_PATHS', 'Artifact files differ from the exact manifest inventory.');
  }
  const actualDirectories = entries
    .filter((entry) => entry.kind === 'directory')
    .map((entry) => entry.path)
    .sort(compareText);
  if (JSON.stringify(actualDirectories) !== JSON.stringify(expectedDirectoryPaths(manifest))) {
    fail('WG_SITE_VERIFY_PATHS', 'Artifact directories differ from the manifest projection.');
  }
}

function sourceRelativePath(surface: 'documentation' | 'storybook', path: string): string {
  if (surface === 'documentation') return path;
  if (!path.startsWith('storybook/')) {
    fail('WG_SITE_VERIFY_ATTRIBUTION', 'Storybook file lacks its destination prefix.');
  }
  return path.slice('storybook/'.length);
}

function verifyEntries(
  entries: readonly InventoryEntry[],
  manifest: SiteManifest,
  serializedManifest: string,
): void {
  assertExactPaths(entries, manifest);
  const records = new Map(manifest.files.map((file) => [file.path, file]));
  for (const entry of entries) {
    if (entry.kind === 'directory') {
      if (entry.mode !== 0o755) fail('WG_SITE_VERIFY_MODE', 'Artifact directory mode is not 0755.');
      continue;
    }
    if (entry.kind !== 'file' || entry.bytes === undefined || entry.links !== 1) {
      fail('WG_SITE_VERIFY_ENTRY', 'Artifact contains a non-regular or linked entry.');
    }
    if (entry.mode !== 0o644) fail('WG_SITE_VERIFY_MODE', 'Artifact file mode is not 0644.');
    if (entry.path === SITE_MANIFEST_PATH) {
      if (decodeManifest(entry.bytes) !== serializedManifest) {
        fail('WG_SITE_VERIFY_MANIFEST', 'Manifest bytes changed during verification.');
      }
      continue;
    }
    const record = records.get(entry.path);
    if (
      record === undefined ||
      entry.bytes.byteLength !== record.bytes ||
      sha256(entry.bytes) !== record.sha256
    ) {
      fail('WG_SITE_VERIFY_FILE', `Artifact file "${entry.path}" differs from its identity.`);
    }
    const relativePath = sourceRelativePath(record.surface, entry.path);
    assertAdmittedPath(record.surface, relativePath);
    if (destinationPath(record.surface, relativePath) !== entry.path) {
      fail('WG_SITE_VERIFY_ATTRIBUTION', `Artifact file "${entry.path}" is misattributed.`);
    }
    assertNoCredentialContent(entry.path, entry.bytes);
  }
}

export function verifySite(input: string): VerifiedSiteResult {
  if (!isAbsolute(input) || !existsSync(input)) {
    fail('WG_SITE_VERIFY_INPUT', 'Verification input must be an existing absolute directory.');
  }
  const status = lstatSync(input);
  if (!status.isDirectory() || status.isSymbolicLink()) {
    fail('WG_SITE_VERIFY_INPUT', 'Verification input must be a real directory.');
  }
  const root = realpathSync(input);
  if (root !== resolve(input)) {
    fail('WG_SITE_VERIFY_INPUT', 'Verification input may not traverse symbolic links.');
  }
  if ((status.mode & 0o777) !== 0o755) {
    fail('WG_SITE_VERIFY_MODE', 'Artifact root directory mode is not 0755.');
  }
  const entries = scanDirectory(root);
  const manifestEntry = entries.find((entry) => entry.path === SITE_MANIFEST_PATH);
  if (manifestEntry?.kind !== 'file' || manifestEntry.bytes === undefined) {
    fail('WG_SITE_VERIFY_MANIFEST', 'Artifact has no regular root site manifest.');
  }
  const serializedManifest = decodeManifest(manifestEntry.bytes);
  const manifest = parseIndependentlyVerifiedManifest(serializedManifest);
  verifyEntries(entries, manifest, serializedManifest);
  return { input: root, manifest, manifestSha256: sha256(manifestEntry.bytes) };
}

export function assertSiteArtifactsEqual(first: string, second: string): string {
  const firstResult = verifySite(first);
  const secondResult = verifySite(second);
  const firstEntries = scanDirectory(firstResult.input);
  const secondEntries = scanDirectory(secondResult.input);
  if (firstEntries.length !== secondEntries.length) {
    fail('WG_SITE_BUILD_DIFFERENCE', 'Built artifact path counts differ.');
  }
  for (let index = 0; index < firstEntries.length; index += 1) {
    const left = firstEntries[index];
    const right = secondEntries[index];
    if (
      left === undefined ||
      right === undefined ||
      left.path !== right.path ||
      left.kind !== right.kind ||
      left.mode !== right.mode ||
      left.links !== right.links ||
      !equalBytes(left.bytes, right.bytes)
    ) {
      fail('WG_SITE_BUILD_DIFFERENCE', `Built artifacts differ at sorted entry ${index}.`);
    }
  }
  if (firstResult.manifest.bundleSha256 !== secondResult.manifest.bundleSha256) {
    fail('WG_SITE_BUILD_DIFFERENCE', 'Built artifact identities differ.');
  }
  return firstResult.manifest.bundleSha256;
}
