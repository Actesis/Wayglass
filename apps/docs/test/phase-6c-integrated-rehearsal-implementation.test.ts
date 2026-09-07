import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-integrated-rehearsal-implementation.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-D5 integrated rehearsal implementation record', () => {
  it('binds the exact source, candidates, consumers, and browser cases', () => {
    expect(record).toContain('ce400e89930a047c6af1c6992c64cfe422a1eeee');
    expect(record).toContain('six byte-identical private candidate tarballs');
    expect(record).toContain('two Vanilla and four React');
    expect(record).toContain('exactly 36 browser cases');
    expect(record).toContain('cannot substitute a pre-existing candidate directory');
  });

  it('preflights exact third-party material without widening the boundary', () => {
    for (const version of ['`5.9.3`', '`6.0.3`', '`8.1.5`', '`19.0.0`', '`19.2.8`']) {
      expect(record).toContain(version);
    }
    expect(record).toContain('third-party-only manifests');
    expect(record).toContain('`--offline`, `--ignore-scripts`');
    expect(record).toContain('does not fall back to another version');
  });

  it('records the exact honest preflight and assembly failures', () => {
    expect(record).toContain('missing `postcss@8.5.28`');
    expect(record).toContain('zero downloaded packages');
    expect(record).toContain('`ERR_PNPM_NO_OFFLINE_TARBALL`');
    expect(record).toContain('No candidate assembly, consumer build, browser launch');
    expect(record).toContain('exact six third-party-only graphs');
    expect(record).toContain('`pnpm@11.9.0`');
    expect(record).toContain('`npm_config_store_dir`');
    expect(record).toContain('Neither additional attempt created a candidate tarball');
    expect(record).toContain('Homebrew pnpm `11.25.0` launcher');
    expect(record).toContain('temporary `PATH` shim');
    expect(record).toContain('there is no fallback to the registry, another store');
    expect(record).toContain('`ERR_PNPM_NO_OFFLINE_META`');
    expect(record).toContain('pnpm override for every scenario-owned `@wayglass/*` package');
    expect(record).toContain('current consumer pnpm `11.25.0`');
    expect(record).toContain('tool-owned `pnpm-workspace.yaml`');
    expect(record).toContain("fixture's `tokens[0]` expression");
    expect(record).toContain('`color.semantic.text.primary` key');
    expect(record).toContain('`page-has-heading-one`');
    expect(record).toContain('persistent descriptive `h1`');
    expect(record).toContain('`ERR_PNPM_UNEXPECTED_STORE`');
    expect(record).toContain('pins `pnpm_config_store_dir` in the isolated consumer environment');
    expect(record).toContain('TypeScript reported `TS2882`');
    expect(record).toContain('conventional `vite/client` reference file');
    expect(record).toContain('rejected `--offline` and `--ignore-scripts`');
    expect(record).toContain('`npm_config_ignore_scripts=true`');
  });

  it('keeps D5 open and retains the release boundary', () => {
    expect(record).toContain('74 assertions across 16 files');
    expect(record).toContain('including 250 documentation assertions');
    expect(record).toContain('does not complete Phase 6C-D5');
    expect(record).toContain('does not authorize further registry or npm access');
  });
});
