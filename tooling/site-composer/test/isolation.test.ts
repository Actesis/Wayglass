import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('site-composer import isolation', () => {
  it('imports the public pure module without output or filesystem effects', () => {
    const workingDirectory = mkdtempSync(resolve(tmpdir(), 'wayglass-site-import-'));
    try {
      const entry = pathToFileURL(resolve(import.meta.dirname, '../src/index.ts')).href;
      const output = execFileSync(
        process.execPath,
        [
          '--disable-warning=ExperimentalWarning',
          '--experimental-strip-types',
          '--input-type=module',
          '--eval',
          `await import(${JSON.stringify(entry)});`,
        ],
        { cwd: workingDirectory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );

      expect(output).toBe('');
      expect(readdirSync(workingDirectory)).toEqual([]);
    } finally {
      rmSync(workingDirectory, { recursive: true, force: true });
    }
  });
});
