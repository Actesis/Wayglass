import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const result = read('docs/governance/phase-6d-f-execution-result.md').replace(/\s+/g, ' ');

describe('Phase 6D-F execution result', () => {
  it('publishes the result through the documentation surface', () => {
    expect(read('apps/docs/governance/phase-6d-f-execution-result.md')).toContain(
      '../../../docs/governance/phase-6d-f-execution-result.md',
    );
    expect(read('apps/docs/.vitepress/config.ts')).toContain(
      '/governance/phase-6d-f-execution-result',
    );
  });

  it('records the exact candidate and successful rollback sequence', () => {
    expect(result).toContain('a5425e20db840cc9e9011a8bc6e5b82bfa1149a7');
    expect(result).toContain('71a1a660785498f13d35d59e0b8f0005d0ded68e59cec793c8b3e3e532a3f206');
    expect(result).toContain('3406e39e-16d7-42e1-b213-e9d4631bd758');
    expect(result).toContain('30 edge response comparisons');
    expect(result).toContain('rolled back to exact baseline version');
    expect(result).toContain('restored candidate version');
    expect(result).toContain('zero Axe violations');
  });

  it('retains review state without expanding release authority', () => {
    expect(result).toContain('five immutable versions');
    expect(result).toContain('currently serves the exact accepted candidate at 100%');
    expect(result).toContain('did not attach `wayglass.hoagsoftworks.com`');
    expect(result).toContain('Raw Wrangler logs, account identifiers, email addresses');
    expect(result).toContain('does not authorize production-hostname attachment');
  });
});
