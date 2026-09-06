import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6c-isolated-assembler-implementation.md');
const normalizedRecord = record.replace(/\s+/g, ' ');
const rootManifest = JSON.parse(read('package.json')) as {
  readonly scripts: Readonly<Record<string, string>>;
};

describe('Phase 6C-C isolated assembler implementation record', () => {
  it('records source, network, credential, and privacy boundaries', () => {
    for (const fact of [
      'frozen 40-character source commit',
      '--offline --frozen-lockfile --ignore-scripts',
      'recognized npm, registry, GitHub, Cloudflare',
      'or changes `private: true`',
      'neither installs nor contacts a registry',
    ]) {
      expect(normalizedRecord).toContain(fact);
    }
  });

  it('records two fresh assemblies, safe retention, and failure cleanup', () => {
    expect(normalizedRecord).toContain('repeats the entire worktree, install, gate, build, stage');
    expect(normalizedRecord).toContain(
      'requires exact package metadata, contents, and tarball hashes',
    );
    expect(normalizedRecord).toContain('only after both passes agree');
    expect(normalizedRecord).toContain(
      'cleanup failure removes any newly created output directory',
    );
    expect(normalizedRecord).toContain('available for explicit recovery');
  });

  it('wires the three accepted private commands', () => {
    expect(rootManifest.scripts['release-candidate:check']).toContain('cli.ts check');
    expect(rootManifest.scripts['release-candidate:build']).toContain('cli.ts build');
    expect(rootManifest.scripts['release-candidate:verify']).toContain('cli.ts verify');
  });

  it('keeps execution and later authority explicit', () => {
    expect(normalizedRecord).toContain('**Status:** Accepted by the project owner');
    expect(normalizedRecord).toContain(
      'Phase 6C-D may create and delete an ephemeral two-pass candidate',
    );
    expect(normalizedRecord).toContain(
      'authorizes Phase 6C-D independent-consumer implementation only',
    );
    expect(normalizedRecord).toContain('does not accept a tarball');
    expect(normalizedRecord).toContain('all 20 typecheck tasks');
    expect(normalizedRecord).toContain('41 release-candidate tests');
    expect(normalizedRecord).toContain('Accepted and merged on September 5, 2026');
  });
});
