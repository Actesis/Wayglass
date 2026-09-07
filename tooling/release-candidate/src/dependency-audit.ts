import {
  candidateDirectories,
  expectedDependencies,
  expectedPeerDependencies,
} from './constants.ts';
import { serializeCanonicalJson } from './canonical-json.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { validatePackageAudit, type PackageAuditEvidence } from './package-audit.ts';
import type { PackageFile } from './types.ts';

export interface ProductionDependencyInput {
  readonly files: readonly PackageFile[];
  readonly resolvedDependencies: Readonly<Record<string, string>>;
}

export interface DependencyFileEvidence {
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface ResolvedDependencyEdge {
  readonly name: string;
  readonly version: string;
}

export interface ProductionDependencyEvidence {
  readonly name: string;
  readonly version: string;
  readonly packageJsonSha256: string;
  readonly declaredLicense: string;
  readonly licenseFiles: readonly DependencyFileEvidence[];
  readonly lifecycleScripts: readonly string[];
  readonly dependencies: readonly ResolvedDependencyEdge[];
  readonly peerDependencies: Readonly<Record<string, string>>;
}

export interface ReleaseUnitDependencyEvidence {
  readonly name: string;
  readonly dependencies: Readonly<Record<string, string>>;
  readonly peerDependencies: Readonly<Record<string, string>>;
}

export interface DependencyAuditEvidence {
  readonly schemaVersion: 1;
  readonly releaseUnits: readonly ReleaseUnitDependencyEvidence[];
  readonly productionRoots: readonly ResolvedDependencyEdge[];
  readonly productionGraph: readonly ProductionDependencyEvidence[];
  readonly allProductionNodesReachable: true;
}

type UnknownRecord = Readonly<Record<string, unknown>>;
const decoder = new TextDecoder('utf-8', { fatal: true });
const digestPattern = /^[a-f0-9]{64}$/;
const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const lifecycleNames = new Set([
  'preinstall',
  'install',
  'postinstall',
  'prepare',
  'prepack',
  'postpack',
  'publish',
  'prepublish',
  'prepublishonly',
  'postpublish',
]);

function dependencyFailure(message: string): never {
  return fail('WG_RC_DEPENDENCY_AUDIT', message);
}

function record(value: unknown, label: string): UnknownRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return dependencyFailure(`${label} must be an object.`);
  }
  return value as UnknownRecord;
}

function exactObject(value: unknown, keys: readonly string[], label: string): UnknownRecord {
  const result = record(value, label);
  if (JSON.stringify(Object.keys(result).sort()) !== JSON.stringify([...keys].sort())) {
    return dependencyFailure(`${label} has missing or unknown fields.`);
  }
  return result;
}

function string(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    return dependencyFailure(`${label} must be a non-empty string.`);
  }
  return value;
}

function stringMap(value: unknown, label: string): Readonly<Record<string, string>> {
  if (value === undefined) return {};
  const input = record(value, label);
  const result: Record<string, string> = {};
  for (const name of Object.keys(input).sort()) {
    result[name] = string(input[name], `${label}.${name}`);
  }
  return result;
}

function nodeId(name: string, version: string): string {
  return `${name}@${version}`;
}

function exactEdge(value: unknown, label: string): ResolvedDependencyEdge {
  const edge = exactObject(value, ['name', 'version'], label);
  const name = string(edge.name, `${label}.name`);
  const version = string(edge.version, `${label}.version`);
  if (name.startsWith('@wayglass/') || !exactVersionPattern.test(version)) {
    dependencyFailure(`${label} must identify an exact external package version.`);
  }
  return { name, version };
}

function isSortedUnique(values: readonly string[]): boolean {
  return (
    new Set(values).size === values.length &&
    JSON.stringify(values) === JSON.stringify([...values].sort())
  );
}

function licensePath(path: string): boolean {
  return /^(?:licen[cs]e|copying|notice)(?:[._-].*)?$/i.test(path);
}

