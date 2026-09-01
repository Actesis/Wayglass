import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveExchangeOutputPath } from '../src/output-path.js';
import { repositoryRoot } from '../src/repository.js';

describe('private exchange output policy', () => {
  it('accepts repository-local and operating-system temporary destinations', async () => {
    await expect(resolveExchangeOutputPath('.token-output', repositoryRoot)).resolves.toBe(
      join(repositoryRoot, '.token-output'),
    );
    await expect(resolveExchangeOutputPath('wayglass-output', '/tmp')).resolves.toMatch(
      /\/tmp\/wayglass-output$/,
    );
  });

  it('rejects the repository itself even when the checkout is under a temporary root', async () => {
    await expect(resolveExchangeOutputPath('.', repositoryRoot)).rejects.toThrow(
      /inside the repository or an operating-system temporary directory/,
    );
  });

  it('rejects destinations outside repository or temporary roots', async () => {
    await expect(
      resolveExchangeOutputPath('wayglass-output', dirname(repositoryRoot)),
    ).rejects.toThrow(/inside the repository or an operating-system temporary directory/);
    await expect(resolveExchangeOutputPath('packages/tokens/src', repositoryRoot)).rejects.toThrow(
      /nonempty and has no recognized Wayglass exchange state/,
    );
  });
});
