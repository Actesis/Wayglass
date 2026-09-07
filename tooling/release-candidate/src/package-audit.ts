import {
  acceptedDocumentHashes,
  candidateDirectories,
  expectedDependencies,
  expectedPeerDependencies,
  expectedSideEffects,
} from './constants.ts';
import { serializeCanonicalJson } from './canonical-json.ts';
import { fail } from './error.ts';
import { sha256 } from './hash.ts';
import { inspectPackageFiles } from './inspection.ts';
import { serializeProjectedManifest } from './manifest.ts';
import type { CandidateDirectory, JsonValue, PackageFile, ProjectedManifest } from './types.ts';

export interface PackedPackageAuditInput {
  readonly directory: CandidateDirectory;
  readonly manifest: ProjectedManifest;
  readonly files: readonly PackageFile[];
}

export interface PackageSourceMapAudit {
  readonly path: string;
  readonly sources: readonly string[];
  readonly sourcesContentAbsent: true;
  readonly absoluteSourcesAbsent: true;
}

export interface PackageAuditEntry {
  readonly directory: CandidateDirectory;
  readonly name: string;
  readonly version: '0.1.0';
  readonly private: true;
  readonly manifestSha256: string;
  readonly licenseSha256: string;
  readonly noticeSha256: string;
  readonly fileCount: number;
  readonly unpackedBytes: number;
  readonly inventorySha256: string;
  readonly exports: readonly string[];
  readonly dependencies: Readonly<Record<string, string>>;
  readonly peerDependencies: Readonly<Record<string, string>>;
  readonly sideEffects: boolean | readonly string[];
  readonly lifecycleScriptsAbsent: true;
  readonly privateFilesAbsent: true;
  readonly sourceMaps: readonly PackageSourceMapAudit[];
}

export interface PackageAuditEvidence {
  readonly schemaVersion: 1;
  readonly packages: readonly PackageAuditEntry[];
}

type UnknownRecord = Readonly<Record<string, unknown>>;
const decoder = new TextDecoder('utf-8', { fatal: true });
const digestPattern = /^[a-f0-9]{64}$/;
const absoluteSourcePattern = /^(?:\/|[A-Za-z]:[\\/]|(?:file|https?):|\\\\)/;

function isSortedUnique(values: readonly string[]): boolean {
  return (
    new Set(values).size === values.length &&
    JSON.stringify(values) === JSON.stringify([...values].sort())
  );
}

function auditFailure(message: string): never {
  return fail('WG_RC_PACKAGE_AUDIT', message);
}

function exactObject(value: unknown, keys: readonly string[], label: string): UnknownRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return auditFailure(`${label} must be an object.`);
  }
  const record = value as UnknownRecord;
  if (JSON.stringify(Object.keys(record).sort()) !== JSON.stringify([...keys].sort())) {
    return auditFailure(`${label} has missing or unknown fields.`);
  }
  return record;
}

function exportsFrom(value: JsonValue): readonly string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(exportsFrom);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(exportsFrom);
  return [];
}

function mapAudit(file: PackageFile): PackageSourceMapAudit | undefined {
  if (!file.path.endsWith('.map')) return undefined;
  const map = JSON.parse(decoder.decode(file.bytes)) as { readonly sources: readonly string[] };
  return Object.freeze({
    path: file.path,
    sources: Object.freeze([...map.sources]),
    sourcesContentAbsent: true,
    absoluteSourcesAbsent: true,
  });
}

function sameMap(
  value: Readonly<Record<string, string>> | undefined,
  expected: Readonly<Record<string, string>> | undefined,
): boolean {
  return JSON.stringify(value) === JSON.stringify(expected);
}

