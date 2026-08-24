import { createHash } from 'node:crypto';

import type { DtcgExchange } from './dtcg.ts';

export interface ArtifactDrift {
  readonly added: readonly string[];
  readonly changed: readonly string[];
  readonly removed: readonly string[];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

export function verifyDtcgExchange(exchange: DtcgExchange): void {
  const manifestPath = 'wayglass-manifest.json';
  const expectedPaths = Object.keys(exchange.manifest.artifacts).sort(compareText);
  const actualPaths = Object.keys(exchange.files)
    .filter((path) => path !== manifestPath)
    .sort(compareText);

  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
    throw new Error(
      `DTCG exchange artifact inventory mismatch: expected [${expectedPaths.join(', ')}], received [${actualPaths.join(', ')}].`,
    );
  }

  for (const path of expectedPaths) {
    const content = exchange.files[path];
    const measurement = exchange.manifest.artifacts[path];
    if (content === undefined || measurement === undefined) {
      throw new Error(`DTCG exchange artifact "${path}" is missing.`);
    }

    const actualHash = sha256(content);
    if (actualHash !== measurement.sha256) {
      throw new Error(
        `DTCG exchange artifact "${path}" failed SHA-256 verification: expected ${measurement.sha256}, received ${actualHash}.`,
      );
    }

    const actualBytes = Buffer.byteLength(content, 'utf8');
    if (actualBytes !== measurement.bytes) {
      throw new Error(
        `DTCG exchange artifact "${path}" byte count mismatch: expected ${measurement.bytes}, received ${actualBytes}.`,
      );
    }
  }

  const serializedManifest = exchange.files[manifestPath];
  if (serializedManifest === undefined) {
    throw new Error(`DTCG exchange manifest "${manifestPath}" is missing.`);
  }

  if (serializedManifest !== `${JSON.stringify(exchange.manifest, null, 2)}\n`) {
    throw new Error('DTCG exchange manifest object and serialized artifact do not match.');
  }
}

export function compareDtcgArtifacts(
  baseline: DtcgExchange,
  candidate: DtcgExchange,
): ArtifactDrift {
  const baselinePaths = new Set(Object.keys(baseline.manifest.artifacts));
  const candidatePaths = new Set(Object.keys(candidate.manifest.artifacts));

  return {
    added: [...candidatePaths].filter((path) => !baselinePaths.has(path)).sort(compareText),
    changed: [...candidatePaths]
      .filter(
        (path) =>
          baselinePaths.has(path) &&
          baseline.manifest.artifacts[path]?.sha256 !== candidate.manifest.artifacts[path]?.sha256,
      )
      .sort(compareText),
    removed: [...baselinePaths].filter((path) => !candidatePaths.has(path)).sort(compareText),
  };
}
