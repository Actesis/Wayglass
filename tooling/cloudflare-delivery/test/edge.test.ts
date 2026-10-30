import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  SiteReadMethod,
  SiteResponse,
  SiteResponseOracle,
} from '../../site-composer/src/response.ts';
import type { SiteManifest, VerifiedSiteResult } from '../../site-composer/src/types.ts';
import { parseEdgeArguments } from '../src/edge-cli.ts';
import { verifyImmutableEdge } from '../src/edge.ts';

const VERSION_ID = '01234567-89ab-4def-8abc-0123456789ab';
const VERSION_URL = 'https://01234567-wayglass-docs.owner.workers.dev/';
const temporary: string[] = [];

function manifest(): SiteManifest {
  return {
    artifact: 'wayglass-site-bundle',
    schemaVersion: 1,
    source: {
      commit: '1'.repeat(40),
      tree: '2'.repeat(40),
      lockfileSha256: '3'.repeat(64),
    },
    tooling: { commit: '4'.repeat(40), tree: '5'.repeat(40) },
    environment: {
      node: '24.18.0',
      pnpm: '11.9.0',
      platform: 'linux',
      architecture: 'x64',
    },
    surfaces: [
      {
        id: 'documentation',
        classification: 'normative',
        package: '@wayglass/docs',
        version: '0.0.0',
        sourcePath: 'apps/docs/.vitepress/dist',
        publicPath: '/',
        requiredEntries: ['index.html'],
        fileCount: 2,
        bytes: 20,
        contentSha256: '6'.repeat(64),
      },
      {
        id: 'storybook',
        classification: 'inspection',
        package: '@wayglass/storybook',
        version: '0.0.0',
        sourcePath: 'apps/storybook/storybook-static',
        publicPath: '/storybook/',
        requiredEntries: ['index.html', 'iframe.html'],
        fileCount: 2,
        bytes: 30,
        contentSha256: '7'.repeat(64),
      },
    ],
    files: [],
    bundleSha256: '8'.repeat(64),
  };
}

function oracle(): SiteResponseOracle {
  const site: VerifiedSiteResult = {
    input: '/not-retained/private/artifact',
    manifest: manifest(),
    manifestSha256: '9'.repeat(64),
  };
  return {
    site,
    resolve(request, method: SiteReadMethod = 'GET'): SiteResponse {
      const url = typeof request === 'string' ? new URL(request, VERSION_URL) : request;
      const redirect =
        url.pathname.endsWith('.html') ||
        (url.pathname.endsWith('/') && ['/phase-6/', '/foundations/'].includes(url.pathname)) ||
        ['/foundations', '/storybook'].includes(url.pathname);
      const missing =
        url.pathname.includes('missing') || url.pathname.startsWith('/unknown-prefix');
      if (redirect) {
        return {
          status: 307,
          kind: 'redirect',
          headers: new Map([['Location', `/canonical${url.search}`]]),
          body: new Uint8Array(),
        };
      }
      const headers = new Map([
        [
          'Content-Type',
          url.pathname.endsWith('.json') ? 'application/json' : 'text/html; charset=utf-8',
        ],
        ['Cache-Control', 'public, max-age=0, must-revalidate'],
        ['Content-Security-Policy', "default-src 'self'"],
        ['Permissions-Policy', 'camera=()'],
        ['Referrer-Policy', 'strict-origin-when-cross-origin'],
        ['X-Content-Type-Options', 'nosniff'],
        ['X-Frame-Options', 'SAMEORIGIN'],
        ['X-Robots-Tag', 'noindex, nofollow'],
      ]);
      return {
        status: missing ? 404 : 200,
        kind: missing ? 'not-found' : 'asset',
        headers,
        body:
          method === 'HEAD'
            ? new Uint8Array()
            : new TextEncoder().encode(`${url.pathname}${url.search}`),
      };
    },
  };
}

function mirroredFetch(source: SiteResponseOracle = oracle()) {
  return vi.fn(async (input: string | URL, init: { method: string; headers: Headers }) => {
    const url = new URL(input);
    expect(init.headers.get('authorization')).toBeNull();
    expect(init.headers.get('cookie')).toBeNull();
    if (init.method === 'POST') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const expected = source.resolve(url, init.method as SiteReadMethod);
    const headers = new Headers([...expected.headers]);
    if (expected.kind === 'redirect') headers.set('Content-Security-Policy', "default-src 'self'");
    return new Response(Uint8Array.from(expected.body).buffer, {
      status: expected.status,
      headers,
    });
  });
}

function output(): string {
  const directory = mkdtempSync(resolve(tmpdir(), 'wayglass-edge-test-'));
  temporary.push(directory);
  return resolve(directory, 'evidence.json');
}

