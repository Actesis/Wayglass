import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

import { fail } from './error.ts';
import type { ProductionDependencyInput } from './dependency-audit.ts';
import type { PackageAuditEvidence } from './package-audit.ts';
import type { PackageFile } from './types.ts';

type UnknownRecord = Readonly<Record<string, unknown>>;

const decoder = new TextDecoder('utf-8', { fatal: true });
const legalFilePattern = /^(?:licen[cs]e|copying|notice)(?:[._-].*)?$/i;

function dependencyFailure(message: string): never {
  return fail('WG_RC_DEPENDENCY_GRAPH', message);
}

function manifestAt(packageDirectory: string): {
  readonly bytes: Uint8Array;
  readonly value: UnknownRecord;
} {
  const bytes = readFileSync(resolve(packageDirectory, 'package.json'));
  try {
    const value = JSON.parse(decoder.decode(bytes)) as unknown;
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      dependencyFailure('Installed dependency manifest must be an object.');
    }
    return { bytes, value: value as UnknownRecord };
  } catch {
    return dependencyFailure('Installed dependency manifest must be valid UTF-8 JSON.');
  }
}

function dependencyNames(manifest: UnknownRecord): readonly string[] {
  const value = manifest.dependencies;
  if (value === undefined) return [];
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    dependencyFailure('Installed dependency dependencies must be an object.');
  }
  const result = value as UnknownRecord;
  for (const [name, range] of Object.entries(result)) {
    if (name.length === 0 || typeof range !== 'string' || range.length === 0) {
      dependencyFailure('Installed dependency declaration is invalid.');
    }
  }
  return Object.keys(result).sort();
}

function dependencyPath(name: string): readonly string[] {
  return name.startsWith('@') ? name.split('/') : [name];
}

function resolveInstalledPackage(from: string, name: string, boundary: string): string {
  const segments = dependencyPath(name);
  let cursor = realpathSync(from);
  const root = realpathSync(boundary);
  while (
    cursor === root ||
    (!relative(root, cursor).startsWith('..') && !isAbsolute(relative(root, cursor)))
  ) {
    for (const candidate of [
      resolve(cursor, 'node_modules', ...segments),
      resolve(dirname(cursor), ...segments),
    ]) {
      try {
        const resolved = realpathSync(candidate);
        const within = relative(root, resolved);
        if (
          within.startsWith('..') ||
          isAbsolute(within) ||
          !lstatSync(resolve(resolved, 'package.json')).isFile()
        ) {
          dependencyFailure(`${name} resolves outside the frozen worktree.`);
        }
        return resolved;
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') continue;
        throw error;
      }
    }
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return dependencyFailure(`Installed production dependency ${name} cannot be resolved.`);
}

function legalFiles(packageDirectory: string): readonly PackageFile[] {
  return readdirSync(packageDirectory)
    .filter((name) => legalFilePattern.test(name))
    .sort()
    .map((path) => {
      const absolute = resolve(packageDirectory, path);
      if (!lstatSync(absolute).isFile()) {
        dependencyFailure(`Installed legal evidence ${path} must be a regular file.`);
      }
      return { path, bytes: readFileSync(absolute) };
    });
}

function packageIdentity(manifest: UnknownRecord): {
  readonly name: string;
  readonly version: string;
} {
  if (typeof manifest.name !== 'string' || typeof manifest.version !== 'string') {
    dependencyFailure('Installed dependency is missing its exact name or version.');
  }
  return { name: manifest.name, version: manifest.version };
}

export function readInstalledProductionDependencies(
  worktree: string,
  packageAudit: PackageAuditEvidence,
): readonly ProductionDependencyInput[] {
  const boundary = realpathSync(worktree);
  const roots = new Map<string, string>();
  for (const package_ of packageAudit.packages) {
    for (const [name, version] of Object.entries(package_.dependencies)) {
      if (!name.startsWith('@wayglass/')) roots.set(name, version);
    }
  }

  const paths = new Map<string, string>();
  for (const [name, version] of [...roots].sort(([left], [right]) => left.localeCompare(right))) {
    const owner = packageAudit.packages.find((package_) => package_.dependencies[name] === version);
    if (owner === undefined)
      dependencyFailure(`Production root ${name} has no release-unit owner.`);
    const path = resolveInstalledPackage(
      resolve(worktree, 'packages', owner.directory),
      name,
      boundary,
    );
    const identity = packageIdentity(manifestAt(path).value);
    if (identity.name !== name || identity.version !== version) {
      dependencyFailure(`Production root ${name}@${version} resolved to a different package.`);
    }
    paths.set(`${name}@${version}`, path);
  }

  const result = new Map<string, ProductionDependencyInput>();
  const queue = [...paths].sort(([left], [right]) => left.localeCompare(right));
  while (queue.length > 0) {
    const [expectedId, packageDirectory] = queue.shift()!;
    if (result.has(expectedId)) continue;
    const manifest = manifestAt(packageDirectory);
    const identity = packageIdentity(manifest.value);
    const id = `${identity.name}@${identity.version}`;
    if (id !== expectedId) dependencyFailure(`${expectedId} resolved to ${id}.`);
    const resolvedDependencies: Record<string, string> = {};
    for (const dependency of dependencyNames(manifest.value)) {
      const dependencyDirectory = resolveInstalledPackage(packageDirectory, dependency, boundary);
      const resolved = packageIdentity(manifestAt(dependencyDirectory).value);
      if (resolved.name !== dependency) {
        dependencyFailure(`${id} dependency ${dependency} resolved to ${resolved.name}.`);
      }
      resolvedDependencies[dependency] = resolved.version;
      queue.push([`${resolved.name}@${resolved.version}`, dependencyDirectory]);
    }
    result.set(id, {
      files: [{ path: 'package.json', bytes: manifest.bytes }, ...legalFiles(packageDirectory)],
      resolvedDependencies,
    });
  }
  return Object.freeze(
    [...result].sort(([left], [right]) => left.localeCompare(right)).map(([, input]) => input),
  );
}
