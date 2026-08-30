import { createHash } from 'node:crypto';

import {
  generatedArtifactPaths,
  type GeneratedArtifactPath,
  type GeneratedIconArtifacts,
} from './generation.ts';

const runtimePath = generatedArtifactPaths[0];
const sourceManifestPath = generatedArtifactPaths[1];
const outputManifestPath = generatedArtifactPaths[2];
const reviewPath = generatedArtifactPaths[3];
const authenticatedPaths = [runtimePath, sourceManifestPath, reviewPath] as const;
const fingerprintPattern = /^[0-9a-f]{64}$/;

export class IconIntegrityError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.code = code;
    this.name = 'IconIntegrityError';
  }
}

function fail(code: string, message: string): never {
  throw new IconIntegrityError(code, message);
}

function parseObject(content: string, name: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return fail('WG_ICON_INTEGRITY_JSON', `${name} must contain a JSON object.`);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof IconIntegrityError) throw error;
    return fail('WG_ICON_INTEGRITY_JSON', `${name} is not valid JSON.`);
  }
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], name: string): void {
  if (Object.keys(value).sort().join('\0') !== [...keys].sort().join('\0')) {
    fail('WG_ICON_INTEGRITY_SHAPE', `${name} has an unexpected structure.`);
  }
}

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function sourceFingerprint(artifacts: GeneratedIconArtifacts): string {
  const source = parseObject(artifacts[sourceManifestPath], sourceManifestPath);
  exactKeys(
    source,
    [
      'catalogSchemaVersion',
      'contractRevision',
      'iconCount',
      'iconPackageVersion',
      'icons',
      'sourceFingerprint',
    ],
    sourceManifestPath,
  );
  if (
    source.catalogSchemaVersion !== 1 ||
    source.contractRevision !== 1 ||
    typeof source.iconCount !== 'number' ||
    !Number.isInteger(source.iconCount) ||
    source.iconCount < 1 ||
    !Array.isArray(source.icons) ||
    source.icons.length !== source.iconCount ||
    typeof source.iconPackageVersion !== 'string' ||
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(source.iconPackageVersion) ||
    typeof source.sourceFingerprint !== 'string' ||
    !fingerprintPattern.test(source.sourceFingerprint)
  ) {
    fail('WG_ICON_INTEGRITY_SOURCE', `${sourceManifestPath} is invalid.`);
  }
  return source.sourceFingerprint;
}

export interface IconArtifactIntegrity {
  readonly authenticatedArtifacts: number;
  readonly sourceFingerprint: string;
}

export function verifyGeneratedArtifactIntegrity(
  artifacts: GeneratedIconArtifacts,
): IconArtifactIntegrity {
  if (Object.keys(artifacts).sort().join('\0') !== [...generatedArtifactPaths].sort().join('\0')) {
    fail(
      'WG_ICON_INTEGRITY_INVENTORY',
      'Generated artifact inventory must contain exactly four paths.',
    );
  }
  const fingerprint = sourceFingerprint(artifacts);
  const output = parseObject(artifacts[outputManifestPath], outputManifestPath);
  exactKeys(
    output,
    ['artifacts', 'generator', 'generatorSchemaVersion', 'sourceFingerprint'],
    outputManifestPath,
  );
  if (
    output.generator !== 'wayglass-icon-pipeline' ||
    output.generatorSchemaVersion !== 1 ||
    output.sourceFingerprint !== fingerprint ||
    !Array.isArray(output.artifacts) ||
    output.artifacts.length !== authenticatedPaths.length
  ) {
    fail('WG_ICON_INTEGRITY_OUTPUT', `${outputManifestPath} is invalid.`);
  }

  output.artifacts.forEach((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      fail('WG_ICON_INTEGRITY_ENTRY', `Output manifest artifact ${index} is invalid.`);
    }
    const record = entry as Record<string, unknown>;
    exactKeys(record, ['bytes', 'path', 'sha256'], `Output manifest artifact ${index}`);
    const expectedPath = authenticatedPaths[index];
    if (!expectedPath) {
      fail('WG_ICON_INTEGRITY_ENTRY', `Output manifest artifact ${index} is unexpected.`);
    }
    const content = artifacts[expectedPath];
    if (
      record.path !== expectedPath ||
      record.bytes !== Buffer.byteLength(content, 'utf8') ||
      record.sha256 !== sha256(content)
    ) {
      fail('WG_ICON_INTEGRITY_HASH', `Output manifest authentication failed for ${expectedPath}.`);
    }
  });

  return Object.freeze({
    authenticatedArtifacts: authenticatedPaths.length,
    sourceFingerprint: fingerprint,
  });
}

export function asGeneratedIconArtifacts(
  files: Readonly<Record<string, string>>,
): GeneratedIconArtifacts {
  for (const path of generatedArtifactPaths) {
    if (!Object.hasOwn(files, path)) {
      fail('WG_ICON_INTEGRITY_MISSING', `Required generated artifact ${path} is missing.`);
    }
  }
  return Object.fromEntries(
    generatedArtifactPaths.map((path) => [path, files[path]!]),
  ) as GeneratedIconArtifacts;
}

export function isGeneratedArtifactPath(value: string): value is GeneratedArtifactPath {
  return generatedArtifactPaths.some((path) => path === value);
}
