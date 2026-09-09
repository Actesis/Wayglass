import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6d-b-verifier-build-and-proof.md'),
  'utf8',
).replace(/\s+/g, ' ');
const verifier = readFileSync(
  resolve(repositoryRoot, 'tooling/site-composer/src/verify.ts'),
  'utf8',
);
const verifierManifest = readFileSync(
  resolve(repositoryRoot, 'tooling/site-composer/src/verify-manifest.ts'),
  'utf8',
);

describe('Phase 6D-B stage 3 verifier, build, and proof', () => {
  it('defines independent read-only verification and retained build commands', () => {
    expect(record).toContain('pnpm site:verify -- --input');
    expect(record).toContain('pnpm site:build -- --output');
    expect(record).toContain('recomputes file, surface, and bundle identities');
    expect(record).toContain('does not invoke Wrangler');
    expect(verifier).not.toContain("from './compose.ts'");
    expect(verifierManifest).not.toContain("from './manifest.ts'");
  });

  it('keeps the deterministic proof and authority boundary explicit', () => {
    expect(record).toContain('exact sorted entry sets');
    expect(record).toContain('every byte including the manifest');
    expect(record).toContain('real two-build proof');
    expect(record).toContain(
      'Any producer nondeterminism or prohibited public output remains a blocker',
    );
    expect(record).toContain('will not authorize Wrangler installation');
    expect(record).toContain('npm publication');
    expect(record).toContain('SpaceTraders work');
  });
});
