import { describe, expect, it } from 'vitest';

import { hashFileInventory, sha256 } from '../src/hash.ts';

describe('release-candidate hashing', () => {
  it('matches the SHA-256 known vector', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('binds file identity, byte count, digest, and order', () => {
    const files = [
      { path: 'a', bytes: 1, sha256: sha256('a') },
      { path: 'b', bytes: 1, sha256: sha256('b') },
    ];
    expect(hashFileInventory(files)).not.toBe(hashFileInventory([...files].reverse()));
    expect(hashFileInventory(files)).not.toBe(
      hashFileInventory([{ ...files[0]!, bytes: 2 }, files[1]!]),
    );
  });
});
