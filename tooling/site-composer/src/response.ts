import { readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { SITE_MANIFEST_PATH } from './constants.ts';
import { fail } from './error.ts';
import { appliedSiteHeaders, parseSiteHeaders, type SiteHeaderRule } from './headers.ts';
import type { VerifiedSiteResult } from './types.ts';
import { verifySite } from './verify.ts';

const DEFAULT_CACHE = 'public, max-age=0, must-revalidate';
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';
const FINGERPRINT = /[-.][A-Za-z0-9_-]{6,}(?:\.[^.]+)+$/;

const MIME_TYPES: Readonly<Record<string, string>> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

export type SiteReadMethod = 'GET' | 'HEAD';
export type SiteResponseKind = 'asset' | 'not-found' | 'redirect';

export interface SiteResponse {
  readonly status: 200 | 307 | 404;
  readonly kind: SiteResponseKind;
  readonly headers: ReadonlyMap<string, string>;
  readonly body: Uint8Array;
  readonly assetPath?: string;
}

export interface SiteResponseOracle {
  readonly site: VerifiedSiteResult;
  resolve(request: string | URL, method?: SiteReadMethod): SiteResponse;
}

function mimeType(path: string): string {
  const type = MIME_TYPES[extname(path).toLowerCase()];
  if (type === undefined)
    fail('WG_SITE_RESPONSE_MIME', `No admitted MIME type exists for "${path}".`);
  return type;
}

function safePathname(url: URL): string | undefined {
  try {
    const segments = url.pathname.split('/').map((segment) => decodeURIComponent(segment));
    if (
      segments.some(
        (segment) => segment.includes('/') || segment.includes('\\') || segment.includes('\0'),
      )
    ) {
      return undefined;
    }
    return segments.join('/');
  } catch {
    return undefined;
  }
}

function redirect(location: string): SiteResponse {
  return {
    status: 307,
    kind: 'redirect',
    headers: new Map([['Location', location]]),
    body: new Uint8Array(),
  };
}

function canonicalRoute(
  pathname: string,
  files: ReadonlySet<string>,
): { path?: string; redirect?: string } {
  const relative = pathname.slice(1);
  if (pathname === '/') return files.has('index.html') ? { path: 'index.html' } : {};
  if (relative === '_headers') return {};
  if (files.has(relative) && !relative.endsWith('.html')) return { path: relative };

  if ((relative === 'index' || relative === 'index.html') && files.has('index.html')) {
    return { redirect: '/' };
  }
  if (relative.endsWith('/index.html') || relative.endsWith('/index')) {
    const directory = relative.replace(/\/index(?:\.html)?$/, '');
    if (files.has(`${directory}/index.html`)) return { redirect: `/${directory}/` };
  }
  if (relative.endsWith('.html') && files.has(relative)) {
    return { redirect: `/${relative.slice(0, -'.html'.length)}` };
  }
  if (relative.endsWith('/')) {
    if (files.has(`${relative}index.html`)) return { path: `${relative}index.html` };
    const clean = relative.slice(0, -1);
    if (files.has(`${clean}.html`)) return { redirect: `/${clean}` };
    return {};
  }
  if (files.has(`${relative}.html`)) return { path: `${relative}.html` };
  if (files.has(`${relative}/index.html`)) return { redirect: `/${relative}/` };
  return {};
}

function mergeHeaders(
  base: ReadonlyMap<string, string>,
  custom: ReadonlyMap<string, string>,
): Map<string, string> {
  const result = new Map(base);
  for (const [name, value] of custom) {
    const existingName = [...result.keys()].find(
      (candidate) => candidate.toLowerCase() === name.toLowerCase(),
    );
    if (existingName !== undefined) result.delete(existingName);
    result.set(name, value);
  }
  return result;
}

function assertImmutableFiles(files: readonly string[]): void {
  for (const path of files) {
    if (
      (path.startsWith('assets/') || path.startsWith('storybook/assets/')) &&
      !FINGERPRINT.test(path)
    ) {
      fail('WG_SITE_RESPONSE_IMMUTABLE', `Immutable asset "${path}" has no content fingerprint.`);
    }
  }
}

function assertHeaderPolicy(rules: readonly SiteHeaderRule[]): void {
  const global = rules.find((rule) => rule.pattern === '/*');
  if (global === undefined)
    fail('WG_SITE_RESPONSE_HEADERS', 'The global response-header rule is missing.');
  const names = new Set(global.headers.map(([name]) => name.toLowerCase()));
  for (const required of [
    'content-security-policy',
    'permissions-policy',
    'referrer-policy',
    'x-content-type-options',
    'x-frame-options',
  ]) {
    if (!names.has(required))
      fail('WG_SITE_RESPONSE_HEADERS', `The global ${required} header is missing.`);
  }
  if (names.has('cache-control')) {
    fail(
      'WG_SITE_RESPONSE_HEADERS',
      'Global Cache-Control would combine with immutable overrides.',
    );
  }
  for (const pattern of [
    '/assets/*',
    '/storybook/assets/*',
    '/storybook/*',
    'https://:version.:subdomain.workers.dev/*',
  ]) {
    if (!rules.some((rule) => rule.pattern === pattern)) {
      fail('WG_SITE_RESPONSE_HEADERS', `The required ${pattern} header rule is missing.`);
    }
  }
}

function header(response: SiteResponse, name: string): string | undefined {
  return [...response.headers].find(
    ([candidate]) => candidate.toLowerCase() === name.toLowerCase(),
  )?.[1];
}

function assertResponseHeader(response: SiteResponse, name: string, expected: string): void {
  if (header(response, name) !== expected) {
    fail('WG_SITE_RESPONSE_MATRIX', `Response header ${name} did not match the frozen contract.`);
  }
}

function decodeBody(response: SiteResponse): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(response.body);
}

