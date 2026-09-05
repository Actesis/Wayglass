import { candidateDirectories } from './constants.ts';
import { fail } from './error.ts';
import type { PackedCandidate } from './types.ts';

export function assertReproducibleCandidates(
  first: readonly PackedCandidate[],
  second: readonly PackedCandidate[],
): void {
  const expected = JSON.stringify(candidateDirectories);
  if (
    JSON.stringify(first.map(({ directory }) => directory)) !== expected ||
    JSON.stringify(second.map(({ directory }) => directory)) !== expected
  ) {
    fail(
      'WG_RC_REPRODUCIBILITY_INVENTORY',
      'Assembly passes must contain the exact package order.',
    );
  }
  if (JSON.stringify(first) !== JSON.stringify(second)) {
    fail('WG_RC_REPRODUCIBILITY', 'Two fresh assembly passes produced different package bytes.');
  }
}
