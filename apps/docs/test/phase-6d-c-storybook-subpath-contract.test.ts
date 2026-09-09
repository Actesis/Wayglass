import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const contract = read('docs/governance/phase-6d-c-storybook-subpath-contract.md').replace(
  /\s+/g,
  ' ',
);
const storybook = read('apps/storybook/.storybook/main.ts');
const managerHead = read('apps/storybook/.storybook/manager-head.html');
const docsConfig = read('apps/docs/.vitepress/config.ts');

describe('Phase 6D-C Storybook subpath contract', () => {
  it('makes Storybook own its exact production prefix', () => {
    expect(storybook).toContain("base: '/storybook/'");
    expect(contract).toContain('Storybook owns the exact `/storybook/` prefix');
    expect(contract).toContain('without composer or server rewriting');
    expect(contract).toContain('/storybook/iframe.html');
    expect(contract).toContain('?path=/story/<story-id>');
    expect(contract).toContain('?id=<story-id>&viewMode=story');
  });

  it('provides explicit, accessible navigation in both directions', () => {
    expect(docsConfig).toContain("{ text: 'Storybook', link: '/storybook/' }");
    expect(managerHead).toContain("link.href = '/'");
    expect(managerHead).toContain("link.textContent = 'Wayglass documentation'");
    expect(managerHead).toContain(
      "link.setAttribute('aria-label', 'Return to Wayglass documentation')",
    );
    expect(managerHead).toContain('#wayglass-docs-return:focus-visible');
  });

  it('requires composed browser evidence and preserves the next authority boundary', () => {
    expect(contract).toContain('serve the composed directory without rewrites');
    expect(contract).toContain('browser back/forward');
    expect(contract).toContain('no request for a Storybook runtime asset escapes');
    expect(contract).toContain('authorizes Phase 6D-D');
    expect(contract).toContain('does not authorize Wrangler installation');
    expect(contract).toContain('Cloudflare or GitHub connection');
    expect(contract).toContain('npm publication');
  });
});
