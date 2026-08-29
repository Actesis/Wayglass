import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { proofIconCatalog } from '../src/catalog.js';
import {
  detectGeneratedArtifactDrift,
  generatedArtifactNames,
  generateIconArtifacts,
} from '../src/generator.js';
import { IconModelError } from '../src/model.js';

async function committedArtifacts(): Promise<Record<string, string>> {
  return Object.fromEntries(
    await Promise.all(
      generatedArtifactNames.map(async (name) => [
        name,
        await readFile(new URL(`../generated/${name}`, import.meta.url), 'utf8'),
      ]),
    ),
  );
}

describe('Phase 5D-A deterministic generation and drift', () => {
  it('matches every committed candidate artifact byte for byte', async () => {
    const expected = generateIconArtifacts(proofIconCatalog);
    const actual = await committedArtifacts();

    expect(detectGeneratedArtifactDrift(actual, expected)).toEqual([]);
  });

  it('is stable across repeated runs and authored catalog order', () => {
    const first = generateIconArtifacts(proofIconCatalog);
    const second = generateIconArtifacts(proofIconCatalog);
    const reversed = generateIconArtifacts([...proofIconCatalog].reverse());

    expect(second).toEqual(first);
    expect(reversed).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
  });

  it('reports changed, missing, and unexpected artifacts in stable order', () => {
    const expected = generateIconArtifacts(proofIconCatalog);
    const actual: Record<string, string> = {
      'runtime-catalog.ts': `${expected['runtime-catalog.ts']}hand edit`,
      'output-manifest.json': expected['output-manifest.json'],
      'untracked.svg': '<svg />',
    };

    expect(detectGeneratedArtifactDrift(actual, expected)).toEqual([
      { artifact: 'runtime-catalog.ts', kind: 'changed' },
      { artifact: 'source-manifest.json', kind: 'missing' },
      { artifact: 'untracked.svg', kind: 'unexpected' },
    ]);
  });

  it('limits an intentional geometry revision to the affected source identity and outputs', () => {
    const baseline = generateIconArtifacts(proofIconCatalog);
    const revised = structuredClone(proofIconCatalog) as unknown as Array<{
      primitives: Array<{ type: string; commands: Array<{ x: number }> }>;
    }>;
    const closePath = revised[0]!.primitives[0]!;
    if (closePath.type !== 'path') throw new Error('Expected the close fixture to contain a path.');
    closePath.commands[0]!.x = 5;

    const changed = generateIconArtifacts(revised);
    const baselineManifest = JSON.parse(baseline['source-manifest.json']) as {
      icons: Array<{ id: string; fingerprint: string }>;
    };
    const changedManifest = JSON.parse(changed['source-manifest.json']) as typeof baselineManifest;

    expect(changed).not.toEqual(baseline);
    expect(
      changedManifest.icons
        .filter((icon, index) => icon.fingerprint !== baselineManifest.icons[index]?.fingerprint)
        .map(({ id }) => id),
    ).toEqual(['close']);
  });

  it('fails before producing replacement artifacts when source validation fails', () => {
    const retained = generateIconArtifacts(proofIconCatalog);
    const invalid = structuredClone(proofIconCatalog) as unknown as Array<{ id: string }>;
    invalid[0]!.id = 'Close icon';

    expect(() => generateIconArtifacts(invalid)).toThrow(IconModelError);
    expect(generateIconArtifacts(proofIconCatalog)).toEqual(retained);
  });
});
