import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-retained-two-run-orchestrator.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E4 retained two-run orchestrator record', () => {
  it('defines one closed, offline, non-retrying command', () => {
    expect(record).toContain('exactly the frozen source commit');
    expect(record).toContain('no advisory fetch mode, registry fallback, publication mode');
    expect(record).toContain('no automatic retry');
    expect(record).toContain('four underlying assembly passes');
  });

  it('binds audits to exact package and installed dependency bytes', () => {
    expect(record).toContain('same exact unpacked byte arrays inspected by the assembler');
    expect(record).toContain('actual installed production roots and reachable dependency graph');
    expect(record).toContain('must remain inside the frozen worktree');
    expect(record).toContain('registry metadata are not substitutes for those bytes');
  });

  it('retains and verifies one exact transactional bundle', () => {
    expect(record).toContain('renames that directory to the requested output');
    expect(record).toContain('completed output is also removed');
    expect(record).toContain(
      'rejects symlinks, non-regular files, missing files, and unexpected files',
    );
    expect(record).toContain('cross-binds the package audit');
  });

  it('authorizes only separately approved E5 work after acceptance', () => {
    expect(record).toContain('115 focused tests across 21 files');
    expect(record).toContain('Acceptance completes Phase 6C-E4 and authorizes Phase 6C-E5');
    expect(record).toContain(
      'requires separate authority for any dated read-only advisory retrieval',
    );
    expect(record).toContain('does not accept a candidate');
    expect(record).toContain('separate SpaceTraders client');
  });
});