function parseDependencyInput(input: ProductionDependencyInput): {
  readonly evidence: ProductionDependencyEvidence;
  readonly id: string;
} {
  const regularFiles = input.files.filter(({ kind = 'file' }) => kind === 'file');
  if (regularFiles.length !== input.files.length) {
    dependencyFailure('Production dependency evidence files must be regular files.');
  }
  const paths = regularFiles.map(({ path }) => path);
  if (new Set(paths).size !== paths.length)
    dependencyFailure('Dependency evidence paths duplicate.');
  const packageJson = regularFiles.find(({ path }) => path === 'package.json');
  if (packageJson === undefined)
    dependencyFailure('Production dependency is missing package.json.');
  let manifest: UnknownRecord;
  try {
    manifest = record(JSON.parse(decoder.decode(packageJson.bytes)), 'dependency package.json');
  } catch {
    return dependencyFailure('Production dependency package.json must be valid UTF-8 JSON.');
  }
  const name = string(manifest.name, 'dependency name');
  const version = string(manifest.version, `${name} version`);
  if (name.startsWith('@wayglass/')) {
    dependencyFailure('Production dependency graph cannot duplicate a Wayglass release unit.');
  }
  const declaredLicense = string(manifest.license, `${name}@${version} license`);
  const dependencies = stringMap(manifest.dependencies, `${name}@${version}.dependencies`);
  const resolved = stringMap(input.resolvedDependencies, `${name}@${version}.resolvedDependencies`);
  if (JSON.stringify(Object.keys(dependencies)) !== JSON.stringify(Object.keys(resolved))) {
    dependencyFailure(`${name}@${version} resolved dependencies do not match its manifest.`);
  }
  const resolvedEdges = Object.entries(resolved).map(([dependency, resolvedVersion]) =>
    Object.freeze({ name: dependency, version: resolvedVersion }),
  );
  const scripts = stringMap(manifest.scripts, `${name}@${version}.scripts`);
  const lifecycleScripts = Object.keys(scripts)
    .filter((script) => lifecycleNames.has(script.toLowerCase()))
    .sort();
  const licenseFiles = regularFiles
    .filter(({ path }) => licensePath(path))
    .map(({ path, bytes }) =>
      Object.freeze({ path, bytes: bytes.byteLength, sha256: sha256(bytes) }),
    )
    .sort((left, right) => left.path.localeCompare(right.path));
  if (licenseFiles.length === 0) {
    dependencyFailure(`${name}@${version} has no retained license or notice file evidence.`);
  }
  return {
    id: nodeId(name, version),
    evidence: Object.freeze({
      name,
      version,
      packageJsonSha256: sha256(packageJson.bytes),
      declaredLicense,
      licenseFiles: Object.freeze(licenseFiles),
      lifecycleScripts: Object.freeze(lifecycleScripts),
      dependencies: Object.freeze(resolvedEdges),
      peerDependencies: Object.freeze({
        ...stringMap(manifest.peerDependencies, `${name}@${version}.peerDependencies`),
      }),
    }),
  };
}

function releaseUnitsFrom(
  packageAudit: PackageAuditEvidence,
): readonly ReleaseUnitDependencyEvidence[] {
  return Object.freeze(
    packageAudit.packages.map((package_) =>
      Object.freeze({
        name: package_.name,
        dependencies: package_.dependencies,
        peerDependencies: package_.peerDependencies,
      }),
    ),
  );
}

function rootsFromReleaseUnits(
  packages: readonly Pick<ReleaseUnitDependencyEvidence, 'dependencies'>[],
): readonly ResolvedDependencyEdge[] {
  const roots = new Map<string, string>();
  for (const package_ of packages) {
    for (const [name, version] of Object.entries(package_.dependencies)) {
      if (name.startsWith('@wayglass/')) continue;
      const existing = roots.get(name);
      if (existing !== undefined && existing !== version) {
        dependencyFailure(`Production root ${name} has conflicting exact versions.`);
      }
      if (!exactVersionPattern.test(version)) {
        dependencyFailure(`Production root ${name} must use an exact version.`);
      }
      roots.set(name, version);
    }
  }
  return Object.freeze(
    [...roots]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, version]) => Object.freeze({ name, version })),
  );
}

