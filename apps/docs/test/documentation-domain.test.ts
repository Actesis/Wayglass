import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('documentation hostname ownership', () => {
  it('attaches only the canonical hostname without replacing the artifact', () => {
    const config = JSON.parse(read('wrangler.domains.jsonc').replace(/,\s*([}\]])/g, '$1'));
    expect(config.name).toBe('wayglass-docs');
    expect(config.routes).toEqual([{ pattern: 'wayglass.hoagsoftworks.com', custom_domain: true }]);
    expect(config.workers_dev).toBe(true);
    expect(config.preview_urls).toBe(true);
    expect(config).not.toHaveProperty('assets');
    expect(config).not.toHaveProperty('main');
    expect(read('wrangler.jsonc')).not.toContain('routes');
    expect(read('docs/governance/documentation-custom-domain.md')).toContain('triggers-only');
  });
});
