import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6d-b-transactional-composer-implementation.md'),
  'utf8',
).replace(/\s+/g, ' ');
const rootPackage = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};
const composeSource = readFileSync(
  resolve(repositoryRoot, 'tooling/site-composer/src/compose.ts'),
  'utf8',
);
const repositorySource = readFileSync(
  resolve(repositoryRoot, 'tooling/site-composer/src/repository.ts'),
  'utf8',
);

describe('Phase 6D-B stage 2 transactional-composer implementation', () => {
  it('records the explicit local composition command delivered by stage 2', () => {
    expect(record).toContain('pnpm site:compose -- --output');
    expect(record).toContain('rejects missing, repeated, ambiguous, or additional arguments');
    expect(record).toContain('without a shell');
    expect(record).toContain('does not use the network');
    expect(rootPackage.scripts['site:compose']).toContain('tooling/site-composer/src/cli.ts');
    expect(rootPackage.scripts['site:verify']).toContain('tooling/site-composer/src/cli.ts');
    expect(rootPackage.scripts['site:build']).toContain('tooling/site-composer/src/cli.ts');
  });

  it('authenticates committed source and stable producer inventories', () => {
    expect(record).toContain('exact real repository root');
    expect(record).toContain('byte for byte with committed `HEAD`');
    expect(record).toContain('active pnpm version must match');
    expect(record).toContain('opens regular files with `O_NOFOLLOW`');
    expect(record).toContain('Added, removed, moved, type-changed, truncated, or byte-changed');
    expect(repositorySource).toContain("'--porcelain=v1'");
    expect(repositorySource).toContain("'--untracked-files=all'");
  });

  it('keeps output temporary, atomic, verified, and narrowly cleaned', () => {
    expect(record).toContain('new absolute descendant of the real operating-system temporary');
    expect(record).toContain('sets directories to `0755` and files to `0644`');
    expect(record).toContain('writes the canonical root manifest last');
    expect(record).toContain('Only then does one rename make the final directory visible');
    expect(record).toContain('removes only the exact staging directory');
    expect(composeSource).toContain('renameSync(staging, output)');
  });

  it('records fixture evidence and authorizes only stage 3', () => {
    expect(record).toContain('98 tests across 10 files');
    expect(record).toContain('concurrently created destination left untouched');
    expect(record).toContain('command is not run against real producer outputs');
    expect(record).toContain('authorized stage 3 only');
    expect(record).toContain('Wrangler installation');
    expect(record).toContain('npm publication');
    expect(record).toContain('SpaceTraders work');
  });
});