function productionRoots(packageAudit: PackageAuditEvidence): readonly ResolvedDependencyEdge[] {
  return rootsFromReleaseUnits(packageAudit.packages);
}

export function auditProductionDependencies(
  packageAuditInput: unknown,
  inputs: readonly ProductionDependencyInput[],
): DependencyAuditEvidence {
  const packageAudit = validatePackageAudit(packageAuditInput);
  const parsed = inputs
    .map(parseDependencyInput)
    .sort((left, right) => left.id.localeCompare(right.id));
  const byId = new Map(parsed.map((node) => [node.id, node.evidence]));
  if (byId.size !== parsed.length) dependencyFailure('Production dependency nodes must be unique.');
  const roots = productionRoots(packageAudit);
  for (const root of roots) {
    if (!byId.has(nodeId(root.name, root.version))) {
      dependencyFailure(`Production graph is missing root ${root.name}@${root.version}.`);
    }
  }
  for (const node of byId.values()) {
    for (const dependency of node.dependencies) {
      if (!byId.has(nodeId(dependency.name, dependency.version))) {
        dependencyFailure(
          `${node.name}@${node.version} resolves missing ${dependency.name}@${dependency.version}.`,
        );
      }
    }
  }
  const reachable = new Set<string>();
  const queue = roots.map(({ name, version }) => nodeId(name, version));
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const dependency of byId.get(id)!.dependencies) {
      queue.push(nodeId(dependency.name, dependency.version));
    }
  }
  if (reachable.size !== byId.size) {
    dependencyFailure('Production graph contains an unreachable or development-only node.');
  }
  return Object.freeze({
    schemaVersion: 1,
    releaseUnits: releaseUnitsFrom(packageAudit),
    productionRoots: roots,
    productionGraph: Object.freeze(parsed.map(({ evidence }) => evidence)),
    allProductionNodesReachable: true,
  });
}

