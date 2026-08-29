import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
) as {
  scripts: Record<string, string>;
};

describe('clean-checkout repository gate', () => {
  it('builds ignored generated outputs before any check that consumes them', () => {
    const steps = manifest.scripts.check?.split(' && ') ?? [];

    expect(steps.filter((step) => step === 'pnpm build')).toEqual(['pnpm build']);
    expect(steps.indexOf('pnpm build')).toBeGreaterThan(steps.indexOf('pnpm lint'));

    for (const consumer of ['pnpm token-tooling:check', 'pnpm typecheck', 'pnpm test']) {
      expect(steps, `${consumer} is missing from the root check`).toContain(consumer);
      expect(steps.indexOf('pnpm build'), `build must precede ${consumer}`).toBeLessThan(
        steps.indexOf(consumer),
      );
    }
  });
});
