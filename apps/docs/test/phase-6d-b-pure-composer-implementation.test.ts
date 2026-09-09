import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6d-b-pure-composer-implementation.md'),
  'utf8',
).replace(/\s+/g, ' ');
const rootPackage = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};
const source = readFileSync(
  resolve(repositoryRoot, 'tooling/site-composer/src/constants.ts'),
  'utf8',
);

describe('Phase 6D-B stage 1 pure-composer implementation', () => {
  it('keeps the implementation private, pure, and dependency-neutral', () => {
    expect(record).toContain('private repository tooling');
    expect(record).toContain('importing its `src/index.ts` entry has no output');
    expect(record).toContain('No dependency or lockfile entry is added');
    expect(record).toContain('Effects remain reserved for the explicit commands');
    expect(rootPackage.scripts['site-composer:core:check']).toContain(
      'site-composer:core:typecheck',
    );
    expect(rootPackage.scripts.check).toContain('site-composer:core:check');
  });

  it('implements only the exact accepted surfaces and public destinations', () => {
    expect(record).toContain('normative `@wayglass/docs`');
    expect(record).toContain('inspection `@wayglass/storybook`');
    expect(record).toContain('documentation-then-Storybook surface set');
    expect(source).toContain("id: 'documentation'");
    expect(source).toContain("id: 'storybook'");
    expect(source).not.toContain('walkthrough');
  });

  it('records closed admission and canonical evidence guarantees', () => {
    expect(record).toContain('unsupported entry types, hard links, empty files');
    expect(record).toContain('case-fold and Unicode-normalization collisions');
    expect(record).toContain('matching content remains redacted');
    expect(record).toContain('closed schema-version-1 shape');
    expect(record).toContain('whole-bundle projection hash');
    expect(record).toContain('otherwise valid but noncanonical serialized JSON');
  });

  it('records focused evidence and limits the next authorization', () => {
    expect(record).toContain('Seventy tests across six files');
    expect(record).toContain('creates no file');
    expect(record).toContain('authorizes stage 2 only');
    expect(record).toContain('does not authorize command execution against real producer outputs');
    expect(record).toContain('Wrangler installation');
    expect(record).toContain('npm publication');
    expect(record).toContain('SpaceTraders work');
  });
});