export function createSiteResponseOracle(input: string): SiteResponseOracle {
  const site = verifySite(input);
  const files = new Set(site.manifest.files.map((file) => file.path));
  assertImmutableFiles([...files]);
  if (!files.has('_headers') || !files.has('404.html')) {
    fail('WG_SITE_RESPONSE_METADATA', 'Verified artifact lacks _headers or the root 404 document.');
  }
  const rules = parseSiteHeaders(readFileSync(resolve(site.input, '_headers'), 'utf8'));
  assertHeaderPolicy(rules);

  return {
    site,
    resolve(request, method = 'GET') {
      if (method !== 'GET' && method !== 'HEAD') {
        fail('WG_SITE_RESPONSE_METHOD', 'The response oracle admits only GET and HEAD.');
      }
      const url =
        typeof request === 'string'
          ? new URL(request, 'https://wayglass.hoagsoftworks.com')
          : request;
      const pathname = safePathname(url);
      const route = pathname === undefined ? {} : canonicalRoute(pathname, files);
      if (route.redirect !== undefined) return redirect(`${route.redirect}${url.search}`);
      const assetPath = route.path ?? '404.html';
      const status = route.path === undefined ? 404 : 200;
      const body =
        method === 'HEAD' ? new Uint8Array() : readFileSync(resolve(site.input, assetPath));
      const immutable =
        assetPath.startsWith('assets/') || assetPath.startsWith('storybook/assets/');
      const base = new Map([
        ['Content-Type', mimeType(assetPath)],
        ['Cache-Control', immutable ? IMMUTABLE_CACHE : DEFAULT_CACHE],
      ]);
      return {
        status,
        kind: status === 404 ? 'not-found' : 'asset',
        assetPath,
        headers: mergeHeaders(base, appliedSiteHeaders(rules, url)),
        body,
      };
    },
  };
}

