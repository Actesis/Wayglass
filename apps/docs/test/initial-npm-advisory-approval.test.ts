import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');

describe('initial npm advisory approval', () => {
  it('preserves the exact approved bytes, warning, findings, and expiry', () => {
    const bytes = readFileSync(
      resolve(root, 'docs/governance/evidence/initial-npm-advisory-2026-11-07.json'),
    );
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      '85541ecda62c2eec096bef4d60b13dceddab71c8f70fe8264a9361922c47df6f',
    );
    const snapshot = JSON.parse(bytes.toString('utf8'));
    expect(snapshot.findings).toEqual([]);
    expect(snapshot.notices.map((notice: { code: string }) => notice.code)).toEqual([
      'WG_RC_ADVISORY_MEDIA_TYPE',
    ]);
    expect(Date.parse(snapshot.source.validThrough) - Date.parse(snapshot.source.capturedAt)).toBe(
      24 * 60 * 60 * 1000,
    );
    const record = readFileSync(
      resolve(root, 'docs/governance/initial-npm-advisory-approval.md'),
      'utf8',
    );
    expect(record).toContain('not publication approval');
    expect(record).toContain('Approval does not extend freshness');
  });
});
