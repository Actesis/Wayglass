import { existsSync } from 'node:fs';

import { afterEach, describe, expect, it } from 'vitest';

import { buildSite } from '../src/build.ts';
import { SiteComposerError } from '../src/error.ts';
import type { LocalCommand } from '../src/repository.ts';
import { verifySite } from '../src/verify.ts';
import { createSiteRepositoryFixture, type SiteRepositoryFixture } from './system-fixtures.ts';

const fixtures: SiteRepositoryFixture[] = [];

function fixture(): SiteRepositoryFixture {
  const value = createSiteRepositoryFixture();
  fixtures.push(value);
  return value;
}

afterEach(() => {
  for (const value of fixtures.splice(0)) value.cleanup();
});

describe('retained site build orchestration', () => {
  it('builds both producers in order, composes, and independently verifies', async () => {
    const value = fixture();
    const calls: string[] = [];
    const command: LocalCommand = (executable, arguments_, cwd) => {
      if (executable === 'pnpm' && arguments_[0] !== '--version') {
        calls.push(arguments_.join(' '));
        return new Uint8Array();
      }
      return value.command(executable, arguments_, cwd);
    };
    const output = value.output();
    const result = await buildSite({ repositoryRoot: value.root, output, command });

    expect(calls).toEqual(['--filter @wayglass/docs build', '--filter @wayglass/storybook build']);
    expect(result.input).toBe(output);
    expect(existsSync(output)).toBe(true);
  });

  it('does not leave an artifact after a producer failure', async () => {
    const value = fixture();
    const command: LocalCommand = (executable, arguments_, cwd) => {
      if (executable === 'pnpm' && arguments_[0] === '--filter') {
        throw new SiteComposerError('WG_TEST_PRODUCER', 'Injected producer failure.');
      }
      return value.command(executable, arguments_, cwd);
    };
    const output = value.output();
    await expect(buildSite({ repositoryRoot: value.root, output, command })).rejects.toThrow(
      'WG_TEST_PRODUCER',
    );
    expect(existsSync(output)).toBe(false);
  });

  it('removes its composed artifact when independent verification fails', async () => {
    const value = fixture();
    const output = value.output();
    await expect(
      buildSite({
        repositoryRoot: value.root,
        output,
        command: value.command,
        verify: () => {
          throw new SiteComposerError('WG_TEST_VERIFY', 'Injected verifier failure.');
        },
      }),
    ).rejects.toThrow('WG_TEST_VERIFY');
    expect(existsSync(output)).toBe(false);
  });

  it('removes its composed artifact when verifier identity differs', async () => {
    const value = fixture();
    const output = value.output();
    await expect(
      buildSite({
        repositoryRoot: value.root,
        output,
        command: value.command,
        verify: (input) => {
          const accepted = verifySite(input);
          return {
            ...accepted,
            manifest: {
              ...accepted.manifest,
              bundleSha256: '0'.repeat(64),
            },
          };
        },
      }),
    ).rejects.toThrow('WG_SITE_BUILD_VERIFY');
    expect(existsSync(output)).toBe(false);
  });
});
