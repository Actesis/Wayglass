import {
  checkSiteResponses,
  type SiteReadMethod,
  type SiteResponse,
  type SiteResponseOracle,
} from '../../site-composer/src/response.ts';
import type { SiteManifest } from '../../site-composer/src/types.ts';
import { WORKER_NAME } from './config.ts';
import { resolveEvidenceOutputPath, writeSanitizedEvidence } from './evidence.ts';
import { fail } from './error.ts';
import { CONTRACT_HEADER_NAMES, EDGE_RESPONSE_ROUTES } from './matrix.ts';

const VERSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ALLOW = /^(?:GET|HEAD|OPTIONS)(?:, (?:GET|HEAD|OPTIONS))*$/;

type EdgeFetch = (
  input: string | URL,
  init: { readonly method: string; readonly redirect: 'manual'; readonly headers: Headers },
) => Promise<Response>;

export interface EdgeVerificationOptions {
  readonly input: string;
  readonly url: string;
  readonly versionId: string;
  readonly output: string;
}

export interface EdgeEvidence {
  readonly schemaVersion: 1;
  readonly capturedAt: string;
  readonly target: {
    readonly worker: typeof WORKER_NAME;
    readonly versionId: string;
    readonly versionUrl: string;
  };
  readonly artifact: {
    readonly bundleSha256: string;
    readonly manifestSha256: string;
    readonly source: SiteManifest['source'];
    readonly tooling: SiteManifest['tooling'];
    readonly environment: SiteManifest['environment'];
    readonly surfaces: readonly {
      readonly id: string;
      readonly fileCount: number;
      readonly bytes: number;
      readonly contentSha256: string;
    }[];
  };
  readonly responses: {
    readonly compared: number;
    readonly routes: number;
    readonly methods: readonly SiteReadMethod[];
    readonly redirectContractHeadersObserved: readonly string[];
  };
  readonly rejectedPost: {
    readonly status: 405;
    readonly allow: string | null;
  };
}

interface EdgeVerifierDependencies {
  readonly fetch?: EdgeFetch;
  readonly now?: () => Date;
  readonly checkResponses?: (input: string) => SiteResponseOracle;
}

export function parseImmutableVersionUrl(source: string, versionId: string): URL {
  if (!VERSION_ID.test(versionId)) {
    fail('WG_CLOUDFLARE_EDGE_VERSION', 'The version ID must be a lowercase Cloudflare UUID.');
  }
  let url: URL;
  try {
    url = new URL(source);
  } catch {
    fail('WG_CLOUDFLARE_EDGE_URL', 'The candidate Version URL is invalid.');
  }
  const expectedFirstLabel = `${versionId.slice(0, 8)}-${WORKER_NAME}`;
  const labels = url.hostname.split('.');
  if (
    url.protocol !== 'https:' ||
    url.username !== '' ||
    url.password !== '' ||
    url.port !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== '' ||
    labels.length < 4 ||
    labels[0] !== expectedFirstLabel ||
    labels.at(-2) !== 'workers' ||
    labels.at(-1) !== 'dev'
  ) {
    fail(
      'WG_CLOUDFLARE_EDGE_URL',
      `The candidate must be the immutable ${WORKER_NAME} Version URL for the exact version ID.`,
    );
  }
  return url;
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return left.byteLength === right.byteLength && left.every((byte, index) => byte === right[index]);
}

function expectedHeader(response: SiteResponse, name: string): string | null {
  return (
    [...response.headers].find(
      ([candidate]) => candidate.toLowerCase() === name.toLowerCase(),
    )?.[1] ?? null
  );
}