afterEach(() => {
  for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('immutable edge verification', () => {
  it('compares the complete matrix and writes only allowlisted sanitized evidence', async () => {
    const destination = output();
    const fetcher = mirroredFetch();
    const evidence = await verifyImmutableEdge(
      {
        input: '/not-retained/private/artifact',
        url: VERSION_URL,
        versionId: VERSION_ID,
        output: destination,
      },
      {
        fetch: fetcher,
        checkResponses: oracle,
        now: () => new Date('2026-10-30T12:00:00.000Z'),
      },
    );

    expect(fetcher).toHaveBeenCalledTimes(31);
    expect(evidence).toMatchObject({
      schemaVersion: 1,
      capturedAt: '2026-10-30T12:00:00.000Z',
      target: { worker: 'wayglass-docs', versionId: VERSION_ID, versionUrl: VERSION_URL },
      responses: {
        compared: 30,
        routes: 15,
        methods: ['GET', 'HEAD'],
        redirectContractHeadersObserved: ['content-security-policy'],
      },
      rejectedPost: { status: 405, allow: 'GET, HEAD' },
    });
    const serialized = readFileSync(destination, 'utf8');
    expect(JSON.parse(serialized)).toEqual(evidence);
    expect(serialized).not.toContain('/not-retained/private/artifact');
    expect(serialized).not.toContain(destination);
    expect(serialized).not.toContain('authorization');
    if (process.platform !== 'win32') expect(statSync(destination).mode & 0o777).toBe(0o600);
  });

  it('binds the immutable hostname to the exact version ID', async () => {
    for (const url of [
      'http://01234567-wayglass-docs.owner.workers.dev/',
      'https://phase-6d-f-wayglass-docs.owner.workers.dev/',
      'https://wayglass-docs.owner.workers.dev/',
      'https://01234567-wayglass-docs.owner.workers.dev/path',
      'https://01234567-other-worker.owner.workers.dev/',
    ]) {
      await expect(
        verifyImmutableEdge(
          { input: '/unused', url, versionId: VERSION_ID, output: output() },
          { checkResponses: oracle, fetch: mirroredFetch() },
        ),
      ).rejects.toThrow('WG_CLOUDFLARE_EDGE_URL');
    }
  });

  it('fails closed without publishing partial evidence', async () => {
    const destination = output();
    const source = oracle();
    const fetcher = mirroredFetch(source);
    fetcher.mockImplementationOnce(async () => new Response('changed', { status: 503 }));
    await expect(
      verifyImmutableEdge(
        {
          input: '/not-retained/private/artifact',
          url: VERSION_URL,
          versionId: VERSION_ID,
          output: destination,
        },
        { fetch: fetcher, checkResponses: () => source },
      ),
    ).rejects.toThrow('WG_CLOUDFLARE_EDGE_PARITY');
    expect(() => readFileSync(destination)).toThrow();
  });

  it('requires noindex and nofollow on every terminal response', async () => {
    const destination = output();
    const source = oracle();
    const fetcher = mirroredFetch(source);
    fetcher.mockImplementationOnce(async (input, init) => {
      const expected = source.resolve(new URL(input), init.method as SiteReadMethod);
      const headers = new Headers([...expected.headers]);
      headers.set('X-Robots-Tag', 'noindex');
      return new Response(Uint8Array.from(expected.body).buffer, {
        status: expected.status,
        headers,
      });
    });
    await expect(
      verifyImmutableEdge(
        {
          input: '/not-retained/private/artifact',
          url: VERSION_URL,
          versionId: VERSION_ID,
          output: destination,
        },
        { fetch: fetcher, checkResponses: () => source },
      ),
    ).rejects.toThrow('WG_CLOUDFLARE_EDGE_PARITY');
    expect(() => readFileSync(destination)).toThrow();
  });

  it('rejects unsafe evidence destinations and malformed invocations', async () => {
    await expect(
      verifyImmutableEdge(
        {
          input: '/unused',
          url: VERSION_URL,
          versionId: VERSION_ID,
          output: resolve(process.cwd(), 'evidence.json'),
        },
        { checkResponses: oracle, fetch: mirroredFetch() },
      ),
    ).rejects.toThrow('WG_CLOUDFLARE_EVIDENCE_OUTPUT');
    expect(() => parseEdgeArguments(['--input', '/artifact'])).toThrow(
      'WG_CLOUDFLARE_EDGE_INVOCATION',
    );
    expect(
      parseEdgeArguments([
        '--input',
        '/artifact',
        '--url',
        VERSION_URL,
        '--version-id',
        VERSION_ID,
        '--output',
        '/tmp/evidence.json',
      ]),
    ).toEqual({
      input: '/artifact',
      url: VERSION_URL,
      versionId: VERSION_ID,
      output: '/tmp/evidence.json',
    });
  });
});
