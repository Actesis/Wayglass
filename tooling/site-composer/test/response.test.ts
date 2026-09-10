import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { composeSite } from '../src/compose.ts';
import { checkSiteResponses, createSiteResponseOracle } from '../src/response.ts';
import { createSiteRepositoryFixture, type SiteRepositoryFixture } from './system-fixtures.ts';

const fixtures: SiteRepositoryFixture[] = [];

async function artifact(): Promise<{ fixture: SiteRepositoryFixture; output: string }> {
  const fixture = createSiteRepositoryFixture();
  fixtures.push(fixture);
  const docs = resolve(fixture.root, 'apps/docs/.vitepress/dist');
  const storybook = resolve(fixture.root, 'apps/storybook/storybook-static');
  renameSync(resolve(docs, 'assets/app.js'), resolve(docs, 'assets/app-A1b2C3d4.js'));
  renameSync(
    resolve(storybook, 'assets/manager.js'),
    resolve(storybook, 'assets/manager-E5f6G7h8.js'),
  );
  writeFileSync(
    resolve(docs, '_headers'),
    readFileSync(resolve(process.cwd(), 'apps/docs/public/_headers')),
  );
  writeFileSync(resolve(docs, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  writeFileSync(
    resolve(docs, 'phase-6.html'),
    '<link rel="canonical" href="https://wayglass.hoagsoftworks.com/phase-6"><h1>Phase 6</h1>\n',
  );
  writeFileSync(
    resolve(docs, '404.html'),
    '<h1>Wayglass: Page not found</h1><a href="/">Documentation</a><a href="/storybook/">Storybook</a>\n',
  );
  mkdirSync(resolve(docs, 'foundations'));
  writeFileSync(resolve(docs, 'foundations/index.html'), '<h1>Foundations</h1>\n');
  for (const [name, value] of [
    ['styles-A1b2C3d4.css', 'body {}\n'],
    ['data-A1b2C3d4.json', '{}\n'],
    ['mark-A1b2C3d4.svg', '<svg/>\n'],
    ['photo-A1b2C3d4.jpg', 'jpg'],
    ['font-A1b2C3d4.woff2', 'font'],
  ] as const) {
    writeFileSync(resolve(docs, 'assets', name), value);
  }
  const output = fixture.output();
  await composeSite({ repositoryRoot: fixture.root, output, command: fixture.command });
  return { fixture, output };
}

function header(
  response: ReturnType<ReturnType<typeof createSiteResponseOracle>['resolve']>,
  name: string,
) {
  return [...response.headers].find(
    ([candidate]) => candidate.toLowerCase() === name.toLowerCase(),
  )?.[1];
}

afterEach(() => {
  for (const fixture of fixtures.splice(0)) fixture.cleanup();
});

describe('independent static response oracle', () => {
  it('enforces the canonical GET and HEAD route matrix', async () => {
    const { output } = await artifact();
    const oracle = checkSiteResponses(output);
    const cases = [
      ['/', 200, 'index.html'],
      ['/index.html', 307, undefined],
      ['/phase-6', 200, 'phase-6.html'],
      ['/phase-6.html?q=1', 307, undefined],
      ['/phase-6/', 307, undefined],
      ['/foundations', 307, undefined],
      ['/foundations/', 200, 'foundations/index.html'],
      ['/foundations/index', 307, undefined],
      ['/storybook', 307, undefined],
      ['/storybook/', 200, 'storybook/index.html'],
      ['/storybook/iframe?viewMode=story', 200, 'storybook/iframe.html'],
      ['/unknown', 404, '404.html'],
      ['/storybook/missing.js', 404, '404.html'],
      ['/_headers', 404, '404.html'],
      ['/wayglass-site-manifest.json', 200, 'wayglass-site-manifest.json'],
    ] as const;
    for (const method of ['GET', 'HEAD'] as const) {
      for (const [path, status, assetPath] of cases) {
        const response = oracle.resolve(path, method);
        expect([method, path, response.status, response.assetPath]).toEqual([
          method,
          path,
          status,
          assetPath,
        ]);
        if (method === 'HEAD') expect(response.body).toHaveLength(0);
      }
    }
    expect(header(oracle.resolve('/phase-6.html?q=1'), 'Location')).toBe('/phase-6?q=1');
    expect(oracle.resolve('/phase-6.html?q=1').headers).toHaveLength(1);
  });

  it('assigns MIME, cache, security, and indexing policy to terminal responses', async () => {
    const { output } = await artifact();
    const oracle = createSiteResponseOracle(output);
    const types = [
      ['/phase-6', 'text/html; charset=utf-8'],
      ['/assets/app-A1b2C3d4.js', 'text/javascript; charset=utf-8'],
      ['/assets/styles-A1b2C3d4.css', 'text/css; charset=utf-8'],
      ['/assets/data-A1b2C3d4.json', 'application/json'],
      ['/assets/mark-A1b2C3d4.svg', 'image/svg+xml'],
      ['/assets/photo-A1b2C3d4.jpg', 'image/jpeg'],
      ['/assets/font-A1b2C3d4.woff2', 'font/woff2'],
    ] as const;
    for (const [path, type] of types)
      expect(header(oracle.resolve(path), 'Content-Type')).toBe(type);

    expect(header(oracle.resolve('/phase-6'), 'Cache-Control')).toBe(
      'public, max-age=0, must-revalidate',
    );
    expect(header(oracle.resolve('/assets/app-A1b2C3d4.js'), 'Cache-Control')).toBe(
      'public, max-age=31536000, immutable',
    );
    const docs = oracle.resolve('/phase-6');
    expect(header(docs, 'X-Content-Type-Options')).toBe('nosniff');
    expect(header(docs, 'Content-Security-Policy')).toContain("default-src 'self'");
    expect(header(docs, 'X-Robots-Tag')).toBeUndefined();
    expect(header(oracle.resolve('/storybook/'), 'X-Robots-Tag')).toBe('noindex');
    expect(
      header(oracle.resolve('https://v1.wayglass.workers.dev/storybook/'), 'X-Robots-Tag'),
    ).toBe('noindex, noindex, nofollow');
  });

  it('fails closed on encoded separators, unsupported methods, and unknown MIME types', async () => {
    const { output } = await artifact();
    const oracle = createSiteResponseOracle(output);
    expect(oracle.resolve('/storybook%2Fiframe')).toMatchObject({
      status: 404,
      assetPath: '404.html',
    });
    expect(oracle.resolve('/%E0%A4%A')).toMatchObject({ status: 404, assetPath: '404.html' });
    expect(() => oracle.resolve('/', 'POST' as 'GET')).toThrow('WG_SITE_RESPONSE_METHOD');
    expect(() => oracle.resolve('/robots.txt')).not.toThrow();
  });

  it('rejects an unversioned file in an immutable namespace', async () => {
    const fixture = createSiteRepositoryFixture();
    fixtures.push(fixture);
    writeFileSync(
      resolve(fixture.root, 'apps/docs/.vitepress/dist/_headers'),
      readFileSync(resolve(process.cwd(), 'apps/docs/public/_headers')),
    );
    const output = fixture.output();
    await composeSite({ repositoryRoot: fixture.root, output, command: fixture.command });
    expect(() => createSiteResponseOracle(output)).toThrow('WG_SITE_RESPONSE_IMMUTABLE');
  });
});
