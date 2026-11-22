export class ReleaseError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ReleaseError';
  }
}

export function fail(code: string, message: string): never {
  throw new ReleaseError(code, message);
}

export type Manifest = Record<string, unknown> & {
  readonly name: string;
  readonly version: string;
};

const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** Accepts only plain release versions; prereleases need their own reviewed path. */
export function parseVersion(version: string): readonly [number, number, number] {
  const match = versionPattern.exec(version);
  if (match === null) fail('WG_RELEASE_VERSION', `${version} is not a plain MAJOR.MINOR.PATCH.`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Whether a caret range such as `^0.1.0` admits a version, following npm's caret rules. Wayglass
 * manifests use only caret ranges for Wayglass packages, so any other form is rejected.
 */
export function caretAdmits(range: string, version: string): boolean {
  if (!range.startsWith('^')) fail('WG_RELEASE_RANGE', `${range} is not a caret range.`);
  const [floorMajor, floorMinor, floorPatch] = parseVersion(range.slice(1));
  const [major, minor, patch] = parseVersion(version);
  const atLeast =
    major > floorMajor ||
    (major === floorMajor && (minor > floorMinor || (minor === floorMinor && patch >= floorPatch)));
  if (!atLeast) return false;
  if (floorMajor > 0) return major === floorMajor;
  if (floorMinor > 0) return major === 0 && minor === floorMinor;
  return major === 0 && minor === 0 && patch === floorPatch;
}

function record(value: unknown): Record<string, string> {
  if (value === undefined) return {};
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    fail('WG_RELEASE_MANIFEST', 'Dependency fields must be objects.');
  return value as Record<string, string>;
}

/**
 * Checks a workspace manifest before release. Every Wayglass dependency that belongs to the same
 * release must admit the version being released, so the released set installs together.
 */
export function validateWorkspaceManifest(
  manifest: Manifest,
  expected: { readonly name: string; readonly version: string },
  releasedVersions: ReadonlyMap<string, string>,
): void {
  if (manifest.name !== expected.name)
    fail('WG_RELEASE_NAME', `Expected ${expected.name}, found ${manifest.name}.`);
  if (manifest.version !== expected.version)
    fail(
      'WG_RELEASE_VERSION',
      `${manifest.name} is ${manifest.version}; the release requires ${expected.version}.`,
    );
  if (manifest.private !== true)
    fail('WG_RELEASE_PRIVATE', `${manifest.name} must stay private in the workspace.`);
  if (!Array.isArray(manifest.files) || manifest.files.length === 0)
    fail('WG_RELEASE_FILES', `${manifest.name} must list its published files.`);
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, range] of Object.entries(record(manifest[field]))) {
      if (!name.startsWith('@wayglass/')) continue;
      if (range.startsWith('workspace:'))
        fail('WG_RELEASE_RANGE', `${manifest.name} ${field}.${name} uses a workspace protocol.`);
      const released = releasedVersions.get(name);
      if (released !== undefined && !caretAdmits(range, released))
        fail(
          'WG_RELEASE_RANGE',
          `${manifest.name} ${field}.${name} ${range} does not admit the released ${released}.`,
        );
    }
  }
}

/**
 * The manifest as published: public, and without workspace-only development fields. Key order is
 * preserved so `exports` keeps its `types`-first conditions.
 */
export function publicManifest(manifest: Manifest): Manifest {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(manifest)) {
    if (key === 'scripts' || key === 'devDependencies') continue;
    result[key] = key === 'private' ? false : value;
  }
  return result as Manifest;
}
