import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { runTokenToolingCheck } from '../src/check.js';

const revision = '0123456789abcdef0123456789abcdef01234567';

async function trackedArtifact(name: string): Promise<string> {
  return readFile(new URL(`../../../${name}`, import.meta.url), 'utf8');
}

describe('write-free token-tooling check', () => {
  it('matches every tracked web artifact and verifies the in-memory exchange', async () => {
    await expect(runTokenToolingCheck({ sourceRevision: revision })).resolves.toEqual({
      sourceRevision: revision,
      tokens: 528,
      overrides: 197,
      webArtifacts: 3,
      exchangeFiles: 7,
    });
  });

  it('reports the exact tracked artifact that drifted without printing its content', async () => {
    await expect(
      runTokenToolingCheck({
        sourceRevision: revision,
        readWebArtifact: async (name) =>
          name === 'packages/tokens/dist/tokens.json'
            ? 'arbitrary content that must not be diagnosed'
            : trackedArtifact(name),
      }),
    ).rejects.toMatchObject({
      code: 'WG-TOKEN-CHECK-001',
      message:
        'Generated web artifact "packages/tokens/dist/tokens.json" does not match the tracked artifact.',
      exitCode: 1,
    });
  });

  it('maps invalid exchange input to a stable validation diagnostic', async () => {
    await expect(runTokenToolingCheck({ sourceRevision: 'not-a-revision' })).rejects.toMatchObject({
      code: 'WG-TOKEN-CHECK-002',
      message: 'Token source, web transform, or exchange validation failed.',
      exitCode: 1,
    });
  });
});
