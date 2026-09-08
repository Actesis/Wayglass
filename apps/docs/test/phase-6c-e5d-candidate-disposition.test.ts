import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const disposition = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-e5d-candidate-disposition.md'),
  'utf8',
).replace(/\s+/g, ' ');
const runRecord = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-e5c-run-attempts.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E5D accepted candidate disposition', () => {
  it('accepts only the exact verified candidate', () => {
    expect(disposition).toContain('**Status:** Accepted by the project owner');
    expect(disposition).toContain('**Decision: accept candidate.**');
    expect(disposition).toContain('`ce400e89930a047c6af1c6992c64cfe422a1eeee`');
    expect(disposition).toContain(
      '`ad579157e79acccdc0cb5927994c45fe563656f1b6c93d64b091d130fdaec73b`',
    );
    expect(disposition).toContain(
      '`520755286939ef89b04ef45fcabdb86f5fbc5c402d2ad236a4585eafc2e1e20b`',
    );
    expect(disposition).toContain('does not turn these tarballs into publishable artifacts');
  });

  it('dispositions all six release units and excludes private surfaces', () => {
    for (const packageName of [
      '@wayglass/core',
      '@wayglass/tokens',
      '@wayglass/themes',
      '@wayglass/elements',
      '@wayglass/icons',
      '@wayglass/react',
    ]) {
      expect(disposition).toContain(`| \`${packageName}\``);
    }
    expect(disposition).toContain('Testing helpers, ESLint configuration');
    expect(disposition).toContain('SpaceTraders work remain excluded');
  });

  it('records the exact proof scope and audit hashes', () => {
    expect(disposition).toContain('Two byte-identical retained runs');
    expect(disposition).toContain('Four Vanilla, eight React, and 72 browser results');
    expect(disposition).toContain(
      '`e25714ce57d8ce0e4bbe7359a3703a1ff63fbe1f61b2d04a5d4dc919d206391e`',
    );
    expect(disposition).toContain(
      '`45178532da0e24286d7e4fa9a4ed4cd6cef630d31e7341c3e6817d705ce3178f`',
    );
    expect(disposition).toContain('All nine recorded result groups passed');
  });

  it('carries every warning and limitation without converting it into a failure', () => {
    for (const code of [
      'WG_RC_ADVISORY_MEDIA_TYPE',
      'WG_RC_LIT_DEVELOPMENT_WARNING',
      'WG_RC_NODE_DEPRECATION_WARNING',
      'WG_RC_STORYBOOK_CHUNK_WARNING',
      'WG_RC_QUALITY_WARNING_PRESENT',
      'WG_RC_AUTOMATED_BROWSER_ONLY',
      'WG_RC_WINDOWS_UNOBSERVED',
    ]) {
      expect(disposition).toContain(`\`${code}\``);
    }
    expect(disposition).toContain('None indicates a failed release unit');
  });

  it('preserves the manifest-only dependency-license evidence for release review', () => {
    expect(disposition).toContain('`@lit-labs/ssr-dom-shim@1.6.0`');
    expect(disposition).toContain('declares `BSD-3-Clause`');
    expect(disposition).toContain('preserves `licenseFiles: []`');
    expect(disposition).toContain(
      'complete its legal/compliance disposition before publication approval',
    );
  });

  it('records all three owner outcomes and the selected decision', () => {
    expect(disposition).toContain('**Accept candidate**');
    expect(disposition).toContain('**Narrow or refreeze**');
    expect(disposition).toContain('**No candidate**');
    expect(disposition).toContain('The project owner selected **accept candidate**');
  });

  it('keeps retention, deployment, publication, and external work behind later authority', () => {
    expect(disposition).toContain('durable private retention location');
    expect(disposition).toContain('does not authorize that upload or removal');
    expect(disposition).toContain('does not authorize Phase 6E npm work');
    expect(disposition).toContain('preview and production deployment remain separately controlled');
    expect(disposition).toContain('completes Phase 6C');
    expect(disposition).toContain('Phase 6D documentation and Storybook delivery implementation');
    expect(runRecord).toContain('[E5D disposition proposal]');
  });
});
