import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const adr = read(
  'docs/architecture/adr/0038-path-independent-storybook-manager-normalization.md',
).replace(/\s+/g, ' ');

describe('ADR 0038 path-independent Storybook manager normalization', () => {
  it('publishes the decision through the documentation surface', () => {
    expect(
      read('apps/docs/architecture/adr/0038-path-independent-storybook-manager-normalization.md'),
    ).toContain(
      '../../../../docs/architecture/adr/0038-path-independent-storybook-manager-normalization.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/architecture/adr/0038-path-independent-storybook-manager-normalization',
    );
  });

  it('records the cause, closed normalization boundary, and dependency rationale', () => {
    expect(adr).toContain('absolute package paths');
    expect(adr).toContain('path-dependent');
    expect(adr).toContain('after the Storybook producer succeeds and before composition');
    expect(adr).toContain('selects only one-level addon files named `manager-bundle.js`');
    expect(adr).toContain('constant virtual filename');
    expect(adr).toContain('site:compose` remains a byte-for-byte copier');
    expect(adr).toContain('exact `rolldown@1.1.5` directly');
    expect(adr).toContain('no package version or package bytes beyond');
  });

  it('requires cross-path byte equality and continued runtime validation', () => {
    expect(adr).toContain('distinct absolute repository parents');
    expect(adr).toContain('identical manager bytes, manifests, inventories, and bundle hashes');
    expect(adr).toContain('real two-checkout build proof');
    expect(adr).toContain(
      'Browser, accessibility, CSP, response, and edge checks remain mandatory',
    );
    expect(adr).toContain('fixed checkout path');
    expect(adr).toContain('Ignore manager bundles');
  });
});
