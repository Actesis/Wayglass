import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6c-manifest-projection-implementation.md');
const normalizedRecord = record.replace(/\s+/g, ' ');
const rootManifest = JSON.parse(read('package.json')) as {
  readonly scripts: Readonly<Record<string, string>>;
};

describe('Phase 6C-B manifest projection implementation record', () => {
  it('keeps the implementation private and dependency-free', () => {
    expect(normalizedRecord).toContain(
      'no package manifest, workspace membership, runtime export, or added dependency',
    );
    expect(() => read('tooling/release-candidate/package.json')).toThrow();
    expect(read('pnpm-workspace.yaml')).not.toContain('tooling/release-candidate');
  });

  it('records exact projection and inspection boundaries', () => {
    for (const fact of [
      'recursively sorted nested object keys',
      'two-space JSON',
      'workspace, filesystem, URL, Git',
      'packed manifest bytes must exactly equal',
      'no `sourcesContent`',
      'keeps `private: true`',
    ]) {
      expect(normalizedRecord).toContain(fact);
    }
  });

  it('wires the retained focused gates into ordinary validation', () => {
    expect(rootManifest.scripts['release-candidate:core:typecheck']).toContain(
      'tooling/release-candidate/tsconfig.json',
    );
    expect(rootManifest.scripts['release-candidate:core:test']).toContain(
      'tooling/release-candidate',
    );
    expect(rootManifest.scripts['release-candidate:core:check']).toContain(
      'release-candidate:core:typecheck',
    );
    expect(rootManifest.scripts.check).toContain('release-candidate:core:check');
    expect(normalizedRecord).toContain('Four test files currently run 30 assertions');
    expect(normalizedRecord).toContain('PNPM_CONFIG_OFFLINE=true TURBO_FORCE=true pnpm check');
    expect(normalizedRecord).toContain('all 20 typecheck tasks');
    expect(normalizedRecord).toContain('all 20 package/application test tasks');
  });

  it('keeps effect work and release authority in later stages', () => {
    expect(normalizedRecord).toContain('**Status:** Accepted by the project owner');
    expect(normalizedRecord).toContain('Phase 6C-B is complete');
    expect(normalizedRecord).toContain('Phase 6C-C still owns the explicit effect adapter');
    expect(normalizedRecord).toContain(
      'authorizes Phase 6C-C isolated assembler implementation only',
    );
    expect(normalizedRecord).toContain('does not accept a tarball');
  });
});
