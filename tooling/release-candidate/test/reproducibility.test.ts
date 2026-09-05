import { describe, expect, it } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { assertReproducibleCandidates } from '../src/reproducibility.ts';
import type { PackedCandidate } from '../src/types.ts';

function candidates(): PackedCandidate[] {
  return candidateDirectories.map((directory) => ({
    directory,
    name: `@wayglass/${directory}`,
    version: '0.1.0',
    file: `wayglass-${directory}-0.1.0.tgz`,
    bytes: 100,
    sha256: 'a'.repeat(64),
    manifestSha256: 'b'.repeat(64),
    inventorySha256: 'c'.repeat(64),
    unpackedBytes: 200,
    files: [],
  }));
}

describe('release-candidate repeated-build comparison', () => {
  it('accepts two exact package sequences with byte-identical evidence', () => {
    const first = candidates();
    expect(() => assertReproducibleCandidates(first, structuredClone(first))).not.toThrow();
  });

  it('rejects missing packages and any artifact drift', () => {
    expect(() =>
      assertReproducibleCandidates(candidates().slice(0, -1), candidates()),
    ).toThrowError(/WG_RC_REPRODUCIBILITY_INVENTORY/);
    const changed = candidates();
    changed[2] = { ...changed[2]!, sha256: 'd'.repeat(64) };
    expect(() => assertReproducibleCandidates(candidates(), changed)).toThrowError(
      /WG_RC_REPRODUCIBILITY/,
    );
  });
});
