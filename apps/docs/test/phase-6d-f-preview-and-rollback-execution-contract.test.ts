import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const contract = read(
  'docs/governance/phase-6d-f-preview-and-rollback-execution-contract.md',
).replace(/\s+/g, ' ');

describe('Phase 6D-F preview and rollback execution contract', () => {
  it('publishes the contract through the documentation surface', () => {
    expect(
      read('apps/docs/governance/phase-6d-f-preview-and-rollback-execution-contract.md'),
    ).toContain('../../../docs/governance/phase-6d-f-preview-and-rollback-execution-contract.md');
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-f-preview-and-rollback-execution-contract',
    );
  });

  it('freezes Version URL terminology, exact targets, and two verified artifacts', () => {
    expect(contract).toContain('immutable **Version URL** workflow');
    expect(contract).toContain('wrangler@4.128.0');
    expect(contract).toContain('`wayglass-docs`');
    expect(contract).toContain('`workers.dev` root and Version URLs');
    expect(contract).toContain('aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74');
    expect(contract).toContain('6edb7d6e4ebca328cfdc720b3af33ea41df9543724cdd1bbdf3b653a35a809fd');
    expect(contract).toContain('72cef95a99cfc43617f228d3619ac3391041e719038c695a5b99c4b6cf112f22');
    expect(contract).toContain('./phase-6d-f-baseline-reproducibility-audit.md');
    expect(contract).toContain('`phase-6d-f-candidate`');
  });

  it('defines the rollback and recovery sequence without production authority', () => {
    expect(contract).toContain('Deploy the candidate version at 100%');
    expect(contract).toContain('Roll back explicitly to the baseline version ID');
    expect(contract).toContain('Restore the candidate');
    expect(contract).toContain('does **not** authorize the Cloudflare execution itself');
    expect(contract).toContain('retention of both versions and the final candidate deployment');
    expect(contract).toContain('excludes the production hostname, DNS, routes, Custom Domains');
  });

  it('requires edge evidence, stop conditions, and credential-safe records', () => {
    expect(contract).toContain('`X-Robots-Tag` containing `noindex` and `nofollow`');
    expect(contract).toContain('custom headers on canonical redirects');
    expect(contract).toContain('`Allow` on rejected POST');
    expect(contract).toContain(
      'An unexpected account, existing Worker, version, deployment, route',
    );
    expect(contract).toContain('must not contain OAuth tokens');
    expect(contract).toContain('read-only remote verifier');
  });
});
