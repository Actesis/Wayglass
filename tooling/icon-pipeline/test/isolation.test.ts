import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const toolRoot = fileURLToPath(new URL('..', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));

describe('private icon-pipeline isolation', () => {
  it('has no package or runtime dependency and owns only the assigned generated outputs', () => {
    expect(existsSync(join(toolRoot, 'package.json'))).toBe(false);
    expect(readdirSync(join(toolRoot, 'generated')).sort()).toEqual([
      'output-manifest.json',
      'review-index.html',
      'source-manifest.json',
    ]);
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
    const runtime = ['index.ts', 'icon.ts', 'runtime.ts']
      .map((file) => readFileSync(join(repositoryRoot, 'packages/icons/src', file), 'utf8'))
      .join('\n');
    expect(runtime).not.toContain('tooling/icon-pipeline');
    expect(runtime).toContain('./generated/catalog.js');
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
