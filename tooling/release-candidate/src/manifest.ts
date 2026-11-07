import {
  candidateDirectories,
  expectedDependencies,
  expectedPeerDependencies,
  expectedSideEffects,
  packageFilesAllowlist,
} from './constants.ts';
import { fail } from './error.ts';
import type {
  CandidateDirectory,
  CandidateSource,
  JsonValue,
  ProjectedManifest,
  PackableManifest,
} from './types.ts';

const lifecycleNames = new Set([
  'preinstall',
  'install',
  'postinstall',
  'prepare',
  'prepack',
  'postpack',
  'publish',
  'prepublish',
  'prepublishOnly',
  'postpublish',
]);

function record(value: unknown, code: string, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(code, `${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, code: string, path: string): string {
  if (typeof value !== 'string' || value.length === 0)
    fail(code, `${path} must be a non-empty string.`);
  return value;
}

function json(value: unknown, path: string): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map((entry, index) => json(entry, `${path}[${index}]`));
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, json((value as Record<string, unknown>)[key], `${path}.${key}`)]),
    );
  }
  return fail('WG_RC_MANIFEST_JSON', `${path} must contain only JSON values.`);
}

function stringArray(value: unknown, path: string): readonly string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    fail('WG_RC_MANIFEST_ARRAY', `${path} must be an array of strings.`);
  }
  return Object.freeze([...value] as string[]);
}

function dependencyMap(value: unknown, path: string): Readonly<Record<string, string>> | undefined {
  if (value === undefined) return undefined;
  const input = record(value, 'WG_RC_DEPENDENCY_MAP', path);
  const result: Record<string, string> = {};
  for (const name of Object.keys(input).sort()) {
    const range = input[name];
    if (typeof range !== 'string' || range.length === 0) {
      fail('WG_RC_DEPENDENCY_RANGE', `${path}.${name} must be a non-empty string.`);
    }
    if (
      /^(?:workspace:|file:|link:|https?:|git(?:\+|:)|github:|ssh:|\.\.?[\\/]|[A-Za-z]:[\\/]|\\\\)/i.test(
        range,
      )
    ) {
      fail('WG_RC_DEPENDENCY_PROTOCOL', `${path}.${name} uses forbidden range "${range}".`);
    }
    if (name.startsWith('@wayglass/') && range !== '^0.1.0') {
      fail('WG_RC_WAYGLASS_RANGE', `${path}.${name} must use ^0.1.0.`);
    }
    result[name] = range;
  }
  return Object.freeze(result);
}

function sameMap(
  actual: Readonly<Record<string, string>> | undefined,
  expected: Readonly<Record<string, string>> | undefined,
): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function sameJson(actual: unknown, expected: JsonValue, path: string): boolean {
  return JSON.stringify(json(actual, path)) === JSON.stringify(json(expected, `${path}.expected`));
}

function validateScripts(value: unknown, directory: CandidateDirectory): void {
  const scripts = record(value, 'WG_RC_SOURCE_SCRIPTS', `${directory}.scripts`);
  for (const name of Object.keys(scripts)) {
    if (lifecycleNames.has(name.toLowerCase())) {
      fail('WG_RC_LIFECYCLE_SCRIPT', `${directory}.scripts.${name} is not allowed.`);
    }
  }
}

function freeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

export function projectPackageManifest(
  directory: CandidateDirectory,
  source: unknown,
): ProjectedManifest {
  const input = record(source, 'WG_RC_MANIFEST_OBJECT', directory);
  const name = string(input.name, 'WG_RC_PACKAGE_NAME', `${directory}.name`);
  if (name !== `@wayglass/${directory}`) {
    fail('WG_RC_PACKAGE_NAME', `${directory}.name must be @wayglass/${directory}.`);
  }
  if (input.version !== '0.1.0') fail('WG_RC_VERSION', `${name} must be version 0.1.0.`);
  if (input.private !== true) fail('WG_RC_PRIVACY', `${name} must remain private in Phase 6C.`);
  if (input.license !== 'Apache-2.0') fail('WG_RC_LICENSE', `${name} must use Apache-2.0.`);
  if (input.type !== 'module') fail('WG_RC_MODULE_TYPE', `${name} must use ESM.`);
  validateScripts(input.scripts, directory);

  const files = stringArray(input.files, `${directory}.files`);
  if (JSON.stringify(files) !== JSON.stringify(packageFilesAllowlist)) {
    fail('WG_RC_FILES_ALLOWLIST', `${name} files must match the accepted package allowlist.`);
  }

  const dependencies = dependencyMap(input.dependencies, `${directory}.dependencies`);
  const peerDependencies = dependencyMap(input.peerDependencies, `${directory}.peerDependencies`);
  if (!sameMap(dependencies, expectedDependencies[directory])) {
    fail('WG_RC_DEPENDENCIES', `${name} dependencies differ from the accepted freeze.`);
  }
  if (!sameMap(peerDependencies, expectedPeerDependencies[directory])) {
    fail('WG_RC_PEER_DEPENDENCIES', `${name} peer dependencies differ from the accepted freeze.`);
  }

  const sideEffects =
    typeof input.sideEffects === 'boolean'
      ? input.sideEffects
      : stringArray(input.sideEffects, `${directory}.sideEffects`);
  if (JSON.stringify(sideEffects) !== JSON.stringify(expectedSideEffects[directory])) {
    fail('WG_RC_SIDE_EFFECTS', `${name} sideEffects differ from the accepted freeze.`);
  }
  if (!sameJson(input.engines, { node: '>=22.13.0 <27' }, `${directory}.engines`)) {
    fail('WG_RC_ENGINES', `${name} must retain the accepted Node engine range.`);
  }
  if (
    !sameJson(
      input.publishConfig,
      { access: 'public', registry: 'https://registry.npmjs.org/' },
      `${directory}.publishConfig`,
    )
  ) {
    fail(
      'WG_RC_PUBLISH_CONFIG',
      `${name} publishConfig differs from the accepted future metadata.`,
    );
  }
  const keywords = stringArray(input.keywords, `${directory}.keywords`);

  const projected: ProjectedManifest = {
    name,
    version: '0.1.0',
    private: true,
    description: string(input.description, 'WG_RC_DESCRIPTION', `${directory}.description`),
    license: 'Apache-2.0',
    author: json(input.author, `${directory}.author`),
    homepage: string(input.homepage, 'WG_RC_HOMEPAGE', `${directory}.homepage`),
    repository: json(input.repository, `${directory}.repository`),
    bugs: json(input.bugs, `${directory}.bugs`),
    keywords,
    publishConfig: json(input.publishConfig, `${directory}.publishConfig`),
    type: 'module',
    sideEffects,
    engines: json(input.engines, `${directory}.engines`),
    files,
    exports: json(input.exports, `${directory}.exports`),
    ...(dependencies === undefined ? {} : { dependencies }),
    ...(peerDependencies === undefined ? {} : { peerDependencies }),
  };
  return freeze(projected);
}

export function projectCandidateInventory(
  candidates: readonly CandidateSource[],
): readonly ProjectedManifest[] {
  const byDirectory = new Map<CandidateDirectory, unknown>();
  for (const candidate of candidates) {
    if (!candidateDirectories.includes(candidate.directory)) {
      fail('WG_RC_PACKAGE_DIRECTORY', `Unsupported candidate directory "${candidate.directory}".`);
    }
    if (byDirectory.has(candidate.directory)) {
      fail('WG_RC_PACKAGE_DUPLICATE', `Duplicate candidate directory "${candidate.directory}".`);
    }
    byDirectory.set(candidate.directory, candidate.manifest);
  }
  const missing = candidateDirectories.filter((directory) => !byDirectory.has(directory));
  if (missing.length > 0 || byDirectory.size !== candidateDirectories.length) {
    fail(
      'WG_RC_PACKAGE_INVENTORY',
      `Candidate inventory is missing ${missing.join(', ') || 'none'}.`,
    );
  }
  return freeze(
    candidateDirectories.map((directory) =>
      projectPackageManifest(directory, byDirectory.get(directory)),
    ),
  );
}

export function serializeProjectedManifest(manifest: PackableManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