export function validateDependencyAudit(value: unknown): DependencyAuditEvidence {
  const evidence = exactObject(
    value,
    [
      'schemaVersion',
      'releaseUnits',
      'productionRoots',
      'productionGraph',
      'allProductionNodesReachable',
    ],
    'dependency audit',
  );
  if (
    evidence.schemaVersion !== 1 ||
    evidence.allProductionNodesReachable !== true ||
    !Array.isArray(evidence.releaseUnits) ||
    !Array.isArray(evidence.productionRoots) ||
    !Array.isArray(evidence.productionGraph)
  ) {
    dependencyFailure('Dependency audit has an invalid root shape.');
  }
  if (evidence.releaseUnits.length !== candidateDirectories.length) {
    dependencyFailure('Dependency audit must contain all six release units.');
  }
  evidence.releaseUnits.forEach((value_, index) => {
    const directory = candidateDirectories[index]!;
    const unit = exactObject(
      value_,
      ['name', 'dependencies', 'peerDependencies'],
      `releaseUnits[${String(index)}]`,
    );
    if (
      unit.name !== `@wayglass/${directory}` ||
      JSON.stringify(stringMap(unit.dependencies, `${directory}.dependencies`)) !==
        JSON.stringify(expectedDependencies[directory] ?? {}) ||
      JSON.stringify(stringMap(unit.peerDependencies, `${directory}.peerDependencies`)) !==
        JSON.stringify(expectedPeerDependencies[directory] ?? {})
    ) {
      dependencyFailure(`${directory} dependency evidence differs from the accepted contract.`);
    }
  });
  const expectedRoots = rootsFromReleaseUnits(
    candidateDirectories.map((directory) => ({
      name: `@wayglass/${directory}`,
      dependencies: expectedDependencies[directory] ?? {},
    })),
  );
  const rootEdges = (evidence.productionRoots as unknown[]).map((value_, index) =>
    exactEdge(value_, `productionRoots[${String(index)}]`),
  );
  if (JSON.stringify(rootEdges) !== JSON.stringify(expectedRoots)) {
    dependencyFailure('Production roots differ from the accepted release-unit dependencies.');
  }
  const roots = rootEdges.map(({ name, version }) => nodeId(name, version));
  const nodes = (evidence.productionGraph as unknown[]).map((value_, index) => {
    const node = exactObject(
      value_,
      [
        'name',
        'version',
        'packageJsonSha256',
        'declaredLicense',
        'licenseFiles',
        'lifecycleScripts',
        'dependencies',
        'peerDependencies',
      ],
      `productionGraph[${String(index)}]`,
    );
    const name = string(node.name, 'node name');
    const version = string(node.version, 'node version');
    if (name.startsWith('@wayglass/') || !exactVersionPattern.test(version)) {
      dependencyFailure(`${name}@${version} is not an exact external dependency node.`);
    }
    if (typeof node.packageJsonSha256 !== 'string' || !digestPattern.test(node.packageJsonSha256)) {
      dependencyFailure(`${name}@${version} package manifest hash is invalid.`);
    }
    string(node.declaredLicense, `${name}@${version} license`);
    if (!Array.isArray(node.licenseFiles) || node.licenseFiles.length === 0) {
      dependencyFailure(`${name}@${version} license file evidence is missing.`);
    }
    const licensePaths = node.licenseFiles.map((fileValue, fileIndex) => {
      const file = exactObject(
        fileValue,
        ['path', 'bytes', 'sha256'],
        `${name}.licenseFiles[${String(fileIndex)}]`,
      );
      if (
        typeof file.path !== 'string' ||
        !licensePath(file.path) ||
        !Number.isSafeInteger(file.bytes) ||
        (file.bytes as number) < 1 ||
        typeof file.sha256 !== 'string' ||
        !digestPattern.test(file.sha256)
      ) {
        dependencyFailure(`${name}@${version} license file evidence is invalid.`);
      }
      return file.path as string;
    });
    if (!isSortedUnique(licensePaths)) {
      dependencyFailure(`${name}@${version} license files must be unique and sorted.`);
    }
    if (
      !Array.isArray(node.lifecycleScripts) ||
      node.lifecycleScripts.some(
        (name_) => typeof name_ !== 'string' || !lifecycleNames.has(name_.toLowerCase()),
      )
    ) {
      dependencyFailure(`${name}@${version} lifecycle script evidence is invalid.`);
    }
    if (!isSortedUnique(node.lifecycleScripts as string[])) {
      dependencyFailure(`${name}@${version} lifecycle scripts must be unique and sorted.`);
    }
    if (!Array.isArray(node.dependencies))
      dependencyFailure(`${name}@${version} dependencies must be an array.`);
    const dependencies = node.dependencies.map((edgeValue, edgeIndex) =>
      exactEdge(edgeValue, `${name}.dependencies[${String(edgeIndex)}]`),
    );
    const dependencyIds = dependencies.map((edge) => nodeId(edge.name, edge.version));
    if (!isSortedUnique(dependencyIds)) {
      dependencyFailure(`${name}@${version} dependency edges must be unique and sorted.`);
    }
    stringMap(node.peerDependencies, `${name}@${version}.peerDependencies`);
    return { id: nodeId(name, version), dependencies: dependencyIds };
  });
  const nodeIds = nodes.map(({ id }) => id);
  if (!isSortedUnique(nodeIds) || !isSortedUnique(roots)) {
    dependencyFailure('Dependency roots and nodes must be unique and sorted.');
  }
  const nodeSet = new Set(nodeIds);
  if (roots.some((root) => !nodeSet.has(root)))
    dependencyFailure('Dependency root is missing from graph.');
  for (const node of nodes) {
    if (node.dependencies.some((dependency) => !nodeSet.has(dependency))) {
      dependencyFailure(`${node.id} resolves a dependency missing from the graph.`);
    }
  }
  const byId = new Map(nodes.map((node) => [node.id, node.dependencies]));
  const reachable = new Set<string>();
  const queue = [...roots];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    queue.push(...byId.get(id)!);
  }
  if (reachable.size !== nodes.length) {
    dependencyFailure('Dependency graph contains an unreachable or development-only node.');
  }
  return value as DependencyAuditEvidence;
}

export function serializeDependencyAudit(value: unknown): string {
  const evidence = validateDependencyAudit(value);
  return serializeCanonicalJson(evidence);
}
