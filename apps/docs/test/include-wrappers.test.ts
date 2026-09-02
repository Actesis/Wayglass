import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = realpathSync(resolve(testDirectory, '../../..'));
const documentationRoot = resolve(repositoryRoot, 'apps/docs');

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') return [];
      return markdownFiles(path);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
  });
}

describe('VitePress include wrappers', () => {
  it('resolve every include to a regular file inside the repository', () => {
    let wrapperCount = 0;

    for (const wrapper of markdownFiles(documentationRoot)) {
      const source = readFileSync(wrapper, 'utf8');
      if (!source.startsWith('<!--@include:')) continue;

      wrapperCount += 1;
      const match = /^<!--@include: (.+)-->(?:\n)?$/.exec(source);
      expect(match, relative(repositoryRoot, wrapper)).not.toBeNull();

      const target = realpathSync(resolve(dirname(wrapper), match?.[1] ?? ''));
      expect(target.startsWith(`${repositoryRoot}${sep}`), relative(repositoryRoot, wrapper)).toBe(
        true,
      );
      expect(statSync(target).isFile(), relative(repositoryRoot, wrapper)).toBe(true);
    }

    expect(wrapperCount).toBeGreaterThan(0);
  });
});
