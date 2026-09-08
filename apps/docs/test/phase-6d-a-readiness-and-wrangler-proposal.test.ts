import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const proposal = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6d-a-readiness-and-wrangler-proposal.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6D-A readiness and Wrangler dependency proposal', () => {
  it('records the exact origin and non-conflicting readiness evidence', () => {
    expect(proposal).toContain('`https://wayglass.hoagsoftworks.com`');
    expect(proposal).toContain('A, AAAA, and CNAME queries returned `NXDOMAIN`');
    expect(proposal).toContain('`wrangler pages project list` returned no projects');
    expect(proposal).toContain('Cloudflare code `10007`');
    expect(proposal).toContain('`wayglass-docs` does not exist');
    expect(proposal).toContain(
      'Account identifiers, email, and token material are intentionally omitted',
    );
  });

  it('preserves the private repository, public-content, and ownership decisions', () => {
    expect(proposal).toContain('remains private until the project owner approves general release');
    expect(proposal).toContain('VitePress and Storybook may become public');
    expect(proposal).toContain('No walkthrough is admitted');
    expect(proposal).toContain('project owner is the durable Cloudflare account owner');
    expect(proposal).toContain('Codex cannot receive incidents');
    expect(proposal).toContain('automatically from the protected `main` branch');
  });

  it('justifies a dev-only Cloudflare dependency without coupling composition to it', () => {
    expect(proposal).toContain('cannot validate Cloudflare configuration');
    expect(proposal).toContain('Hand-written REST requests would duplicate');
    expect(proposal).toContain('root development dependency');
    expect(proposal).toContain('Site composition remains framework-neutral');
    expect(proposal).toContain('must not enter package tarballs');
  });

  it('selects the exact aged Wrangler candidate and rejects policy exceptions', () => {
    expect(proposal).toContain('`4.128.0`, exact rather than a range');
    expect(proposal).toContain('`sha512-jNXy9e8/');
    expect(proposal).toContain('`MIT OR Apache-2.0`');
    expect(proposal).toContain('Wrangler requires Node `>=22.0.0`');
    expect(proposal).toContain('rejects those exceptions');
    expect(proposal).toContain(
      'newest checked version that passes the existing supply-chain policy',
    );
  });

  it('records direct dependencies, lockfile effect, licenses, scripts, and advisories', () => {
    for (const dependency of [
      '@cloudflare/kv-asset-handler',
      '@cloudflare/unenv-preset',
      'blake3-wasm',
      'esbuild',
      'miniflare',
      'path-to-regexp',
      'unenv',
      'workerd',
    ]) {
      expect(proposal).toContain(`\`${dependency}\``);
    }
    expect(proposal).toContain('555 lockfile lines and 56 new package-resolution records');
    expect(proposal).toContain('needs no minimum-release-age exception');
    expect(proposal).toContain('`LGPL-3.0-or-later`');
    expect(proposal).toContain('`esbuild@0.28.1` and `workerd@1.20260831.1`');
    expect(proposal).toContain('reported no known vulnerabilities');
  });

  it('freezes reconstructable future build settings and the dashboard gap', () => {
    expect(proposal).toContain('GitHub App access limited to `Actesis/Wayglass` only');
    expect(proposal).toContain('protected `main`');
    expect(proposal).toContain('`pnpm site:build`');
    expect(proposal).toContain('`pnpm exec wrangler deploy`');
    expect(proposal).toContain('`pnpm exec wrangler versions upload`');
    expect(proposal).toContain('`24.18.0`');
    expect(proposal).toContain('`PNPM_VERSION`');
    expect(proposal).toContain('cannot produce the authoritative general inventory');
  });

  it('authorizes only local composition after owner acceptance', () => {
    expect(proposal).toContain('completes Phase 6D-A');
    expect(proposal).toContain(
      'authorizes Phase 6D-B deterministic local site-composition implementation',
    );
    expect(proposal).toContain('does not install them now');
    expect(proposal).toContain('does not authorize Cloudflare configuration');
    expect(proposal).toContain('DNS mutation');
    expect(proposal).toContain('npm publication');
    expect(proposal).toContain('SpaceTraders work');
  });
});