export function checkSiteResponses(input: string): SiteResponseOracle {
  const oracle = createSiteResponseOracle(input);
  const required = [
    ['/', 200, 'index.html', undefined],
    ['/phase-6', 200, 'phase-6.html', undefined],
    ['/phase-6.html?proof=1', 307, undefined, '/phase-6?proof=1'],
    ['/phase-6/?proof=1', 307, undefined, '/phase-6?proof=1'],
    ['/foundations', 307, undefined, '/foundations/'],
    ['/foundations/', 200, 'foundations/index.html', undefined],
    ['/foundations/index.html', 307, undefined, '/foundations/'],
    ['/storybook', 307, undefined, '/storybook/'],
    ['/storybook/', 200, 'storybook/index.html', undefined],
    ['/storybook/iframe?viewMode=story', 200, 'storybook/iframe.html', undefined],
    ['/storybook/iframe.html?viewMode=story', 307, undefined, '/storybook/iframe?viewMode=story'],
    ['/missing-wayglass-proof', 404, '404.html', undefined],
    ['/storybook/missing-wayglass-proof.js', 404, '404.html', undefined],
    ['/unknown-prefix/missing', 404, '404.html', undefined],
  ] as const;
  for (const method of ['GET', 'HEAD'] as const) {
    for (const [path, status, assetPath, location] of required) {
      const response = oracle.resolve(path, method);
      if (response.status !== status || response.assetPath !== assetPath) {
        fail(
          'WG_SITE_RESPONSE_MATRIX',
          `${method} ${path} did not match the frozen route contract.`,
        );
      }
      if (method === 'HEAD' && response.body.byteLength !== 0) {
        fail('WG_SITE_RESPONSE_MATRIX', `HEAD ${path} unexpectedly returned a body.`);
      }
      if (location !== undefined && header(response, 'Location') !== location) {
        fail(
          'WG_SITE_RESPONSE_MATRIX',
          `${method} ${path} did not preserve its canonical location.`,
        );
      }
      if (status === 307 && response.headers.size !== 1) {
        fail(
          'WG_SITE_RESPONSE_MATRIX',
          `${method} ${path} received terminal headers on a redirect.`,
        );
      }
    }
  }

  const security = oracle.resolve('/phase-6');
  for (const [name, expected] of [
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['X-Frame-Options', 'SAMEORIGIN'],
  ] as const) {
    assertResponseHeader(security, name, expected);
  }
  const csp = header(security, 'Content-Security-Policy') ?? '';
  if (
    !csp.includes("default-src 'self'") ||
    !csp.includes("frame-ancestors 'self'") ||
    csp.includes("'unsafe-eval'") ||
    csp.includes('https:') ||
    csp.includes('http:')
  ) {
    fail('WG_SITE_RESPONSE_MATRIX', 'The Content-Security-Policy exceeds the frozen contract.');
  }
  assertResponseHeader(security, 'Cache-Control', DEFAULT_CACHE);
  if (header(security, 'X-Robots-Tag') !== undefined) {
    fail('WG_SITE_RESPONSE_MATRIX', 'Production documentation must remain indexable.');
  }
  assertResponseHeader(oracle.resolve('/storybook/'), 'X-Robots-Tag', 'noindex');
  assertResponseHeader(
    oracle.resolve('https://proof.wayglass.workers.dev/phase-6'),
    'X-Robots-Tag',
    'noindex, nofollow',
  );

  const extensionTypes = new Map([
    ['.js', 'text/javascript; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
    ['.json', 'application/json'],
    ['.svg', 'image/svg+xml'],
    ['.jpg', 'image/jpeg'],
    ['.woff2', 'font/woff2'],
  ]);
  for (const [extension, type] of extensionTypes) {
    const file = oracle.site.manifest.files.find((candidate) => candidate.path.endsWith(extension));
    if (file === undefined)
      fail('WG_SITE_RESPONSE_MATRIX', `No ${extension} proof asset was composed.`);
    assertResponseHeader(oracle.resolve(`/${file.path}`), 'Content-Type', type);
  }
  const immutable = oracle.site.manifest.files.find(
    (file) => file.path.startsWith('assets/') || file.path.startsWith('storybook/assets/'),
  );
  if (immutable === undefined)
    fail('WG_SITE_RESPONSE_MATRIX', 'No immutable proof asset was composed.');
  assertResponseHeader(oracle.resolve(`/${immutable.path}`), 'Cache-Control', IMMUTABLE_CACHE);
  assertResponseHeader(oracle.resolve(`/${SITE_MANIFEST_PATH}`), 'Cache-Control', DEFAULT_CACHE);

  const canonical = decodeBody(oracle.resolve('/phase-6'));
  if (!canonical.includes('https://wayglass.hoagsoftworks.com/phase-6')) {
    fail(
      'WG_SITE_RESPONSE_MATRIX',
      'The clean documentation route lacks its production canonical URL.',
    );
  }
  const notFound = decodeBody(oracle.resolve('/missing-wayglass-proof'));
  if (notFound === decodeBody(oracle.resolve('/'))) {
    fail('WG_SITE_RESPONSE_MATRIX', 'The 404 response falsely returned the documentation shell.');
  }
  return oracle;
}
