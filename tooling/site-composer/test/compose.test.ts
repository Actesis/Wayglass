import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { parseCanonicalSiteManifest } from '../src/manifest.ts';
import { composeSite } from '../src/compose.ts';
import {
  parseBuildArguments,
  parseCheckResponsesArguments,
  parseComposeArguments,
  parseServeArguments,
  parseVerifyArguments,
} from '../src/cli.ts';
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

function partials(value: SiteRepositoryFixture): readonly string[] {
  return readdirSync(value.parent).filter((name) => name.includes('.partial-'));
}

describe('transactional site composition', () => {
  it('creates one complete byte-for-byte artifact with canonical evidence and normalized modes', async () => {
    const value = fixture();
    const output = value.output();
    const result = await composeSite({
      repositoryRoot: value.root,
      output,
      command: value.command,
    });

    expect(result.output).toBe(output);
    expect(result.manifest.surfaces.map(({ id, fileCount }) => ({ id, fileCount }))).toEqual([
      { id: 'documentation', fileCount: 3 },
      { id: 'storybook', fileCount: 6 },
    ]);
    expect(readFileSync(resolve(output, 'index.html'), 'utf8')).toBe('<h1>Wayglass</h1>\n');
    expect(readFileSync(resolve(output, 'storybook/iframe.html'), 'utf8')).toBe(
      '<main>Preview</main>\n',
    );
    const manifest = parseCanonicalSiteManifest(
      readFileSync(resolve(output, 'wayglass-site-manifest.json'), 'utf8'),
    );
    expect(manifest).toEqual(result.manifest);
    expect(lstatSync(output).mode & 0o777).toBe(0o755);
    expect(lstatSync(resolve(output, 'storybook')).mode & 0o777).toBe(0o755);
    expect(lstatSync(resolve(output, 'index.html')).mode & 0o777).toBe(0o644);
    expect(partials(value)).toEqual([]);
  });

  it.each([
    'staging-created',
    'directory-created',
    'file-written',
    'manifest-written',
    'inputs-reinventoried',
    'staging-verified',
    'before-rename',
  ] as const)('removes only owned staging after a %s boundary failure', async (failure) => {
    const value = fixture();
    const output = value.output(`failure-${failure}`);
    await expect(
      composeSite({
        repositoryRoot: value.root,
        output,
        command: value.command,
        onBoundary: ({ boundary }) => {
          if (boundary === failure) throw new Error('injected failure');
        },
      }),
    ).rejects.toMatchObject({ code: 'WG_SITE_COMPOSE' });
    expect(existsSync(output)).toBe(false);
    expect(partials(value)).toEqual([]);
    expect(existsSync(resolve(value.root, 'apps/docs/.vitepress/dist/index.html'))).toBe(true);
  });

  it('keeps the final destination invisible until the verified rename', async () => {
    const value = fixture();
    const output = value.output();
    let observed = false;
    await composeSite({
      repositoryRoot: value.root,
      output,
      command: value.command,
      onBoundary: ({ boundary }) => {
        if (boundary === 'before-rename') {
          observed = true;
          expect(existsSync(output)).toBe(false);
        }
      },
    });
    expect(observed).toBe(true);
    expect(existsSync(output)).toBe(true);
  });

  it('rejects a concurrently created output without changing or removing it', async () => {
    const value = fixture();
    const output = value.output();
    await expect(
      composeSite({
        repositoryRoot: value.root,
        output,
        command: value.command,
        onBoundary: ({ boundary }) => {
          if (boundary === 'before-rename') {
            mkdirSync(output);
            writeFileSync(resolve(output, 'owned-by-caller'), 'keep\n');
          }
        },
      }),
    ).rejects.toThrow('WG_SITE_OUTPUT_EXISTS');
    expect(readFileSync(resolve(output, 'owned-by-caller'), 'utf8')).toBe('keep\n');
    expect(partials(value)).toEqual([]);
  });

  it('rejects an input changed after copying and removes the partial artifact', async () => {
    const value = fixture();
    const output = value.output();
    await expect(
      composeSite({
        repositoryRoot: value.root,
        output,
        command: value.command,
        onBoundary: ({ boundary }) => {
          if (boundary === 'manifest-written') {
            writeFileSync(resolve(value.root, 'apps/docs/.vitepress/dist/index.html'), 'changed\n');
          }
        },
      }),
    ).rejects.toThrow('WG_SITE_INPUT_CHANGED');
    expect(existsSync(output)).toBe(false);
    expect(partials(value)).toEqual([]);
  });

  it('detects staged file tampering before the destination becomes visible', async () => {
    const value = fixture();
    const output = value.output();
    await expect(
      composeSite({
        repositoryRoot: value.root,
        output,
        command: value.command,
        onBoundary: ({ boundary, staging }) => {
          if (boundary === 'inputs-reinventoried') {
            writeFileSync(resolve(staging, 'index.html'), 'tampered\n');
          }
        },
      }),
    ).rejects.toThrow('WG_SITE_STAGED_INVENTORY');
    expect(existsSync(output)).toBe(false);
  });

  it('rejects an unexpected empty staged directory', async () => {
    const value = fixture();
    const output = value.output();
    await expect(
      composeSite({
        repositoryRoot: value.root,
        output,
        command: value.command,
        onBoundary: ({ boundary, staging }) => {
          if (boundary === 'inputs-reinventoried') mkdirSync(resolve(staging, 'unexpected'));
        },
      }),
    ).rejects.toThrow('WG_SITE_STAGED_INVENTORY');
    expect(existsSync(output)).toBe(false);
  });
});

describe('site:compose invocation', () => {
  it('accepts exactly one unambiguous output option', () => {
    expect(parseComposeArguments(['--', '--output', '/tmp/site'])).toBe('/tmp/site');
    for (const invalid of [
      [],
      ['--output'],
      ['--output', '--other'],
      ['--output', '/tmp/a', '--output', '/tmp/b'],
      ['--other', '/tmp/site'],
    ]) {
      expect(() => parseComposeArguments(invalid)).toThrow('WG_SITE_INVOCATION');
    }
  });

  it('keeps build, response-check, compose, and verify path options distinct', () => {
    expect(parseBuildArguments(['--output', '/tmp/build'])).toBe('/tmp/build');
    expect(parseCheckResponsesArguments(['--input', '/tmp/site'])).toBe('/tmp/site');
    expect(parseServeArguments(['--input', '/tmp/site'])).toEqual({ input: '/tmp/site' });
    expect(parseServeArguments(['--port', '4176', '--input', '/tmp/site'])).toEqual({
      input: '/tmp/site',
      port: 4176,
    });
    expect(parseVerifyArguments(['--input', '/tmp/site'])).toBe('/tmp/site');
    expect(() => parseBuildArguments(['--input', '/tmp/build'])).toThrow('WG_SITE_INVOCATION');
    expect(() => parseCheckResponsesArguments(['--output', '/tmp/site'])).toThrow(
      'WG_SITE_INVOCATION',
    );
    expect(() => parseServeArguments(['--input', '/tmp/site', '--port', 'invalid'])).toThrow(
      'WG_SITE_INVOCATION',
    );
    expect(() => parseVerifyArguments(['--output', '/tmp/site'])).toThrow('WG_SITE_INVOCATION');
  });
});
