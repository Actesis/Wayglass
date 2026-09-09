import { assertAdmittedPath, collisionKey, normalizeRelativePath } from './admission.ts';
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
  CreateSiteManifestInput,
  InspectedSiteFile,
  SiteBuildEnvironment,
  SiteFileManifestRecord,
  SiteManifest,
  SiteManifestProjection,
  SiteSourceIdentity,
  SiteSurfaceId,
  SiteSurfaceManifestRecord,
  SiteToolingIdentity,
} from './types.ts';

const digestPattern = /^[0-9a-f]{64}$/;
const gitObjectPattern = /^[0-9a-f]{40}$/;
const versionPattern =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const environmentValuePattern = /^[0-9A-Za-z._+-]+$/;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assertExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  path: string,
): void {
  const actual = Object.keys(value).sort(compareText);
  const expected = [...keys].sort(compareText);
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail('WG_SITE_MANIFEST_KEYS', `${path} has unknown or missing fields.`);
  }
}

function objectValue(value: unknown, path: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail('WG_SITE_MANIFEST_SHAPE', `${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    fail('WG_SITE_MANIFEST_STRING', `${path} must be a nonempty string.`);
  }
  return value;
}

function literalValue<T extends string | number>(value: unknown, expected: T, path: string): T {
  if (value !== expected)
    fail('WG_SITE_MANIFEST_LITERAL', `${path} must be ${JSON.stringify(expected)}.`);
  return expected;
}

function safeCount(value: unknown, path: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    fail('WG_SITE_MANIFEST_COUNT', `${path} must be a nonnegative safe integer.`);
  }
  return value as number;
}

function digest(value: unknown, path: string): string {
  const candidate = stringValue(value, path);
  if (!digestPattern.test(candidate)) {
    fail('WG_SITE_MANIFEST_DIGEST', `${path} must be a lowercase SHA-256.`);
  }
  return candidate;
}

function gitObject(value: unknown, path: string): string {
  const candidate = stringValue(value, path);
  if (!gitObjectPattern.test(candidate)) {
    fail('WG_SITE_MANIFEST_GIT', `${path} must be a lowercase SHA-1 Git object ID.`);
  }
  return candidate;
}

function version(value: unknown, path: string): string {
  const candidate = stringValue(value, path);
  if (!versionPattern.test(candidate))
    fail('WG_SITE_MANIFEST_VERSION', `${path} is not exact SemVer.`);
  return candidate;
}

function stringArray(value: unknown, path: string): readonly string[] {
  if (!Array.isArray(value)) fail('WG_SITE_MANIFEST_ARRAY', `${path} must be an array.`);
  return value.map((item, index) => stringValue(item, `${path}[${index}]`));
}

function sourceIdentity(value: unknown): SiteSourceIdentity {
  const record = objectValue(value, 'source');
  assertExactKeys(record, ['commit', 'tree', 'lockfileSha256'], 'source');
  return {
    commit: gitObject(record.commit, 'source.commit'),
    tree: gitObject(record.tree, 'source.tree'),
    lockfileSha256: digest(record.lockfileSha256, 'source.lockfileSha256'),
  };
}

function toolingIdentity(value: unknown): SiteToolingIdentity {
  const record = objectValue(value, 'tooling');
  assertExactKeys(record, ['commit', 'tree'], 'tooling');
  return {
    commit: gitObject(record.commit, 'tooling.commit'),
    tree: gitObject(record.tree, 'tooling.tree'),
  };
}

function environment(value: unknown): SiteBuildEnvironment {
  const record = objectValue(value, 'environment');
  assertExactKeys(record, ['node', 'pnpm', 'platform', 'architecture'], 'environment');
  const result = {
    node: stringValue(record.node, 'environment.node'),
    pnpm: stringValue(record.pnpm, 'environment.pnpm'),
    platform: stringValue(record.platform, 'environment.platform'),
    architecture: stringValue(record.architecture, 'environment.architecture'),
  };
  for (const [key, item] of Object.entries(result)) {
    if (!environmentValuePattern.test(item)) {
      fail('WG_SITE_MANIFEST_ENVIRONMENT', `environment.${key} contains unsupported characters.`);
    }
  }
  return result;
}

function fileRecord(value: unknown, index: number): SiteFileManifestRecord {
  const path = `files[${index}]`;
  const record = objectValue(value, path);
  assertExactKeys(record, ['surface', 'path', 'bytes', 'sha256'], path);
  const surface = stringValue(record.surface, `${path}.surface`);
  if (surface !== 'documentation' && surface !== 'storybook') {
    fail('WG_SITE_MANIFEST_SURFACE', `${path}.surface is not admitted.`);
  }
  return {
    surface,
    path: normalizeRelativePath(stringValue(record.path, `${path}.path`)),
    bytes: safeCount(record.bytes, `${path}.bytes`),
    sha256: digest(record.sha256, `${path}.sha256`),
  };
}

function surfaceRecord(value: unknown, index: number): SiteSurfaceManifestRecord {
  const path = `surfaces[${index}]`;
  const record = objectValue(value, path);
  assertExactKeys(
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
    path,
  );
  const expected = SITE_SURFACES[index];
  if (expected === undefined) fail('WG_SITE_MANIFEST_SURFACE', `${path} is undeclared.`);
  return {
    id: literalValue(record.id, expected.id, `${path}.id`),
    classification: literalValue(
      record.classification,
      expected.classification,
      `${path}.classification`,
    ),
    package: literalValue(record.package, expected.packageName, `${path}.package`),
    version: version(record.version, `${path}.version`),
    sourcePath: literalValue(record.sourcePath, expected.sourcePath, `${path}.sourcePath`),
    publicPath: literalValue(record.publicPath, expected.publicPath, `${path}.publicPath`),
    requiredEntries: stringArray(record.requiredEntries, `${path}.requiredEntries`),
    fileCount: safeCount(record.fileCount, `${path}.fileCount`),
    bytes: safeCount(record.bytes, `${path}.bytes`),
    contentSha256: digest(record.contentSha256, `${path}.contentSha256`),
  };
}

function sourceRelativePath(file: InspectedSiteFile): string {
  if (file.surface === 'documentation') {
    if (file.path.startsWith('storybook/')) {
      fail('WG_SITE_FILE_ATTRIBUTION', `Documentation cannot own "${file.path}".`);
    }
    return file.path;
  }
  if (!file.path.startsWith('storybook/')) {
    fail('WG_SITE_FILE_ATTRIBUTION', `Storybook path "${file.path}" lacks its prefix.`);
  }
  return file.path.slice('storybook/'.length);
}

function validateFiles(files: readonly InspectedSiteFile[]): readonly InspectedSiteFile[] {
  if (files.length === 0) fail('WG_SITE_MANIFEST_FILES', 'The site file inventory is empty.');
  const seen = new Map<string, string>();
  let prior = '';
  for (const [index, file] of files.entries()) {
    const relative = sourceRelativePath(file);
    assertAdmittedPath(file.surface, relative);
    if (!Number.isSafeInteger(file.bytes) || file.bytes <= 0) {
      fail('WG_SITE_MANIFEST_COUNT', `files[${index}].bytes must be a positive safe integer.`);
    }
    if (!digestPattern.test(file.sha256)) {
      fail('WG_SITE_MANIFEST_DIGEST', `files[${index}].sha256 must be a lowercase SHA-256.`);
    }
    if (index > 0 && compareText(prior, file.path) >= 0) {
      fail('WG_SITE_FILE_ORDER', 'Files must be strictly sorted by destination path.');
    }
    const key = collisionKey(file.path);
    const collision = seen.get(key);
    if (collision !== undefined) {
      fail(
        'WG_SITE_DESTINATION_COLLISION',
        `Destinations "${collision}" and "${file.path}" collide.`,
      );
    }
    seen.set(key, file.path);
    prior = file.path;
  }
  if (seen.has(collisionKey(SITE_MANIFEST_PATH))) {
    fail('WG_SITE_MANIFEST_COLLISION', 'A surface file claims the site manifest path.');
  }
  return files;
}

function expectedSurfaceRecords(
  files: readonly InspectedSiteFile[],
  versions: Readonly<Record<SiteSurfaceId, string>>,
): readonly SiteSurfaceManifestRecord[] {
  return SITE_SURFACES.map((definition) => {
    const surfaceFiles = files.filter((file) => file.surface === definition.id);
    for (const required of definition.requiredEntries) {
      const path =
        definition.destinationPrefix.length === 0
          ? required
          : `${definition.destinationPrefix}/${required}`;
      if (!surfaceFiles.some((file) => file.path === path)) {
        fail('WG_SITE_REQUIRED_ENTRY', `${definition.id} is missing required entry "${required}".`);
      }
    }
    return {
      id: definition.id,
      classification: definition.classification,
      package: definition.packageName,
      version: version(versions[definition.id], `versions.${definition.id}`),
      sourcePath: definition.sourcePath,
      publicPath: definition.publicPath,
      requiredEntries: [...definition.requiredEntries],
      fileCount: surfaceFiles.length,
      bytes: surfaceFiles.reduce((total, file) => total + file.bytes, 0),
      contentSha256: hashFileInventory(surfaceFiles),
    };
  });
}

export function createSiteManifest(input: CreateSiteManifestInput): SiteManifest {
  const files = validateFiles([...input.files]);
  const source = sourceIdentity(input.source);
  const tooling = toolingIdentity(input.tooling);
  const buildEnvironment = environment(input.environment);
  const projection: SiteManifestProjection = {
    artifact: SITE_ARTIFACT,
    schemaVersion: SITE_SCHEMA_VERSION,
    source,
    tooling,
    environment: buildEnvironment,
    surfaces: expectedSurfaceRecords(files, input.versions),
    files: files.map((file) => ({ ...file })),
  };
  return { ...projection, bundleSha256: sha256(compactCanonicalJson(projection)) };
}

export function validateSiteManifest(value: unknown): SiteManifest {
  const record = objectValue(value, '$');
  assertExactKeys(
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
  literalValue(record.artifact, SITE_ARTIFACT, 'artifact');
  literalValue(record.schemaVersion, SITE_SCHEMA_VERSION, 'schemaVersion');
  const source = sourceIdentity(record.source);
  const tooling = toolingIdentity(record.tooling);
  const buildEnvironment = environment(record.environment);
  if (!Array.isArray(record.surfaces) || record.surfaces.length !== SITE_SURFACES.length) {
    fail(
      'WG_SITE_MANIFEST_SURFACES',
      `surfaces must contain exactly ${SITE_SURFACES.length} records.`,
    );
  }
  const surfaces = record.surfaces.map(surfaceRecord);
  if (!Array.isArray(record.files)) fail('WG_SITE_MANIFEST_ARRAY', 'files must be an array.');
  const files = record.files.map(fileRecord);
  const versions = Object.fromEntries(
    surfaces.map((surface) => [surface.id, surface.version]),
  ) as Record<SiteSurfaceId, string>;
  const expected = createSiteManifest({
    source,
    tooling,
    environment: buildEnvironment,
    versions,
    files,
  });
  const supplied: SiteManifest = {
    artifact: SITE_ARTIFACT,
    schemaVersion: SITE_SCHEMA_VERSION,
    source,
    tooling,
    environment: buildEnvironment,
    surfaces,
    files,
    bundleSha256: digest(record.bundleSha256, 'bundleSha256'),
  };
  if (compactCanonicalJson(supplied) !== compactCanonicalJson(expected)) {
    fail(
      'WG_SITE_MANIFEST_MISMATCH',
      'Manifest totals, identities, order, or bundle hash do not verify.',
    );
  }
  return supplied;
}

export function parseCanonicalSiteManifest(serialized: string): SiteManifest {
  let value: unknown;
  try {
    value = JSON.parse(serialized) as unknown;
  } catch {
    fail('WG_SITE_MANIFEST_JSON', 'Site manifest is not valid JSON.');
  }
  const manifest = validateSiteManifest(value);
  if (serialized !== serializeCanonicalJson(manifest)) {
    fail('WG_SITE_MANIFEST_CANONICAL', 'Site manifest JSON is not canonically serialized.');
  }
  return manifest;
}

export function serializeSiteManifest(manifest: SiteManifest): string {
  return serializeCanonicalJson(validateSiteManifest(manifest));
}
