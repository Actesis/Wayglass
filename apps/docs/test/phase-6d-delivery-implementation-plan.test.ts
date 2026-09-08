import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const plan = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6d-delivery-implementation-plan.md'),
  'utf8',
).replace(/\s+/g, ' ');
const roadmap = readFileSync(resolve(repositoryRoot, 'docs/phase-6.md'), 'utf8').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6D documentation and Storybook delivery implementation plan', () => {
  it('uses the current Cloudflare platform model without authorizing account work', () => {
    expect(plan).toContain('Workers Static Assets');
    expect(plan).toContain('one asset collection per Worker');
    expect(plan).toContain('Workers Builds');
    expect(plan).toContain('Custom Domains');
    expect(plan).toContain('does not connect Cloudflare or GitHub');
    expect(plan).toContain('change DNS');
  });

  it('freezes the proposed origin, surfaces, visibility, and data boundaries', () => {
    expect(plan).toContain('`https://wayglass.hoagsoftworks.com`');
    expect(plan).toContain(
      'Keep `Actesis/Wayglass` private until the project owner approves general release',
    );
    expect(plan).toContain('may become public at the canonical origin after launch approval');
    expect(plan).toContain('VitePress at `/`; Storybook at `/storybook/`; no walkthroughs');
    expect(plan).toContain('Automated from the protected production branch after launch approval');
    expect(plan).toContain('no beacon, cookies, forms, accounts, submitted data, or telemetry');
  });

  it('decomposes implementation into all seven reviewed slices', () => {
    for (const slice of ['6D-A', '6D-B', '6D-C', '6D-D', '6D-E', '6D-F', '6D-G']) {
      expect(plan).toContain(`### ${slice}`);
    }
  });

  it('requires deterministic and defensive local composition', () => {
    expect(plan).toContain('empty owned temporary staging directory');
    expect(plan).toContain('one clean source revision');
    expect(plan).toContain(
      'rejects collisions, symlinks, missing entry points, path escape, secrets',
    );
    expect(plan).toContain('whole-bundle hash');
    expect(plan).toContain('removes partial output on every failure');
    expect(plan).toContain('byte-identical and independently verified');
  });

  it('proves the Storybook prefix and explicit response contract', () => {
    expect(plan).toContain('Configure Storybook itself for `/storybook/`');
    expect(plan).toContain('without output rewriting');
    expect(plan).toContain('real 404 responses');
    expect(plan).toContain('without a global SPA fallback');
    expect(plan).toContain('preview `noindex`');
    expect(plan).toContain('same-origin Storybook framing');
  });

  it('keeps Wrangler and every external mutation behind distinct gates', () => {
    expect(plan).toContain('why platform-neutral existing tools are insufficient');
    expect(plan).toContain('Allowed only after accepted dependency proposal');
    expect(plan).toContain('Requires separate 6D-F authorization');
    expect(plan).toContain('no custom hostname');
    expect(plan).toContain('Not authorized until Phase 6F');
    expect(plan).toContain('does not authorize installing Wrangler');
  });

  it('records every owner confirmation and limits plan acceptance to 6D-A', () => {
    expect(plan).toContain('control of the `hoagsoftworks.com` Cloudflare zone');
    expect(plan).toContain('has no existing DNS record, Worker route, Pages project');
    expect(plan).toContain('repository stays private until general-release approval');
    expect(plan).toContain('project owner remains the durable account owner');
    expect(plan).toContain('automated documentation and Storybook deployment is acceptable');
    expect(plan).toContain('authorizes Phase 6D-A readiness and dependency-proposal work only');
    expect(roadmap).toContain('Phase 6D delivery plan is accepted');
    expect(roadmap).toContain('Phase 6D-A readiness and Wrangler dependency proposal is active');
  });
});
