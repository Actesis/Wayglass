import { describe, expect, it } from 'vitest';

import { authenticateSourceRevision } from '../src/source-revision.js';
import { createTokenToolingFingerprint } from '../src/fingerprint.js';
import { readRepositorySourceState } from '../src/repository.js';

describe('token-tooling authenticated deterministic fingerprint', () => {
  it('prints one complete fingerprint for cross-environment comparison', () => {
    const sourceRevision = process.env['WAYGLASS_SOURCE_REVISION'];
    expect(sourceRevision, 'Set WAYGLASS_SOURCE_REVISION to the validated commit.').toMatch(
      /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i,
    );
    const repository = readRepositorySourceState();
    authenticateSourceRevision(sourceRevision!, repository);

    const fingerprint = createTokenToolingFingerprint(sourceRevision!);
    process.stdout.write(`WAYGLASS_TOKEN_TOOLING_FINGERPRINT=${JSON.stringify(fingerprint)}\n`);

    expect(fingerprint.graph).toEqual({ tokens: 528, modes: 4, overrides: 197 });
    expect(Object.keys(fingerprint.web)).toHaveLength(3);
    expect(Object.keys(fingerprint.exchange.files)).toHaveLength(7);
  });
});
