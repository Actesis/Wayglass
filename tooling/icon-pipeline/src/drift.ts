import { generatedArtifactPaths, type GeneratedIconArtifacts } from './generation.ts';

export interface ArtifactDrift {
  readonly artifact: string;
  readonly kind: 'changed' | 'missing' | 'unexpected';
}

export function detectGeneratedArtifactDrift(
  actual: Readonly<Record<string, string>>,
  expected: GeneratedIconArtifacts,
): readonly ArtifactDrift[] {
  const expectedPaths = new Set<string>(generatedArtifactPaths);
  const drift: ArtifactDrift[] = [];
  for (const artifact of generatedArtifactPaths) {
    if (!Object.hasOwn(actual, artifact)) drift.push({ artifact, kind: 'missing' });
    else if (actual[artifact] !== expected[artifact]) drift.push({ artifact, kind: 'changed' });
  }
  for (const artifact of Object.keys(actual).sort()) {
    if (!expectedPaths.has(artifact)) drift.push({ artifact, kind: 'unexpected' });
  }
  return Object.freeze(drift);
}
