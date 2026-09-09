import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

import { destinationPath } from './admission.ts';
import { SITE_MANIFEST_PATH, SITE_SURFACES } from './constants.ts';
import { fail, SiteComposerError } from './error.ts';
import {
  assertFilesystemInventoriesEqual,
  assertRealDirectoryPath,
  normalizeMode,
  scanDirectory,
} from './filesystem.ts';
import { sha256 } from './hash.ts';
import { inspectSurfaceInventory, mergeSurfaceInventories } from './inventory.ts';
import { createSiteManifest, serializeSiteManifest } from './manifest.ts';
import { validateNewSiteOutputPath } from './path-safety.ts';
import { runLocalCommand, validateSiteRepository } from './repository.ts';
import type {
  ComposedSiteResult,
  InventoryEntry,
  SiteManifest,
  SiteSurfaceId,
  SurfaceInventory,
} from './types.ts';
import type { LocalCommand } from './repository.ts';

export type CompositionBoundary =
  | 'staging-created'
  | 'directory-created'
  | 'file-written'
  | 'manifest-written'
  | 'inputs-reinventoried'
  | 'staging-verified'
  | 'before-rename';

export interface CompositionBoundaryContext {
  readonly boundary: CompositionBoundary;
  readonly output: string;
  readonly staging: string;
  readonly path?: string;
}

export interface ComposeSiteOptions {
  readonly repositoryRoot: string;
  readonly output: string;
  readonly command?: LocalCommand;
  readonly onBoundary?: (context: CompositionBoundaryContext) => void;
}

interface SurfaceScan {
  readonly id: SiteSurfaceId;
  readonly root: string;
  readonly entries: readonly InventoryEntry[];
  readonly inventory: SurfaceInventory;
}

function boundary(
  options: ComposeSiteOptions,
  value: Omit<CompositionBoundaryContext, 'output'>,
): void {
  options.onBoundary?.({ ...value, output: options.output });
}

function directories(scans: readonly SurfaceScan[]): readonly string[] {
  const paths = new Set<string>();
  for (const scan of scans) {
    const definition = SITE_SURFACES.find((surface) => surface.id === scan.id);
    if (definition?.destinationPrefix) paths.add(definition.destinationPrefix);
    for (const entry of scan.entries) {
      if (entry.kind === 'directory') paths.add(destinationPath(scan.id, entry.path));
      if (entry.kind === 'file') {
        const destination = destinationPath(scan.id, entry.path);
        const parent = dirname(destination);
        if (parent !== '.') paths.add(parent);
      }
    }
  }
  return [...paths].sort((left, right) => {
    const depth = left.split('/').length - right.split('/').length;
    return depth !== 0 ? depth : left < right ? -1 : left > right ? 1 : 0;
  });
}

function files(
  scans: readonly SurfaceScan[],
): readonly { readonly path: string; readonly bytes: Uint8Array }[] {
  return scans
    .flatMap((scan) =>
      scan.entries
        .filter(
          (entry): entry is InventoryEntry & { readonly bytes: Uint8Array } =>
            entry.kind === 'file' && entry.bytes !== undefined,
        )
        .map((entry) => ({
          path: destinationPath(scan.id, entry.path),
          bytes: entry.bytes,
        })),
    )
    .sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
}

