import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const toolRoot = fileURLToPath(new URL('..', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));

describe('Stage 1 isolation', () => {
  it('has no package, command, writer, generated output, or runtime dependency', () => {
    expect(existsSync(join(toolRoot, 'package.json'))).toBe(false);
    expect(existsSync(join(toolRoot, 'generated'))).toBe(false);
    expect(readdirSync(join(toolRoot, 'src')).sort()).toEqual([
      'catalog.ts',
      'drift.ts',
      'generation.ts',
      'types.ts',
      'validation.ts',
    ]);
    expect(readFileSync(join(repositoryRoot, 'packages/icons/src/index.ts'), 'utf8')).not.toContain(
      'tooling/icon-pipeline',
    );
  });

  it('keeps pure sources free of effects and registration', () => {
    const source = readdirSync(join(toolRoot, 'src'))
      .map((file) => readFileSync(join(toolRoot, 'src', file), 'utf8'))
      .join('\n');
    expect(source).not.toMatch(/node:fs|fetch\(|process\.|customElements|child_process|Date\.now/);
    expect(source.match(/from 'node:/g) ?? []).toEqual(["from 'node:"]);
  });
});