function robotsTokens(value: string | null): ReadonlySet<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function compareResponse(
  actual: Response,
  expected: SiteResponse,
  method: SiteReadMethod,
  path: string,
): Promise<readonly string[]> {
  if (actual.status !== expected.status) {
    fail(
      'WG_CLOUDFLARE_EDGE_PARITY',
      `${method} ${path} returned ${actual.status}; expected ${expected.status}.`,
    );
  }
  const actualBody = new Uint8Array(await actual.arrayBuffer());
  if (!equalBytes(actualBody, expected.body)) {
    fail('WG_CLOUDFLARE_EDGE_PARITY', `${method} ${path} returned different response bytes.`);
  }
  const expectedLocation = expectedHeader(expected, 'location');
  if (actual.headers.get('location') !== expectedLocation) {
    fail('WG_CLOUDFLARE_EDGE_PARITY', `${method} ${path} returned a different location.`);
  }
  if (expected.kind === 'redirect') {
    return CONTRACT_HEADER_NAMES.filter((name) => actual.headers.has(name));
  }
  for (const name of CONTRACT_HEADER_NAMES) {
    const expectedValue = expectedHeader(expected, name);
    if (actual.headers.get(name) !== expectedValue) {
      fail('WG_CLOUDFLARE_EDGE_PARITY', `${method} ${path} returned a different ${name}.`);
    }
  }
  const robots = robotsTokens(actual.headers.get('x-robots-tag'));
  if (!robots.has('noindex') || !robots.has('nofollow')) {
    fail(
      'WG_CLOUDFLARE_EDGE_INDEXING',
      `${method} ${path} did not prohibit indexing and link following on the Version URL.`,
    );
  }
  return [];
}

async function request(fetcher: EdgeFetch, url: URL, method: string): Promise<Response> {
  try {
    return await fetcher(url, {
      method,
      redirect: 'manual',
      headers: new Headers({
        Accept: '*/*',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Wayglass-Phase-6D-F-Read-Only-Verifier/1',
      }),
    });
  } catch {
    fail('WG_CLOUDFLARE_EDGE_REQUEST', `${method} edge verification request failed.`);
  }
}

export async function verifyImmutableEdge(
  options: EdgeVerificationOptions,
  dependencies: EdgeVerifierDependencies = {},
): Promise<EdgeEvidence> {
  const origin = parseImmutableVersionUrl(options.url, options.versionId);
  const destination = resolveEvidenceOutputPath(options.output);
  const oracle = (dependencies.checkResponses ?? checkSiteResponses)(options.input);
  const fetcher = dependencies.fetch ?? (globalThis.fetch as EdgeFetch);
  const observedRedirectHeaders = new Set<string>();
  let compared = 0;

  for (const method of ['GET', 'HEAD'] as const) {
    for (const path of EDGE_RESPONSE_ROUTES) {
      const target = new URL(path, origin);
      const actual = await request(fetcher, target, method);
      const expected = oracle.resolve(target, method);
      for (const name of await compareResponse(actual, expected, method, path)) {
        observedRedirectHeaders.add(name);
      }
      compared += 1;
    }
  }

  const rejected = await request(fetcher, origin, 'POST');
  const rejectedBody = new Uint8Array(await rejected.arrayBuffer());
  const allow = rejected.headers.get('allow');
  if (
    rejected.status !== 405 ||
    rejectedBody.byteLength !== 0 ||
    (allow !== null && !ALLOW.test(allow))
  ) {
    fail('WG_CLOUDFLARE_EDGE_METHOD', 'POST / did not match the admitted empty 405 edge behavior.');
  }

  const evidence: EdgeEvidence = {
    schemaVersion: 1,
    capturedAt: (dependencies.now ?? (() => new Date()))().toISOString(),
    target: {
      worker: WORKER_NAME,
      versionId: options.versionId,
      versionUrl: origin.href,
    },
    artifact: {
      bundleSha256: oracle.site.manifest.bundleSha256,
      manifestSha256: oracle.site.manifestSha256,
      source: oracle.site.manifest.source,
      tooling: oracle.site.manifest.tooling,
      environment: oracle.site.manifest.environment,
      surfaces: oracle.site.manifest.surfaces.map((surface) => ({
        id: surface.id,
        fileCount: surface.fileCount,
        bytes: surface.bytes,
        contentSha256: surface.contentSha256,
      })),
    },
    responses: {
      compared,
      routes: EDGE_RESPONSE_ROUTES.length,
      methods: ['GET', 'HEAD'],
      redirectContractHeadersObserved: [...observedRedirectHeaders].sort(),
    },
    rejectedPost: { status: 405, allow },
  };
  writeSanitizedEvidence(destination, evidence);
  return evidence;
}