function verifyStagedArtifact(
  staging: string,
  manifest: SiteManifest,
  serializedManifest: string,
  expectedDirectories: readonly string[],
): void {
  const entries = scanDirectory(staging);
  const expectedFiles = new Map(
    manifest.files.map((file) => [file.path, { bytes: file.bytes, sha256: file.sha256 }]),
  );
  expectedFiles.set(SITE_MANIFEST_PATH, {
    bytes: Buffer.byteLength(serializedManifest),
    sha256: sha256(serializedManifest),
  });
  const actualFiles = entries.filter((entry) => entry.kind === 'file');
  const actualDirectories = entries.filter((entry) => entry.kind === 'directory');
  if (actualFiles.length !== expectedFiles.size) {
    fail('WG_SITE_STAGED_INVENTORY', 'Staged artifact has an unexpected file count.');
  }
  if (
    actualDirectories.length !== expectedDirectories.length ||
    actualDirectories.some((entry) => !expectedDirectories.includes(entry.path))
  ) {
    fail('WG_SITE_STAGED_INVENTORY', 'Staged artifact has an unexpected directory set.');
  }
  for (const entry of entries) {
    const absolute = resolve(staging, entry.path);
    if (entry.kind === 'directory') {
      if (entry.mode !== 0o755) fail('WG_SITE_STAGED_MODE', 'Staged directory mode is not 0755.');
      continue;
    }
    if (entry.kind !== 'file' || entry.bytes === undefined || entry.links !== 1) {
      fail('WG_SITE_STAGED_INVENTORY', 'Staged artifact contains an unsupported entry.');
    }
    if (entry.mode !== 0o644) fail('WG_SITE_STAGED_MODE', 'Staged file mode is not 0644.');
    const expected = expectedFiles.get(entry.path);
    if (
      expected === undefined ||
      entry.bytes.byteLength !== expected.bytes ||
      sha256(entry.bytes) !== expected.sha256
    ) {
      fail('WG_SITE_STAGED_INVENTORY', `Staged file "${entry.path}" does not match its identity.`);
    }
    if (
      entry.path === SITE_MANIFEST_PATH &&
      readFileSync(absolute, 'utf8') !== serializedManifest
    ) {
      fail('WG_SITE_STAGED_MANIFEST', 'Staged manifest bytes are not canonical.');
    }
  }
}

export async function composeSite(options: ComposeSiteOptions): Promise<ComposedSiteResult> {
  const command = options.command ?? runLocalCommand;
  const repository = validateSiteRepository(options.repositoryRoot, command);
  const output = validateNewSiteOutputPath(options.output, repository.root);
  const scans: SurfaceScan[] = SITE_SURFACES.map((surface) => {
    const root = assertRealDirectoryPath(
      repository.root,
      resolve(repository.root, surface.sourcePath),
    );
    const entries = scanDirectory(root);
    const inventory = inspectSurfaceInventory(surface.id, entries);
    return { id: surface.id, root, entries, inventory };
  });
  const inventory = mergeSurfaceInventories(scans.map((scan) => scan.inventory));
  const manifest = createSiteManifest({
    source: repository.source,
    tooling: repository.tooling,
    environment: repository.environment,
    versions: repository.versions,
    files: inventory,
  });
  const serializedManifest = serializeSiteManifest(manifest);

  let staging: string | undefined;
  try {
    staging = mkdtempSync(resolve(dirname(output), `.${basename(output)}.partial-`));
    normalizeMode(staging, 'directory');
    boundary(options, { boundary: 'staging-created', staging });

    const expectedDirectories = directories(scans);
    for (const path of expectedDirectories) {
      const absolute = resolve(staging, path);
      mkdirSync(absolute, { recursive: true, mode: 0o755 });
      normalizeMode(absolute, 'directory');
      boundary(options, { boundary: 'directory-created', staging, path });
    }
    for (const file of files(scans)) {
      const absolute = resolve(staging, file.path);
      writeFileSync(absolute, file.bytes, { flag: 'wx', mode: 0o644 });
      normalizeMode(absolute, 'file');
      boundary(options, { boundary: 'file-written', staging, path: file.path });
    }
    const manifestPath = resolve(staging, SITE_MANIFEST_PATH);
    writeFileSync(manifestPath, serializedManifest, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
    normalizeMode(manifestPath, 'file');
    boundary(options, { boundary: 'manifest-written', staging, path: SITE_MANIFEST_PATH });

    for (const scan of scans) {
      assertFilesystemInventoriesEqual(scan.entries, scanDirectory(scan.root));
    }
    boundary(options, { boundary: 'inputs-reinventoried', staging });
    verifyStagedArtifact(staging, manifest, serializedManifest, expectedDirectories);
    boundary(options, { boundary: 'staging-verified', staging });

    if (existsSync(output)) fail('WG_SITE_OUTPUT_EXISTS', 'Output appeared during composition.');
    boundary(options, { boundary: 'before-rename', staging });
    if (existsSync(output)) fail('WG_SITE_OUTPUT_EXISTS', 'Output appeared during composition.');
    renameSync(staging, output);
    staging = undefined;
    return { output, manifest, manifestSha256: sha256(serializedManifest) };
  } catch (error) {
    if (error instanceof SiteComposerError) throw error;
    throw new SiteComposerError('WG_SITE_COMPOSE', 'Site composition failed.');
  } finally {
    if (staging !== undefined) rmSync(staging, { recursive: true, force: true });
  }
}
