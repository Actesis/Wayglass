import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { validateSiteRepository } from '../src/repository.ts';
import type { LocalCommand } from '../src/repository.ts';
import { createSiteRepositoryFixture, type SiteRepositoryFixture } from './system-fixtures.ts';

const fixtures: SiteRepositoryFixture[] = [];

function fixture(options: { readonly docsName?: string } = {}): SiteRepositoryFixture {
  const value = createSiteRepositoryFixture(options);
  fixtures.push(value);
  return value;
}

afterEach(() => {
  for (const value of fixtures.splice(0)) value.cleanup();
});

describe('site repository validation', () => {
  it('authenticates clean source, tooling, lockfile, packages, and environment', () => {
    const value = fixture();
    expect(validateSiteRepository(value.root, value.command)).toMatchObject({
      root: value.root,
      source: {
        commit: expect.stringMatching(/^[0-9a-f]{40}$/),
        tree: expect.stringMatching(/^[0-9a-f]{40}$/),
        lockfileSha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      },
      tooling: {
        commit: expect.stringMatching(/^[0-9a-f]{40}$/),
        tree: expect.stringMatching(/^[0-9a-f]{40}$/),
      },
      versions: { documentation: '0.1.0', storybook: '0.2.0' },
      environment: { pnpm: '11.9.0' },
    });
  });

  it('rejects a nested invocation and repository dirtiness outside producer outputs', () => {
    const value = fixture();
    expect(() => validateSiteRepository(resolve(value.root, 'apps'), value.command)).toThrow(
      'WG_SITE_REPOSITORY',
    );
    writeFileSync(resolve(value.root, 'README.md'), 'dirty\n');
    expect(() => validateSiteRepository(value.root, value.command)).toThrow('WG_SITE_SOURCE_DIRTY');
  });

  it('allows ignored producer output without allowing other untracked files', () => {
    const value = fixture();
    writeFileSync(resolve(value.root, 'apps/docs/.vitepress/dist/new.html'), 'generated\n');
    expect(() => validateSiteRepository(value.root, value.command)).not.toThrow();
    writeFileSync(resolve(value.root, 'untracked.txt'), 'not generated\n');
    expect(() => validateSiteRepository(value.root, value.command)).toThrow('WG_SITE_SOURCE_DIRTY');
  });

  it('independently rejects changed tracked bytes and wrong package identity', () => {
    const value = fixture();
    writeFileSync(resolve(value.root, 'pnpm-lock.yaml'), 'changed\n');
    const command: LocalCommand = (executable, arguments_, cwd) => {
      if (executable === 'git' && arguments_[0] === 'status') return new Uint8Array();
      return value.command(executable, arguments_, cwd);
    };
    expect(() => validateSiteRepository(value.root, command)).toThrow('WG_SITE_SOURCE_CHANGED');

    const wrong = fixture({ docsName: '@wayglass/not-docs' });
    expect(() => validateSiteRepository(wrong.root, wrong.command)).toThrow(
      'WG_SITE_PACKAGE_IDENTITY',
    );
  });

  it('rejects a pnpm runtime that differs from the committed pin', () => {
    const value = fixture();
    const command: LocalCommand = (executable, arguments_, cwd) => {
      if (executable === 'pnpm') return Buffer.from('10.0.0\n');
      return execFileSync(executable, arguments_, { cwd, encoding: 'buffer' });
    };
    expect(() => validateSiteRepository(value.root, command)).toThrow('WG_SITE_PACKAGE_MANAGER');
  });

  it('rejects an absent committed package manifest', () => {
    const value = fixture();
    mkdirSync(resolve(value.root, 'unused'));
    const command: LocalCommand = (executable, arguments_, cwd) => {
      if (executable === 'git' && arguments_[0] === 'show') {
        const path = arguments_[1];
        if (path === 'HEAD:apps/docs/package.json') throw new Error('missing');
      }
      return value.command(executable, arguments_, cwd);
    };
    expect(() => validateSiteRepository(value.root, command)).toThrow();
  });
});
