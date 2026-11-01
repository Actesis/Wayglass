import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const audit = read('docs/governance/phase-6d-f-execution-readiness-audit.md').replace(/\s+/g, ' ');

describe('Phase 6D-F execution-readiness audit', () => {
  it('publishes the audit through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-f-execution-readiness-audit.md')).toContain(
      '../../../docs/governance/phase-6d-f-execution-readiness-audit.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-f-execution-readiness-audit',
    );
  });

  it('pins the clean candidate, baseline, command authority, and evidence destinations', () => {
    expect(audit).toContain('clean `main` merge commit that accepts this audit');
    expect(audit).toContain('8d154458b7de3818db9338f47c1775102fe9e361');
    expect(audit).toContain('1701653b00fe6b701fa62053fdd97ce170891b1d09d8ae45c54b06d0b1d61fb7');
    expect(audit).toContain('d02ef91db33635b83031f1cefbce35651a7590e4187a233cc6bb7eb423d8bebd');
    expect(audit).toContain('./phase-6d-f-baseline-reproducibility-audit.md');
    expect(audit).toContain('locally installed Wrangler `4.128.0` help');
    expect(audit).toContain('candidate-browser.json');
    expect(audit).toContain('baseline-active-manifest.json');
    expect(audit).toContain('WAYGLASS_PNPM_BIN_DIR');
    expect(audit).toContain('WAYGLASS_PNPM_STORE');
    expect(audit).toContain('RUN_ROOT="$(realpath "$RUN_ROOT")"');
  });

  it('records the no-write provider correction to the initial deployment sequence', () => {
    expect(audit).toContain('both version and deployment reads returned Cloudflare code `10007`');
    expect(audit).toContain('was rejected before any write');
    expect(audit).toContain('No Worker, version, deployment, route, alias');
  });

  it('builds frozen baseline workspace packages before the site producers', () => {
    const install = audit.indexOf(
      'install --frozen-lockfile --offline --store-dir <WAYGLASS_PNPM_STORE>',
    );
    const packages = audit.indexOf('pnpm --dir <RUN_ROOT>/baseline-checkout build', install);
    const site = audit.indexOf('site:build -- --output <BASELINE_SITE>', packages);

    expect(install).toBeGreaterThan(-1);
    expect(packages).toBeGreaterThan(install);
    expect(site).toBeGreaterThan(packages);
    expect(audit).toContain('delegates workspace dependency ordering');
    expect(audit).toContain('committed Turbo graph');
    expect(audit).toContain("composer's closed two-surface admission set");
  });

  it('freezes the exact upload, deployment, rollback, restoration, and verification sequence', () => {
    expect(audit).toContain('wrangler deploy --config wrangler.jsonc --name wayglass-docs');
    expect(audit).toContain('versions upload` cannot create a Worker that does not exist');
    expect(audit).toContain('versions upload --config wrangler.jsonc --name wayglass-docs');
    expect(audit).not.toContain('versions deploy <BASELINE_VERSION_ID>@100%');
    expect(audit).toContain('versions deploy <CANDIDATE_VERSION_ID>@100%');
    expect(audit).toContain('rollback <BASELINE_VERSION_ID>');
    expect(audit).toContain('site:browser:edge:check');
    expect(audit).toContain('baseline-initial-manifest.json');
    expect(audit).toContain('cmp --silent <CANDIDATE_SITE>/wayglass-site-manifest.json');
  });

  it('fails closed and preserves a separate all-at-once authorization gate', () => {
    expect(audit).toContain('does **not** authorize the run');
    expect(audit).toContain('`wayglass-docs` already exists or absence is ambiguous');
    expect(audit).toContain('`--strict` reports concurrent remote change');
    expect(audit).toContain('Required all-at-once execution authorization');
    expect(audit).toContain('retain both versions, the alias, the Worker');
    expect(audit).toContain('does not include the production hostname, DNS');
  });
});
