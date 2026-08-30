import { describe, expect, it } from 'vitest';

import { iconCatalog } from '../src/catalog.js';
import { generateIconArtifacts } from '../src/generation.js';
import { verifyGeneratedArtifactIntegrity } from '../src/integrity.js';

describe('generated artifact integrity', () => {
  const artifacts = generateIconArtifacts(iconCatalog, { iconPackageVersion: '0.0.0' });

  it('verifies the authenticated set and version linkage', () => {
    expect(verifyGeneratedArtifactIntegrity(artifacts)).toEqual(
      expect.objectContaining({ authenticatedArtifacts: 3 }),
    );
    expect(artifacts['tooling/icon-pipeline/generated/source-manifest.json']).toContain(
      '"iconPackageVersion": "0.0.0"',
    );
  });

  it.each([
    'packages/icons/src/generated/catalog.ts',
    'tooling/icon-pipeline/generated/source-manifest.json',
    'tooling/icon-pipeline/generated/review-index.html',
  ] as const)('rejects changed authenticated bytes in %s', (path) => {
    expect(() => verifyGeneratedArtifactIntegrity({ ...artifacts, [path]: 'changed\n' })).toThrow(
      /WG_ICON_INTEGRITY_/,
    );
  });

  it('rejects a malformed or self-authenticating output manifest', () => {
    expect(() =>
      verifyGeneratedArtifactIntegrity({
        ...artifacts,
        'tooling/icon-pipeline/generated/output-manifest.json': '{}\n',
      }),
    ).toThrow(/WG_ICON_INTEGRITY_SHAPE/);
    const output = JSON.parse(
      artifacts['tooling/icon-pipeline/generated/output-manifest.json'],
    ) as { artifacts: unknown[] };
    output.artifacts.push({
      bytes: 1,
      path: 'tooling/icon-pipeline/generated/output-manifest.json',
      sha256: '0'.repeat(64),
    });
    expect(() =>
      verifyGeneratedArtifactIntegrity({
        ...artifacts,
        'tooling/icon-pipeline/generated/output-manifest.json': `${JSON.stringify(output)}\n`,
      }),
    ).toThrow(/WG_ICON_INTEGRITY_OUTPUT/);
  });

  it('rejects any path outside the exact four-output inventory', () => {
    expect(() =>
      verifyGeneratedArtifactIntegrity({ ...artifacts, '../outside': 'unsafe\n' } as never),
    ).toThrow(/WG_ICON_INTEGRITY_INVENTORY/);
  });
});
