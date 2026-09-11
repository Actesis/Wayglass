import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { createTestHarness } from 'wrangler';

import {
  checkSiteResponses,
  type SiteReadMethod,
  type SiteResponse,
} from '../../site-composer/src/response.ts';
import {
  COMPATIBILITY_DATE,
  configWithVerifiedAssets,
  readCloudflareDeliveryConfig,
} from './config.ts';
import { fail } from './error.ts';

export const WRANGLER_LOCAL_DIFFERENCES = [
  'redirects-include-custom-headers',
  'method-405-omits-allow',
] as const;

interface ComparableResponse {
  readonly status: number;
  readonly headers: {
    get(name: string): string | null;
    has(name: string): boolean;
  };
  arrayBuffer(): Promise<ArrayBuffer>;
}

const ROUTES = [
  '/',
  '/phase-6',
  '/phase-6.html?proof=wrangler',
  '/phase-6/?proof=wrangler',
  '/foundations',
  '/foundations/',
  '/foundations/index.html',
  '/storybook',
  '/storybook/',
  '/storybook/iframe?viewMode=story',
  '/storybook/iframe.html?viewMode=story',
  '/missing-wayglass-wrangler-proof',
  '/storybook/missing-wayglass-wrangler-proof.js',
  '/unknown-prefix/missing',
  '/wayglass-site-manifest.json',
] as const;

function header(response: SiteResponse, name: string): string | undefined {
  return [...response.headers].find(
    ([candidate]) => candidate.toLowerCase() === name.toLowerCase(),
  )?.[1];
}

function equalBytes(actual: Uint8Array, expected: Uint8Array): boolean {
  return (
    actual.byteLength === expected.byteLength &&
    actual.every((byte, index) => byte === expected[index])
  );
}

export async function assertWranglerResponseParity(
  actual: ComparableResponse,
  expected: SiteResponse,
  method: SiteReadMethod,
  path: string,
): Promise<void> {
  if (actual.status !== expected.status) {
    fail(
      'WG_CLOUDFLARE_PARITY',
      `${method} ${path} returned ${actual.status}; expected ${expected.status}.`,
    );
  }
  const actualBody = new Uint8Array(await actual.arrayBuffer());
  if (!equalBytes(actualBody, expected.body)) {
    fail('WG_CLOUDFLARE_PARITY', `${method} ${path} returned different response bytes.`);
  }
  const location = header(expected, 'Location');
  if (actual.headers.get('location') !== (location ?? null)) {
    fail('WG_CLOUDFLARE_PARITY', `${method} ${path} returned a different canonical location.`);
  }
  if (expected.kind === 'redirect') {
    if (!actual.headers.has('content-security-policy')) {
      fail(
        'WG_CLOUDFLARE_LOCAL_DIFFERENCE',
        `${method} ${path} no longer demonstrates the retained redirect-header difference.`,
      );
    }
    return;
  }
  for (const [name, value] of expected.headers) {
    if (actual.headers.get(name) !== value) {
      fail('WG_CLOUDFLARE_PARITY', `${method} ${path} returned a different ${name} header.`);
    }
  }
}

function runDryRun(repositoryRoot: string, input: string): void {
  const output = mkdtempSync(resolve(tmpdir(), 'wayglass-wrangler-dry-run-'));
  try {
    const result = spawnSync(
      process.execPath,
      [
        resolve(repositoryRoot, 'node_modules/wrangler/bin/wrangler.js'),
        'deploy',
        '--dry-run',
        '--config',
        resolve(repositoryRoot, 'wrangler.jsonc'),
        '--assets',
        input,
        '--outdir',
        output,
      ],
      {
        cwd: repositoryRoot,
        encoding: 'utf8',
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: undefined,
          CLOUDFLARE_API_KEY: undefined,
          CLOUDFLARE_API_TOKEN: undefined,
          CLOUDFLARE_EMAIL: undefined,
          WRANGLER_LOG_PATH: resolve(output, 'wrangler.log'),
          WRANGLER_SEND_METRICS: 'false',
        },
        timeout: 60_000,
      },
    );
    if (result.status !== 0 || !result.stdout.includes('--dry-run: exiting now.')) {
      fail('WG_CLOUDFLARE_DRY_RUN', 'Wrangler did not complete its credential-free dry run.');
    }
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
}

export interface WranglerRehearsalResult {
  readonly bundleSha256: string;
  readonly compatibilityDate: typeof COMPATIBILITY_DATE;
  readonly comparedResponses: number;
  readonly differences: typeof WRANGLER_LOCAL_DIFFERENCES;
}

export async function runWranglerRehearsal(options: {
  readonly repositoryRoot: string;
  readonly input: string;
}): Promise<WranglerRehearsalResult> {
  const oracle = checkSiteResponses(options.input);
  const config = readCloudflareDeliveryConfig(options.repositoryRoot);
  runDryRun(options.repositoryRoot, oracle.site.input);
  const harness = createTestHarness({
    root: options.repositoryRoot,
    workers: [{ config: configWithVerifiedAssets(config, oracle.site.input) }],
  });
  let comparedResponses = 0;
  try {
    await harness.listen();
    for (const method of ['GET', 'HEAD'] as const) {
      for (const path of ROUTES) {
        const expected = oracle.resolve(path, method);
        const actual = await harness.fetch(path, { method, redirect: 'manual' });
        await assertWranglerResponseParity(actual, expected, method, path);
        comparedResponses += 1;
      }
    }
    const rejected = await harness.fetch('/', { method: 'POST', redirect: 'manual' });
    if (
      rejected.status !== 405 ||
      rejected.headers.has('allow') ||
      (await rejected.arrayBuffer()).byteLength !== 0
    ) {
      fail(
        'WG_CLOUDFLARE_LOCAL_DIFFERENCE',
        'Wrangler rejected-method behavior changed from the retained local result.',
      );
    }
  } finally {
    await harness.close();
  }
  return {
    bundleSha256: oracle.site.manifest.bundleSha256,
    compatibilityDate: COMPATIBILITY_DATE,
    comparedResponses,
    differences: WRANGLER_LOCAL_DIFFERENCES,
  };
}
