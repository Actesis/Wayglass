import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
) as {
  scripts: Record<string, string>;
};

describe('icon-pipeline repository gate integration', () => {
  it('runs the write-free icon check once after bootstrap output exists', () => {
    const steps = manifest.scripts.check?.split(' && ') ?? [];
    const build = 'pnpm build';
    const iconCheck = 'pnpm icon-tooling:check';

    expect(steps.filter((step) => step === iconCheck)).toEqual([iconCheck]);
    expect(steps, `${build} is missing from the root check`).toContain(build);
    expect(steps.indexOf(build), `${build} must precede ${iconCheck}`).toBeLessThan(
      steps.indexOf(iconCheck),
    );
  });
});
