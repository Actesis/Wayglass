import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const contract = read('docs/governance/phase-6d-d-response-route-content-contract.md').replace(
  /\s+/g,
  ' ',
);
const docsConfig = read('apps/docs/.vitepress/config.ts');

describe('Phase 6D-D response, route, and content contract', () => {
  it('freezes asset-first SSG routing and truthful not-found behavior', () => {
    expect(contract).toContain('`not_found_handling` is `404-page`');
    expect(contract).toContain('`html_handling` is `auto-trailing-slash`');
    expect(contract).toContain('`run_worker_first` therefore remains omitted');
    expect(contract).toContain('missing `/storybook/` path or asset | `404`');
    expect(contract).toContain('never `index.html`');
    expect(contract).toContain('sole initial error document and is served with status `404`');
  });

  it('separates immutable, revalidated, security, framing, and indexing policies', () => {
    expect(contract).toContain('`public, max-age=31536000, immutable`');
    expect(contract).toContain('`public, max-age=0, must-revalidate`');
    expect(contract).toContain('`X-Content-Type-Options: nosniff`');
    expect(contract).toContain("CSP `frame-ancestors 'self'`");
    expect(contract).toContain('joins duplicate values from overlapping rules');
    expect(contract).toContain('`X-Robots-Tag: noindex, nofollow`');
    expect(contract).toContain('`https://:version.:subdomain.workers.dev/*`');
    expect(contract).toContain('immutable Version URLs received Cloudflare');
  });

  it('requires an independent matrix before Wrangler and preserves external authority', () => {
    expect(contract).toContain('without importing Wrangler');
    expect(contract).toContain('complete route, method, MIME, cache, security, canonical, link');
    expect(contract).toContain('compare the credential-free local Wrangler behavior');
    expect(contract).toContain('does not authorize Wrangler installation or configuration');
    expect(contract).toContain('preview upload');
    expect(contract).toContain('npm publication');
  });

  it('publishes both current Phase 6D contracts through the documentation surface', () => {
    expect(docsConfig).toContain("link: '/governance/phase-6d-c-storybook-subpath-contract'");
    expect(docsConfig).toContain("link: '/governance/phase-6d-d-response-route-content-contract'");
    expect(read('apps/docs/governance/phase-6d-c-storybook-subpath-contract.md')).toContain(
      '../../../docs/governance/phase-6d-c-storybook-subpath-contract.md',
    );
    expect(read('apps/docs/governance/phase-6d-d-response-route-content-contract.md')).toContain(
      '../../../docs/governance/phase-6d-d-response-route-content-contract.md',
    );
  });
});