function validateProjectedManifest(
  directory: CandidateDirectory,
  manifest: ProjectedManifest,
): void {
  const expectedKeys = [
    'name',
    'version',
    'private',
    'description',
    'license',
    'author',
    'homepage',
    'repository',
    'bugs',
    'keywords',
    'publishConfig',
    'type',
    'sideEffects',
    'engines',
    'files',
    'exports',
    ...(expectedDependencies[directory] === undefined ? [] : ['dependencies']),
    ...(expectedPeerDependencies[directory] === undefined ? [] : ['peerDependencies']),
  ];
  exactObject(manifest, expectedKeys, `${directory} projected manifest`);
  if (
    manifest.name !== `@wayglass/${directory}` ||
    manifest.version !== '0.1.0' ||
    manifest.private !== true ||
    manifest.license !== 'Apache-2.0' ||
    manifest.type !== 'module' ||
    !sameMap(manifest.dependencies, expectedDependencies[directory]) ||
    !sameMap(manifest.peerDependencies, expectedPeerDependencies[directory]) ||
    JSON.stringify(manifest.sideEffects) !== JSON.stringify(expectedSideEffects[directory])
  ) {
    auditFailure(`${directory} projected manifest differs from the accepted package contract.`);
  }
}

export function auditPackedPackages(
  inputs: readonly PackedPackageAuditInput[],
): PackageAuditEvidence {
  if (
    inputs.length !== candidateDirectories.length ||
    JSON.stringify(inputs.map(({ directory }) => directory)) !==
      JSON.stringify(candidateDirectories)
  ) {
    auditFailure('Packed audit inputs must contain all six packages in accepted order.');
  }
  const packages = inputs.map(({ directory, manifest, files }) => {
    validateProjectedManifest(directory, manifest);
    const inspection = inspectPackageFiles(files, manifest);
    const byPath = new Map(files.map((file) => [file.path, file]));
    const packageJson = byPath.get('package.json');
    const license = byPath.get('LICENSE');
    const notice = byPath.get('NOTICE');
    if (packageJson === undefined || license === undefined || notice === undefined) {
      return auditFailure(`${manifest.name} is missing required audit files.`);
    }
    if (decoder.decode(packageJson.bytes) !== serializeProjectedManifest(manifest)) {
      return auditFailure(`${manifest.name} manifest bytes differ from the accepted projection.`);
    }
    if (
      sha256(license.bytes) !== acceptedDocumentHashes.license ||
      sha256(notice.bytes) !== acceptedDocumentHashes.notice
    ) {
      return auditFailure(`${manifest.name} license or notice bytes differ from the frozen roots.`);
    }
    const sourceMaps = files
      .map(mapAudit)
      .filter((value): value is PackageSourceMapAudit => value !== undefined)
      .sort((left, right) => left.path.localeCompare(right.path));
    return Object.freeze({
      directory,
      name: manifest.name,
      version: '0.1.0' as const,
      private: true as const,
      manifestSha256: sha256(packageJson.bytes),
      licenseSha256: sha256(license.bytes),
      noticeSha256: sha256(notice.bytes),
      fileCount: inspection.files.length,
      unpackedBytes: inspection.totalBytes,
      inventorySha256: inspection.inventorySha256,
      exports: Object.freeze([...new Set(exportsFrom(manifest.exports))].sort()),
      dependencies: Object.freeze({ ...(manifest.dependencies ?? {}) }),
      peerDependencies: Object.freeze({ ...(manifest.peerDependencies ?? {}) }),
      sideEffects: manifest.sideEffects,
      lifecycleScriptsAbsent: true as const,
      privateFilesAbsent: true as const,
      sourceMaps: Object.freeze(sourceMaps),
    });
  });
  return Object.freeze({ schemaVersion: 1, packages: Object.freeze(packages) });
}

function stringMap(value: unknown, label: string): Readonly<Record<string, string>> {
  const record =
    value === null || typeof value !== 'object' || Array.isArray(value)
      ? auditFailure(`${label} must be an object.`)
      : (value as UnknownRecord);
  const result: Record<string, string> = {};
  for (const key of Object.keys(record).sort()) {
    if (typeof record[key] !== 'string') auditFailure(`${label}.${key} must be a string.`);
    result[key] = record[key];
  }
  return result;
}

