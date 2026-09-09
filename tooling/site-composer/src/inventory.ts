import {
  assertAdmittedPath,
  assertNoCredentialContent,
  collisionKey,
  destinationPath,
  normalizeRelativePath,
} from './admission.ts';
import { SITE_SURFACES, surfaceDefinition } from './constants.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import type {
  InspectedSiteFile,
  InventoryEntry,
  SiteSurfaceId,
  SurfaceInventory,
} from './types.ts';

function assertEntryShape(entry: InventoryEntry): void {
  if (entry.kind === 'directory') {
    if (entry.bytes !== undefined || entry.links !== undefined) {
      fail('WG_SITE_ENTRY_SHAPE', `Directory "${entry.path}" carries file metadata.`);
    }
    return;
  }
  if (entry.kind !== 'file') {
    fail('WG_SITE_ENTRY_TYPE', `Unsupported ${entry.kind} entry at "${entry.path}".`);
  }
  if (entry.bytes === undefined) {
    fail('WG_SITE_ENTRY_SHAPE', `File "${entry.path}" has no bytes.`);
  }
  if (entry.links !== 1) {
    fail('WG_SITE_HARDLINK', `File "${entry.path}" must have exactly one filesystem link.`);
  }
  if (entry.bytes.byteLength === 0) {
    fail('WG_SITE_EMPTY_FILE', `File "${entry.path}" is empty.`);
  }
}

function assertNoEntryCollisions(entries: readonly InventoryEntry[]): void {
  const exact = new Map<string, InventoryEntry['kind']>();
  const folded = new Map<string, string>();
  for (const entry of entries) {
    const path = normalizeRelativePath(entry.path);
    if (exact.has(path)) fail('WG_SITE_PATH_DUPLICATE', `Duplicate path "${path}".`);
    const key = collisionKey(path);
    const prior = folded.get(key);
    if (prior !== undefined) {
      fail('WG_SITE_PATH_COLLISION', `Paths "${prior}" and "${path}" collide.`);
    }
    exact.set(path, entry.kind);
    folded.set(key, path);
  }

  for (const [path, kind] of exact) {
    const segments = path.split('/');
    for (let index = 1; index < segments.length; index += 1) {
      const ancestor = segments.slice(0, index).join('/');
      if (exact.get(ancestor) === 'file') {
        fail('WG_SITE_PATH_ANCESTOR', `File "${ancestor}" cannot contain "${path}".`);
      }
    }
    if (kind === 'directory') continue;
    for (const candidate of exact.keys()) {
      if (candidate.startsWith(`${path}/`)) {
        fail('WG_SITE_PATH_ANCESTOR', `File "${path}" cannot contain "${candidate}".`);
      }
    }
  }
}

export function inspectSurfaceInventory(
  surface: SiteSurfaceId,
  entries: readonly InventoryEntry[],
): SurfaceInventory {
  surfaceDefinition(surface);
  assertNoEntryCollisions(entries);

  const files: InspectedSiteFile[] = [];
  for (const entry of entries) {
    assertAdmittedPath(surface, entry.path);
    assertEntryShape(entry);
    if (entry.kind === 'directory') continue;
    const bytes = entry.bytes;
    if (bytes === undefined) throw new Error('File bytes were checked above.');
    const path = destinationPath(surface, entry.path);
    assertNoCredentialContent(path, bytes);
    files.push({ surface, path, bytes: bytes.byteLength, sha256: sha256(bytes) });
  }
  files.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));

  const definition = surfaceDefinition(surface);
  for (const required of definition.requiredEntries) {
    const requiredPath = destinationPath(surface, required);
    if (!files.some((file) => file.path === requiredPath)) {
      fail('WG_SITE_REQUIRED_ENTRY', `${surface} is missing required entry "${required}".`);
    }
  }
  return { surface, files };
}

export function mergeSurfaceInventories(
  inventories: readonly SurfaceInventory[],
): readonly InspectedSiteFile[] {
  if (inventories.length !== SITE_SURFACES.length) {
    fail('WG_SITE_SURFACE_SET', `Expected exactly ${SITE_SURFACES.length} surface inventories.`);
  }
  inventories.forEach((inventory, index) => {
    const expected = SITE_SURFACES[index];
    if (inventory.surface !== expected?.id) {
      fail('WG_SITE_SURFACE_ORDER', `Surface ${index} must be "${expected?.id ?? 'none'}".`);
    }
  });

  const files = inventories.flatMap((inventory) => inventory.files);
  const paths = new Map<string, string>();
  for (const file of files) {
    const key = collisionKey(file.path);
    const prior = paths.get(key);
    if (prior !== undefined) {
      fail('WG_SITE_DESTINATION_COLLISION', `Destinations "${prior}" and "${file.path}" collide.`);
    }
    paths.set(key, file.path);
  }
  return [...files].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
}

export function assertInventoriesEqual(
  before: readonly InspectedSiteFile[],
  after: readonly InspectedSiteFile[],
): void {
  if (before.length !== after.length) {
    fail('WG_SITE_INPUT_CHANGED', 'Input file count changed during composition.');
  }
  for (let index = 0; index < before.length; index += 1) {
    const left = before[index];
    const right = after[index];
    if (
      left === undefined ||
      right === undefined ||
      left.surface !== right.surface ||
      left.path !== right.path ||
      left.bytes !== right.bytes ||
      left.sha256 !== right.sha256
    ) {
      fail('WG_SITE_INPUT_CHANGED', `Input inventory changed at sorted index ${index}.`);
    }
  }
}
