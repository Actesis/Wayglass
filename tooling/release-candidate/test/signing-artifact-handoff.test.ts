import { describe, expect, it } from 'vitest';
import { sha256 } from '../src/hash.ts';
import { verifySigningArtifactHandoff } from '../src/signing-artifact-handoff.ts';
import { readSigningArtifactEntries } from '../src/signing-handoff-cli.ts';

it('rejects extra, duplicate or missing entries before streaming any member', () => {
  const entries = [
    'publication-evidence.json',
    ...['core', 'tokens', 'themes', 'elements', 'icons', 'react'].map(
      (name) => `packages/wayglass-${name}-0.1.0.tgz`,
    ),
  ];
  for (const listing of [
    entries.slice(1),
    [...entries, entries[0]],
    [...entries, '../unexpected'],
  ]) {
    expect(() =>
      readSigningArtifactEntries((entry) => {
        expect(entry).toBeUndefined();
        return Buffer.from(listing.join('\n') + '\n');
      }),
    ).toThrow('Unexpected signing artifact inventory.');
  }
});

const bytes = Buffer.from('fictional archive bytes');
const expected = { id: 2, runId: 3, attempt: 1, commit: 'a'.repeat(40), sha256: sha256(bytes) };
const metadata = {
  id: 2,
  name: 'signing-inputs-3-1',
  expired: false,
  digest: `sha256:${expected.sha256}`,
  size_in_bytes: bytes.length,
  workflow_run: {
    id: 3,
    repository_id: 1314007333,
    head_repository_id: 1314007333,
    head_branch: 'main',
    head_sha: expected.commit,
  },
};

describe('signing artifact handoff', () => {
  it('accepts a matching immutable artifact and snapshots the verified bytes', () => {
    const input = Buffer.from(bytes);
    const result = verifySigningArtifactHandoff({ expected, metadata, bytes: input });
    input.fill(0);
    expect(result).toEqual(bytes);
  });
  it('rejects swapped, expired, or unbound artifact metadata', () => {
    for (const change of [
      { id: 9 },
      { name: 'signing-inputs-3-2' },
      { expired: true },
      { digest: null },
      { workflow_run: null },
      { workflow_run: { ...metadata.workflow_run, id: 9 } },
      { workflow_run: { ...metadata.workflow_run, head_repository_id: 9 } },
      { workflow_run: { ...metadata.workflow_run, head_sha: 'b'.repeat(40) } },
    ])
      expect(() =>
        verifySigningArtifactHandoff({ expected, metadata: { ...metadata, ...change }, bytes }),
      ).toThrow(/WG_SIGNING_HANDOFF/);
  });
  it('rejects modified bytes, even at the right length', () => {
    expect(() =>
      verifySigningArtifactHandoff({ expected, metadata, bytes: Buffer.alloc(bytes.length) }),
    ).toThrow(/WG_SIGNING_HANDOFF/);
  });
});
