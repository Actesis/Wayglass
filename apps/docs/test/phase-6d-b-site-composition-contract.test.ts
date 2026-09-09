import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const contract = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6d-b-site-composition-contract.md'),
  'utf8',
).replace(/\s+/g, ' ');
const adr = readFileSync(
  resolve(repositoryRoot, 'docs/architecture/adr/0037-deterministic-site-composition.md'),
  'utf8',
).replace(/\s+/g, ' ');
const roadmap = readFileSync(resolve(repositoryRoot, 'docs/phase-6.md'), 'utf8').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6D-B deterministic site-composition contract', () => {
  it('admits only the normative documentation and inspection Storybook surfaces', () => {
    expect(contract).toContain('`documentation` | `normative`');
    expect(contract).toContain('`storybook` | `inspection`');
    expect(contract).toContain('`apps/docs/.vitepress/dist`');
    expect(contract).toContain('`apps/storybook/storybook-static`');
    expect(contract).toContain('`index.html`, `iframe.html`');
    expect(contract).toContain('No walkthrough, example, experiment, reference application');
    expect(adr).toContain('Schema version 1 admits exactly these ordered surfaces');
  });

  it('binds composition to one clean and stable source identity', () => {
    expect(contract).toContain('exact clean `HEAD` commit and tree');
    expect(contract).toContain('SHA-256 of committed `pnpm-lock.yaml` bytes');
    expect(contract).toContain('complete pre-copy inventories');
    expect(contract).toContain('pre-copy and post-copy source inventories');
    expect(contract).toContain('changed path, type, size, or byte fails');
    expect(adr).toContain('Source outputs are read-only');
  });

  it('requires an owned transactional temporary output and bounded cleanup', () => {
    expect(contract).toContain('new absolute descendant of the real operating-system temporary');
    expect(contract).toContain('private staging sibling');
    expect(contract).toContain('rejected before the rename');
    expect(contract).toContain('atomically renames it');
    expect(contract).toContain('removes only its own staging directory');
    expect(contract).toContain('never removes a caller-created path or producer output');
    expect(adr).toContain('never creates or mutates the requested final destination');
  });

  it('fails closed on filesystem, collision, secret, and source-map hazards', () => {
    expect(contract).toContain('symbolic links, hard-linked aliases, sockets, devices, FIFOs');
    expect(contract).toContain('Unicode NFC normalization plus Unicode lowercase');
    expect(contract).toContain('reserved top-level `storybook` path');
    expect(contract).toContain('every `.map` file');
    expect(contract).toContain('credential-bearing file names');
    expect(contract).toContain('never the matching bytes');
    expect(adr).toContain('Generated HTML, JavaScript, CSS, and asset names are never rewritten');
  });

  it('defines a closed canonical manifest and non-self-referential bundle hash', () => {
    expect(contract).toContain('`wayglass-site-manifest.json`');
    expect(contract).toContain('artifact: "wayglass-site-bundle"');
    expect(contract).toContain('schemaVersion: 1');
    expect(contract).toContain('source: { commit, tree, lockfileSha256 }');
    expect(contract).toContain('tooling: { commit, tree }');
    expect(contract).toContain('Canonical JSON recursively sorts object keys');
    expect(contract).toContain('with only `bundleSha256` omitted');
    expect(contract).toContain('manifest is not listed as a surface file');
    expect(adr).toContain('timestamps are forbidden');
  });

  it('separates pure logic, composition, verification, and real equality proof', () => {
    expect(contract).toContain('`pnpm site:compose -- --output <absolute-temp-path>`');
    expect(contract).toContain('`pnpm site:verify -- --input <absolute-temp-path>`');
    expect(contract).toContain('`pnpm site:build -- --output <absolute-temp-path>`');
    expect(contract).toContain('pure schema, canonicalization, validation, inventory');
    expect(contract).toContain('effectful transactional composition');
    expect(contract).toContain('independent verification plus two-build byte-equality proof');
    expect(adr).toContain("does not trust the composer's in-memory result");
  });

  it('limits acceptance to private stage-1 implementation', () => {
    expect(contract).toContain('authorized implementation stage 1 only');
    expect(contract).toContain('did not authorize effectful composition');
    expect(contract).toContain('Wrangler installation');
    expect(contract).toContain('Cloudflare configuration or contact');
    expect(contract).toContain('npm publication');
    expect(contract).toContain('SpaceTraders work');
    expect(roadmap).toContain('Phase 6D-A readiness and Wrangler dependency proposal are accepted');
    expect(roadmap).toContain('Phase 6D-B deterministic site-composition contract is accepted');
    expect(adr).toContain('Status: accepted');
  });
});
