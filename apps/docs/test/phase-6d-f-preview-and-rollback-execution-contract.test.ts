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
    expect(contract).toContain('8d154458b7de3818db9338f47c1775102fe9e361');
    expect(contract).toContain('1701653b00fe6b701fa62053fdd97ce170891b1d09d8ae45c54b06d0b1d61fb7');
    expect(contract).toContain('d02ef91db33635b83031f1cefbce35651a7590e4187a233cc6bb7eb423d8bebd');
    expect(contract).toContain('./phase-6d-f-baseline-reproducibility-audit.md');
    expect(contract).toContain('`phase-6d-f-candidate`');
  });

  it('defines the rollback and recovery sequence without production authority', () => {
    expect(contract).toContain('one initial `wrangler deploy`');
    expect(contract).toContain('Cloudflare couples this first version creation');
    expect(contract).toContain('Deploy the candidate version at 100%');
    expect(contract).toContain('Roll back explicitly to the baseline version ID');
    expect(contract).toContain('Restore the candidate');
    expect(contract).toContain('does **not** authorize the Cloudflare execution itself');
    expect(contract).toContain('retention of both versions and the final candidate deployment');
    expect(contract).toContain('excludes the production hostname, DNS, routes, Custom Domains');
  });

  it('requires edge evidence, stop conditions, and credential-safe records', () => {
    expect(contract).toContain("Cloudflare's documented `noindex`");
    expect(contract).toContain('removes the redundant `; charset=utf-8` parameter');
    expect(contract).toContain('custom headers on canonical redirects');
    expect(contract).toContain('`Allow` on rejected POST');
    expect(contract).toContain(
      'An unexpected account, existing Worker, version, deployment, route',
    );
    expect(contract).toContain('must not contain OAuth tokens');
    expect(contract).toContain('read-only remote verifier');
  });
});
