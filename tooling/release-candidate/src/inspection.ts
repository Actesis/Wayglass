import { packedRootFiles } from './constants.ts';
import { hashFileInventory, sha256 } from './hash.ts';
import { fail } from './error.ts';
import { serializeProjectedManifest } from './manifest.ts';
import type { JsonValue, PackageFile, PackageInspection, ProjectedManifest } from './types.ts';

const decoder = new TextDecoder('utf-8', { fatal: true });
const privateSegments = new Set([
  '__tests__',
  'test',
  'tests',
  'fixture',
  'fixtures',
  'screenshot',
  'screenshots',
  'coverage',
  '.cache',
]);

function validatePath(path: string): void {
  if (
    path.length === 0 ||
    path.startsWith('/') ||
    path.includes('\\') ||
    [...path].some((character) => {
      const code = character.codePointAt(0)!;
      return code <= 31 || code === 127;
    }) ||
    path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    fail('WG_RC_FILE_PATH', `Unsafe package path "${path}".`);
  }
  const [root] = path.split('/');
  if (root !== 'dist' && !packedRootFiles.includes(path)) {
    fail('WG_RC_FILE_ALLOWLIST', `Package path "${path}" is outside the accepted allowlist.`);
  }
  if (path.split('/').some((segment) => privateSegments.has(segment.toLowerCase()))) {
    fail('WG_RC_PRIVATE_FILE', `Package path "${path}" contains a private-only segment.`);
  }
  if (/\.(?:ts|tsx|mts|cts)$/i.test(path) && !/\.d\.(?:ts|mts|cts)$/i.test(path)) {
    fail('WG_RC_AUTHORED_SOURCE', `Authored source "${path}" is not allowed.`);
  }
}

function exportTargets(value: JsonValue): readonly string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(exportTargets);
  if (typeof value === 'object' && value !== null)
    return Object.values(value).flatMap(exportTargets);
  return [];
}

function inspectSourceMap(file: PackageFile): void {
  if (!file.path.endsWith('.map')) return;
  let value: unknown;
  try {
    value = JSON.parse(decoder.decode(file.bytes));
  } catch {
    fail('WG_RC_SOURCE_MAP_JSON', `${file.path} must be valid UTF-8 JSON.`);
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail('WG_RC_SOURCE_MAP_JSON', `${file.path} must contain a source-map object.`);
  }
  const map = value as Record<string, unknown>;
  if (Object.hasOwn(map, 'sourcesContent')) {
    fail('WG_RC_SOURCE_MAP_CONTENT', `${file.path} must not contain sourcesContent.`);
  }
  if (!Array.isArray(map.sources) || map.sources.some((source) => typeof source !== 'string')) {
    fail('WG_RC_SOURCE_MAP_SOURCES', `${file.path} must contain string sources.`);
  }
  for (const source of map.sources as string[]) {
    if (/^(?:\/|[A-Za-z]:[\\/]|(?:file|https?):|\\\\)/.test(source)) {
      fail('WG_RC_SOURCE_MAP_ABSOLUTE', `${file.path} contains an absolute source path.`);
    }
  }
  if (
    typeof map.sourceRoot === 'string' &&
    /^(?:\/|[A-Za-z]:[\\/]|(?:file|https?):|\\\\)/.test(map.sourceRoot)
  ) {
    fail('WG_RC_SOURCE_MAP_ABSOLUTE', `${file.path} contains an absolute sourceRoot.`);
  }
}

export function inspectPackageFiles(
  files: readonly PackageFile[],
  manifest: ProjectedManifest,
): PackageInspection {
  const seen = new Set<string>();
  const portablePaths = new Set<string>();
  const sorted = [...files].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  for (const file of sorted) {
    validatePath(file.path);
    if ((file.kind ?? 'file') !== 'file') {
      fail('WG_RC_FILE_KIND', `${file.path} must be a regular file.`);
    }
    if (seen.has(file.path)) fail('WG_RC_FILE_DUPLICATE', `Duplicate package path "${file.path}".`);
    const portablePath = file.path.normalize('NFC').toLowerCase();
    if (portablePaths.has(portablePath)) {
      fail('WG_RC_FILE_COLLISION', `Package path "${file.path}" collides across filesystems.`);
    }
    seen.add(file.path);
    portablePaths.add(portablePath);
    inspectSourceMap(file);
  }

  for (const required of packedRootFiles) {
    if (!seen.has(required)) fail('WG_RC_FILE_REQUIRED', `Package is missing ${required}.`);
  }
  if (![...seen].some((path) => path.startsWith('dist/'))) {
    fail('WG_RC_DIST_REQUIRED', 'Package must contain at least one dist file.');
  }

  const packageJson = sorted.find(({ path }) => path === 'package.json');
  if (
    packageJson === undefined ||
    decoder.decode(packageJson.bytes) !== serializeProjectedManifest(manifest)
  ) {
    fail('WG_RC_PACKED_MANIFEST', 'package.json bytes must equal the deterministic projection.');
  }

  for (const target of exportTargets(manifest.exports)) {
    if (!target.startsWith('./dist/') || target.includes('..')) {
      fail('WG_RC_EXPORT_TARGET', `Export target "${target}" must stay inside ./dist/.`);
    }
    if (!seen.has(target.slice(2))) {
      fail('WG_RC_EXPORT_MISSING', `Export target "${target}" is missing from the package.`);
    }
  }

  const inspected = Object.freeze(
    sorted.map((file) =>
      Object.freeze({ path: file.path, bytes: file.bytes.byteLength, sha256: sha256(file.bytes) }),
    ),
  );
  return Object.freeze({
    files: inspected,
    totalBytes: inspected.reduce((total, file) => total + file.bytes, 0),
    inventorySha256: hashFileInventory(inspected),
  });
}
