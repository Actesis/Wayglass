import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const proofRoot = fileURLToPath(new URL('..', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));

function filesBelow(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isFile()) return [path];
    return entry.isDirectory() && entry.name !== 'node_modules' ? filesBelow(path) : [];
  });
}

describe('Phase 5E private proof boundary', () => {
  it('has no package, dependency, credential, network, registration, or import-time transport', () => {
    const files = filesBelow(proofRoot);
    expect(files.some((path) => path.endsWith('package.json'))).toBe(false);

    const executable = filesBelow(join(proofRoot, 'src'))
      .filter((path) => ['.ts', '.js'].includes(extname(path)))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    expect(executable).not.toMatch(
      /\b(?:fetch|WebSocket|XMLHttpRequest|EventSource|sendBeacon)\b|process\.env|customElements\.define|Authorization|Bearer\s|access[_-]?token/i,
    );
  });

  it('limits imports to local modules and existing test tools', () => {
    const importPattern = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
    for (const path of filesBelow(proofRoot).filter((file) => extname(file) === '.ts')) {
      for (const match of readFileSync(path, 'utf8').matchAll(importPattern)) {
        const specifier = match[1]!;
        expect(
          specifier.startsWith('.') || /^(?:node:[^/]+|vitest(?:\/config)?)$/.test(specifier),
          `${relative(repositoryRoot, path)} imports ${specifier}`,
        ).toBe(true);
      }
    }
  });

  it('runs the accepted private proof in the ordinary root gate', () => {
    const manifest = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(manifest.scripts['experiment:phase5e:check']).toBe(
      'pnpm experiment:phase5e:typecheck && pnpm experiment:phase5e:test',
    );
    expect(manifest.scripts.check?.split(' && ')).toContain('pnpm experiment:phase5e:check');
  });
});
