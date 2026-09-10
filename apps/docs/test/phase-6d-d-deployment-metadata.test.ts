import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { CANONICAL_ORIGIN, canonicalRoute, canonicalUrl } from '../.vitepress/delivery.ts';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const headers = read('apps/docs/public/_headers');
const robots = read('apps/docs/public/robots.txt');
const notFound = read('apps/docs/.vitepress/theme/WayglassNotFound.vue');
const record = read('docs/governance/phase-6d-d-deployment-metadata-implementation.md').replace(
  /\s+/g,
  ' ',
);

describe('Phase 6D-D deployment metadata', () => {
  it('derives one production canonical URL from each documentation source path', () => {
    expect(CANONICAL_ORIGIN).toBe('https://wayglass.hoagsoftworks.com');
    expect(canonicalRoute('index.md')).toBe('/');
    expect(canonicalRoute('phase-6.md')).toBe('/phase-6');
    expect(canonicalRoute('foundations/index.md')).toBe('/foundations/');
    expect(canonicalUrl('guides/application-authoring.md')).toBe(
      'https://wayglass.hoagsoftworks.com/guides/application-authoring',
    );
    expect(canonicalUrl('404.md')).toBeUndefined();
  });

  it('keeps common response rules singular and adds only narrow cache and indexing rules', () => {
    expect(headers.match(/^\/\*$/gm)).toHaveLength(1);
    expect(headers).toContain('Cache-Control: public, max-age=0, must-revalidate');
    expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
    expect(headers).toContain('/assets/*');
    expect(headers).toContain('/storybook/assets/*');
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('X-Frame-Options: SAMEORIGIN');
    expect(headers).toContain("frame-ancestors 'self'");
    expect(headers).not.toContain("'unsafe-eval'");
    expect(headers).not.toContain('https://*');
  });

  it('keeps Storybook and every workers.dev preview out of search indexes', () => {
    expect(headers).toContain('/storybook/*\n  X-Robots-Tag: noindex');
    expect(headers).toContain(
      'https://:version.:subdomain.workers.dev/*\n  X-Robots-Tag: noindex, nofollow',
    );
    expect(robots).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://wayglass.hoagsoftworks.com/sitemap.xml\n',
    );
  });

  it('provides a useful, non-redirecting error surface with both destinations', () => {
    expect(notFound).toContain('Page not found');
    expect(notFound).toContain('href="/"');
    expect(notFound).toContain('href="/storybook/" target="_self"');
    expect(notFound).toContain('aria-label="Not found destinations"');
    expect(notFound).toContain(':focus-visible');
    expect(notFound).toContain('@media (forced-colors: active)');
    expect(notFound).not.toMatch(/http-equiv|location\.|setTimeout/i);
  });

  it('keeps every authored header line within Cloudflare limits', () => {
    for (const line of headers.split('\n')) expect(line.length).toBeLessThanOrEqual(2_000);
  });

  it('records the exact clean artifact and preserves the next authority boundary', () => {
    expect(record).toContain('05060f8a41f329cab8142e051146b6f34e93fdf2e20be1d7a724fea184b8fc2a');
    expect(record).toContain('444c35d1c524095e44a047ddd159a16a20851d920c91926ff2846a4ed8d50c5f');
    expect(record).toContain('719 files; 36,713,250 bytes');
    expect(record).toContain('independent response emulator/checker');
    expect(record).toContain('does not authorize Wrangler installation or configuration');
    expect(record).toContain('preview upload');
    expect(record).toContain('npm publication');
  });
});
