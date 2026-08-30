import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const toolRoot = fileURLToPath(new URL('..', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));

describe('Stage 1 isolation', () => {
  it('has no package, generated output, or runtime dependency', () => {
    expect(existsSync(join(toolRoot, 'package.json'))).toBe(false);
    expect(existsSync(join(toolRoot, 'generated'))).toBe(false);
    expect(readdirSync(join(toolRoot, 'src')).sort()).toEqual([
      'catalog.ts',
      'cli.ts',
      'command.ts',
      'drift.ts',
      'generation.ts',
      'handlers.ts',
      'integrity.ts',
      'repository.ts',
      'types.ts',
      'validation.ts',
      'writer.ts',
    ]);
    expect(readFileSync(join(repositoryRoot, 'packages/icons/src/index.ts'), 'utf8')).not.toContain(
      'tooling/icon-pipeline',
    );
  });

  it('keeps pure sources free of effects and registration', () => {
    const source = [
      'catalog.ts',
      'drift.ts',
      'generation.ts',
      'integrity.ts',
      'types.ts',
      'validation.ts',
    ]
      .map((file) => readFileSync(join(toolRoot, 'src', file), 'utf8'))
      .join('\n');
    expect(source).not.toMatch(/node:fs|fetch\(|process\.|customElements|child_process|Date\.now/);
    expect(new Set(source.match(/from 'node:[^']+'/g) ?? [])).toEqual(
      new Set(["from 'node:crypto'"]),
    );
  });
});
