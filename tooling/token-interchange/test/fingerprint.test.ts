import { describe, expect, it } from 'vitest';

import { createTokenToolingFingerprint, measureArtifact } from '../src/fingerprint.js';

const revision = '0123456789abcdef0123456789abcdef01234567';

describe('token-tooling deterministic fingerprint', () => {
  it('measures all production web and private exchange artifacts in stable order', () => {
    const fingerprint = createTokenToolingFingerprint(revision);

    expect(fingerprint.graph).toEqual({ tokens: 528, modes: 4, overrides: 197 });
    expect(Object.keys(fingerprint.web)).toEqual([
      'packages/themes/dist/themes.css',
      'packages/tokens/dist/tokens.css',
      'packages/tokens/dist/tokens.json',
    ]);
    expect(Object.keys(fingerprint.exchange.files)).toEqual([
      'modes/density/comfortable.json',
      'modes/density/compact.json',
      'modes/theme/wayglass-dark.json',
      'modes/theme/wayglass-light.json',
      'resolver.json',
      'tokens.json',
      'wayglass-manifest.json',
    ]);
    expect(fingerprint.exchange).toMatchObject({
      status: 'partial-dtcg-2025.10-candidate',
      includedTokens: 524,
      omittedTokens: expect.arrayContaining([expect.any(Object)]),
      omittedOverrides: [],
    });
  });

  it('uses UTF-8 bytes and SHA-256 for comparable measurements', () => {
    expect(measureArtifact('Wayglass\n')).toEqual({
      bytes: 9,
      sha256: '30873ad91f612a09760b47f194bf30db198cf73f11b84ff88554912b2c10f692',
    });
  });
});
