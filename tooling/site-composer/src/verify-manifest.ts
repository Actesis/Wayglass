import {
  assertAdmittedPath,
  collisionKey,
  destinationPath,
  normalizeRelativePath,
} from './admission.ts';
import { compactCanonicalJson, serializeCanonicalJson } from './canonical-json.ts';
import {
  SITE_ARTIFACT,
  SITE_MANIFEST_PATH,
  SITE_SCHEMA_VERSION,
  SITE_SURFACES,
} from './constants.ts';
import { fail } from './error.ts';
import { hashFileInventory, sha256 } from './hash.ts';
import type {
  InspectedSiteFile,
  SiteBuildEnvironment,
  SiteManifest,
  SiteManifestProjection,
  SiteSourceIdentity,
  SiteSurfaceManifestRecord,
  SiteToolingIdentity,
} from './types.ts';

const digestPattern = /^[0-9a-f]{64}$/;
const gitPattern = /^[0-9a-f]{40}$/;
const versionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const environmentPattern = /^[0-9A-Za-z._+-]+$/;

function object(value: unknown, path: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail('WG_SITE_VERIFY_MANIFEST', `${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  path: string,
): void {
  const actual = Object.keys(value).sort();
  const keys = [...expected].sort();
  if (actual.length !== keys.length || actual.some((key, index) => key !== keys[index])) {
    fail('WG_SITE_VERIFY_MANIFEST', `${path} has unknown or missing fields.`);
  }
}

function string(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    fail('WG_SITE_VERIFY_MANIFEST', `${path} must be a nonempty string.`);
  }
  return value;
}

function literal<T extends string | number>(value: unknown, expected: T, path: string): T {
  if (value !== expected) fail('WG_SITE_VERIFY_MANIFEST', `${path} has the wrong value.`);
  return expected;
}

function digest(value: unknown, path: string): string {
  const result = string(value, path);
  if (!digestPattern.test(result)) fail('WG_SITE_VERIFY_MANIFEST', `${path} is not a SHA-256.`);
  return result;
}

function git(value: unknown, path: string): string {
  const result = string(value, path);
  if (!gitPattern.test(result)) fail('WG_SITE_VERIFY_MANIFEST', `${path} is not a Git object.`);
  return result;
}

function count(value: unknown, path: string, positive = false): number {
  if (!Number.isSafeInteger(value) || (value as number) < (positive ? 1 : 0)) {
    fail('WG_SITE_VERIFY_MANIFEST', `${path} is not an admitted count.`);
  }
  return value as number;
}

function source(value: unknown): SiteSourceIdentity {
  const result = object(value, 'source');
  exactKeys(result, ['commit', 'tree', 'lockfileSha256'], 'source');
  return {
    commit: git(result.commit, 'source.commit'),
    tree: git(result.tree, 'source.tree'),
    lockfileSha256: digest(result.lockfileSha256, 'source.lockfileSha256'),
  };
}

function tooling(value: unknown): SiteToolingIdentity {
  const result = object(value, 'tooling');
  exactKeys(result, ['commit', 'tree'], 'tooling');
  return { commit: git(result.commit, 'tooling.commit'), tree: git(result.tree, 'tooling.tree') };
}

function environment(value: unknown): SiteBuildEnvironment {
  const result = object(value, 'environment');
  exactKeys(result, ['node', 'pnpm', 'platform', 'architecture'], 'environment');
  const parsed = {
    node: string(result.node, 'environment.node'),
    pnpm: string(result.pnpm, 'environment.pnpm'),
    platform: string(result.platform, 'environment.platform'),
    architecture: string(result.architecture, 'environment.architecture'),
  };
  if (Object.values(parsed).some((item) => !environmentPattern.test(item))) {
    fail('WG_SITE_VERIFY_MANIFEST', 'environment contains unsupported characters.');
  }
  return parsed;
}

function files(value: unknown): readonly InspectedSiteFile[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail('WG_SITE_VERIFY_MANIFEST', 'files must be a nonempty array.');
  }
  const seen = new Set<string>();
  let prior = '';
  return value.map((item, index) => {
    const record = object(item, `files[${index}]`);
    exactKeys(record, ['surface', 'path', 'bytes', 'sha256'], `files[${index}]`);
    const surface = string(record.surface, `files[${index}].surface`);
    if (surface !== 'documentation' && surface !== 'storybook') {
      fail('WG_SITE_VERIFY_MANIFEST', `files[${index}].surface is not admitted.`);
    }
    const path = normalizeRelativePath(string(record.path, `files[${index}].path`));
    const relative =
      surface === 'storybook' && path.startsWith('storybook/') ? path.slice(10) : path;
    assertAdmittedPath(surface, relative);
    if (destinationPath(surface, relative) !== path || path === SITE_MANIFEST_PATH) {
      fail('WG_SITE_VERIFY_MANIFEST', `files[${index}].path has invalid attribution.`);
    }
    const key = collisionKey(path);
    if (path <= prior || seen.has(key))
      fail('WG_SITE_VERIFY_MANIFEST', 'files are not strictly ordered and unique.');
    prior = path;
    seen.add(key);
    return {
      surface,
      path,
      bytes: count(record.bytes, `files[${index}].bytes`, true),
      sha256: digest(record.sha256, `files[${index}].sha256`),
    };
  });
}

function surfaces(
  value: unknown,
  inventory: readonly InspectedSiteFile[],
): readonly SiteSurfaceManifestRecord[] {
  if (!Array.isArray(value) || value.length !== SITE_SURFACES.length) {
    fail('WG_SITE_VERIFY_MANIFEST', 'surfaces has the wrong length.');
  }
  return value.map((item, index) => {
    const definition = SITE_SURFACES[index];
    if (definition === undefined) fail('WG_SITE_VERIFY_MANIFEST', 'surface is undeclared.');
    const record = object(item, `surfaces[${index}]`);
    exactKeys(
      record,
      [
        'id',
        'classification',
        'package',
        'version',
        'sourcePath',
        'publicPath',
        'requiredEntries',
        'fileCount',
        'bytes',
        'contentSha256',
      ],
      `surfaces[${index}]`,
    );
    const version = string(record.version, `surfaces[${index}].version`);
    if (!versionPattern.test(version))
      fail('WG_SITE_VERIFY_MANIFEST', 'surface version is not SemVer.');
    if (
      !Array.isArray(record.requiredEntries) ||
      record.requiredEntries.length !== definition.requiredEntries.length ||
      record.requiredEntries.some(
        (entry, entryIndex) => entry !== definition.requiredEntries[entryIndex],
      )
    ) {
      fail('WG_SITE_VERIFY_MANIFEST', 'surface required entries differ.');
    }
    const selected = inventory.filter((file) => file.surface === definition.id);
    for (const required of definition.requiredEntries) {
      const expected = definition.destinationPrefix
        ? `${definition.destinationPrefix}/${required}`
        : required;
      if (!selected.some((file) => file.path === expected))
        fail('WG_SITE_VERIFY_MANIFEST', 'surface required entry is missing.');
    }
    const expectedCount = selected.length;
    const expectedBytes = selected.reduce((total, file) => total + file.bytes, 0);
    const expectedHash = hashFileInventory(selected);
    if (
      record.fileCount !== expectedCount ||
      record.bytes !== expectedBytes ||
      record.contentSha256 !== expectedHash
    ) {
      fail('WG_SITE_VERIFY_MANIFEST', 'surface inventory identity differs.');
    }
    return {
      id: literal(record.id, definition.id, 'surface.id'),
      classification: literal(
        record.classification,
        definition.classification,
        'surface.classification',
      ),
      package: literal(record.package, definition.packageName, 'surface.package'),
      version,
      sourcePath: literal(record.sourcePath, definition.sourcePath, 'surface.sourcePath'),
      publicPath: literal(record.publicPath, definition.publicPath, 'surface.publicPath'),
      requiredEntries: [...definition.requiredEntries],
      fileCount: expectedCount,
      bytes: expectedBytes,
      contentSha256: expectedHash,
    };
  });
}

export function parseIndependentlyVerifiedManifest(serialized: string): SiteManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    fail('WG_SITE_VERIFY_MANIFEST', 'Manifest is not valid JSON.');
  }
  const record = object(parsed, '$');
  exactKeys(
    record,
    [
      'artifact',
      'schemaVersion',
      'source',
      'tooling',
      'environment',
      'surfaces',
      'files',
      'bundleSha256',
    ],
    '$',
  );
  const inventory = files(record.files);
  const projection: SiteManifestProjection = {
    artifact: literal(record.artifact, SITE_ARTIFACT, 'artifact'),
    schemaVersion: literal(record.schemaVersion, SITE_SCHEMA_VERSION, 'schemaVersion'),
    source: source(record.source),
    tooling: tooling(record.tooling),
    environment: environment(record.environment),
    surfaces: surfaces(record.surfaces, inventory),
    files: inventory,
  };
  const bundleSha256 = digest(record.bundleSha256, 'bundleSha256');
  if (bundleSha256 !== sha256(compactCanonicalJson(projection)))
    fail('WG_SITE_VERIFY_MANIFEST', 'Bundle identity differs.');
  const manifest = { ...projection, bundleSha256 };
  if (serialized !== serializeCanonicalJson(manifest))
    fail('WG_SITE_VERIFY_MANIFEST', 'Manifest is not canonical JSON.');
  return manifest;
}
