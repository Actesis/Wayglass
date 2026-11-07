import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const result = read('docs/governance/hosted-publication-rehearsal-result.md').replace(/\s+/g, ' ');

// These tests preserve the reviewed record, not replace verification of the actual retained ZIP.
describe('hosted public archive and consumer result record', () => {
  it('binds the exact owner-approved run, source, tooling, artifact, and expiry', () => {
    for (const text of [
      '42412111878',
      'Actesis',
      'npm-release',
      'workflow_dispatch',
      'ce400e89930a047c6af1c6992c64cfe422a1eeee',
      '7e48e4800405ff0d9f6103ba4021e62b2f89a28b',
      '37373c5dd9565741beb4123a348579a163a8cb22',
      '13589981847',
      '2026-11-14T20:46:51Z',
      '4e4420000766bd883b87f3e38c0cfef637988475922dd8d0d18c8e4fe1e98dc9',
    ])
      expect(result).toContain(text);
  });
  it('retains all six exact hosted archive hashes and the independent proof identities', () => {
    for (const [name, hash] of [
      ['core', 'a04bc68be7e7503eaa0be77845dd933762b4b522d1bb2c9f97d6fdc13ad709c3'],
      ['tokens', '3aa088c67b9585eee8dffca83dd5a9985846f4e2f7892dc765e0f67db1b123e6'],
      ['themes', '8b56c019e791a9a499dc2f4424e8a9b1651818e12b58f6fea9d54a63b47f7288'],
      ['elements', 'eb4b48a8c9457562765c7e121a5a1c60d52b2013cc9c9b4418e9446756dbd278'],
      ['icons', '1adab11ea9f60142e74b7067438c9f23e5922981910547342a9bc93f9ddcd862'],
      ['react', 'd3a88664ab7a48b9ce8f88f36e531beb27dc8c180c55b748ad5adfbb31243c31'],
    ]) {
      expect(result).toContain(`@wayglass/${name}`);
      expect(result).toContain(hash);
    }
    for (const hash of [
      '17a5a59f5b12d90f8582f8c946055feabf17757addd09cd546bf4062db3d5b9a',
      '5729d7b4378bb60df98dce1766e3b11399e3f77b054ed098a17030a5bd4024e6',
      'ef7822fc69be20047b10fcc3d484dda12e98a8f730df3b8c46ea78cf1ce13331',
      '4d43775a29d435ab71a9771a7b959031554a7e5826ea207aa3544a7533a4937e',
    ])
      expect(result).toContain(hash);
  });
  it('records exact automated coverage without converting it into release authority or broader support', () => {
    for (const text of [
      '48 files',
      '36 browser cases',
      'zero automated axe violations',
      'complete decompressed tar stream',
      'hostedRunAuthenticated: false',
      'not provenance',
      'Not final artifact acceptance',
      'No npm publication occurred',
      'No proof field was edited',
      'Windows/NVDA',
      'durable retention',
      'dist-tag',
      'advisory freshness',
    ])
      expect(result).toContain(text);
  });
  it('links the result without closing final artifact acceptance', () => {
    expect(read('docs/governance/initial-npm-release.md')).toContain(
      '[ ] Approve the exact public manifests',
    );
    expect(read('docs/governance/initial-npm-release.md')).toContain(
      './hosted-publication-rehearsal-result.md',
    );
    expect(read('docs/governance/hosted-publication-rehearsal.md')).toContain(
      './hosted-publication-rehearsal-result.md',
    );
  });
});