export function validatePackageAudit(value: unknown): PackageAuditEvidence {
  const evidence = exactObject(value, ['schemaVersion', 'packages'], 'package audit');
  if (evidence.schemaVersion !== 1 || !Array.isArray(evidence.packages)) {
    auditFailure('Package audit must use schema version 1 with a package array.');
  }
  if (evidence.packages.length !== candidateDirectories.length) {
    auditFailure('Package audit must contain all six packages.');
  }
  for (const [index, value_] of evidence.packages.entries()) {
    const directory = candidateDirectories[index]!;
    const entry = exactObject(
      value_,
      [
        'directory',
        'name',
        'version',
        'private',
        'manifestSha256',
        'licenseSha256',
        'noticeSha256',
        'fileCount',
        'unpackedBytes',
        'inventorySha256',
        'exports',
        'dependencies',
        'peerDependencies',
        'sideEffects',
        'lifecycleScriptsAbsent',
        'privateFilesAbsent',
        'sourceMaps',
      ],
      `packages[${String(index)}]`,
    );
    if (
      entry.directory !== directory ||
      entry.name !== `@wayglass/${directory}` ||
      entry.version !== '0.1.0' ||
      entry.private !== true ||
      entry.lifecycleScriptsAbsent !== true ||
      entry.privateFilesAbsent !== true ||
      !Number.isSafeInteger(entry.fileCount) ||
      (entry.fileCount as number) < 5 ||
      !Number.isSafeInteger(entry.unpackedBytes) ||
      (entry.unpackedBytes as number) < 1 ||
      ![entry.manifestSha256, entry.licenseSha256, entry.noticeSha256, entry.inventorySha256].every(
        (checksum) => typeof checksum === 'string' && digestPattern.test(checksum),
      ) ||
      entry.licenseSha256 !== acceptedDocumentHashes.license ||
      entry.noticeSha256 !== acceptedDocumentHashes.notice ||
      JSON.stringify(stringMap(entry.dependencies, `${directory}.dependencies`)) !==
        JSON.stringify(expectedDependencies[directory] ?? {}) ||
      JSON.stringify(stringMap(entry.peerDependencies, `${directory}.peerDependencies`)) !==
        JSON.stringify(expectedPeerDependencies[directory] ?? {}) ||
      JSON.stringify(entry.sideEffects) !== JSON.stringify(expectedSideEffects[directory])
    ) {
      auditFailure(`${directory} package audit differs from the accepted contract.`);
    }
    if (
      !Array.isArray(entry.exports) ||
      entry.exports.some((target) => typeof target !== 'string') ||
      !isSortedUnique(entry.exports as string[])
    ) {
      auditFailure(`${directory} exports must be unique, sorted strings.`);
    }
    if (!Array.isArray(entry.sourceMaps))
      auditFailure(`${directory} source maps must be an array.`);
    const mapPaths: string[] = [];
    for (const [mapIndex, mapValue] of entry.sourceMaps.entries()) {
      const map = exactObject(
        mapValue,
        ['path', 'sources', 'sourcesContentAbsent', 'absoluteSourcesAbsent'],
        `${directory}.sourceMaps[${String(mapIndex)}]`,
      );
      if (
        typeof map.path !== 'string' ||
        !map.path.endsWith('.map') ||
        !Array.isArray(map.sources) ||
        map.sources.some(
          (source) => typeof source !== 'string' || absoluteSourcePattern.test(source),
        ) ||
        map.sourcesContentAbsent !== true ||
        map.absoluteSourcesAbsent !== true
      ) {
        auditFailure(`${directory} source-map audit is invalid.`);
      }
      mapPaths.push(map.path);
    }
    if (!isSortedUnique(mapPaths)) {
      auditFailure(`${directory} source-map audits must be unique and sorted.`);
    }
  }
  return value as PackageAuditEvidence;
}

export function serializePackageAudit(value: unknown): string {
  const evidence = validatePackageAudit(value);
  return serializeCanonicalJson(evidence);
}
