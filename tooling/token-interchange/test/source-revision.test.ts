import { describe, expect, it } from 'vitest';

import { tokenToolingExitCode } from '../src/command.js';
import { authenticateSourceRevision } from '../src/source-revision.js';

const revision = '0123456789abcdef0123456789abcdef01234567';

describe('authenticated source revision', () => {
  it('accepts the exact checked-out revision when tracked files are clean', () => {
    expect(() =>
      authenticateSourceRevision(revision.toUpperCase(), {
        headRevision: revision,
        trackedChanges: [],
      }),
    ).not.toThrow();
  });

  it('rejects a revision other than the checked-out commit', () => {
    expect(() =>
      authenticateSourceRevision('abcdef0123456789abcdef0123456789abcdef01', {
        headRevision: revision,
        trackedChanges: [],
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WG-TOKEN-AUTH-001',
        exitCode: tokenToolingExitCode.failure,
      }),
    );
  });

  it('rejects tracked changes without including their paths in the diagnostic', () => {
    expect(() =>
      authenticateSourceRevision(revision, {
        headRevision: revision,
        trackedChanges: ['packages/tokens/src/definitions.ts'],
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WG-TOKEN-AUTH-002',
        message: 'Authenticated token tooling requires a checkout with no tracked changes.',
        exitCode: tokenToolingExitCode.failure,
      }),
    );
  });
});
