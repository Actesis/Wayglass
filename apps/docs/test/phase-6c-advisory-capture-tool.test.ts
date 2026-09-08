import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const record = readFileSync(
  resolve(repositoryRoot, 'docs/governance/phase-6c-advisory-capture-tool.md'),
  'utf8',
).replace(/\s+/g, ' ');

describe('Phase 6C-E5A advisory capture implementation record', () => {
  it('keeps the networked command explicit and isolated', () => {
    expect(record).toContain('not called by `pnpm check`');
    expect(record).toContain('live transport exists only behind this explicit CLI command');
    expect(record).toContain('merging the implementation does not authorize invocation');
    expect(record).toContain('rejects recognized npm, GitHub, Cloudflare');
  });

  it('sends one exact public graph without credentials or fallback', () => {
    expect(record).toContain('exactly seven sorted, unique external nodes');
    expect(record).toContain('only properties are those seven public package names');
    expect(record).toContain('No authorization header, cookie, token');
    expect(record).toContain('no retry, redirect handling, quick-audit fallback');
  });

  it('hashes and losslessly normalizes every provider result', () => {
    expect(record).toContain(
      'SHA-256 hashed before decompression, UTF-8 decoding, or JSON parsing',
    );
    expect(record).toContain('Gzip magic bytes are also recognized');
    expect(record).toContain('retained as a dependency-security warning');
    expect(record).toContain('HTML, malformed JSON, invalid gzip');
    expect(record).toContain('Every returned advisory becomes one E3 finding');
    expect(record).toContain('absent or null field becomes an explicit `null`');
    expect(record).toContain('Provider order is not trusted');
  });

  it('creates one transactional verified snapshot without overwrite', () => {
    expect(record).toContain('hard link creates the finished path atomically');
    expect(record).toContain('reread, byte-compared, parsed, validated');
    expect(record).toContain('concurrently created output belongs to its creator');
    expect(record).toContain('validity deadline is exactly 24 hours');
  });

  it('authorizes only requesting separate E5B capture authority', () => {
    expect(record).toContain('126 focused tests across 22 files');
    expect(record).toContain('never invoke the live HTTPS transport');
    expect(record).toContain('Acceptance completes Phase 6C-E5A');
    expect(record).toContain('does not itself authorize command invocation');
    expect(record).toContain('separate SpaceTraders client');
  });
});
