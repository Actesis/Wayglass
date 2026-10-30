import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import type { SiteResponseOracle } from '../../site-composer/src/response.ts';
import type { SiteManifest } from '../../site-composer/src/types.ts';
import { parseBrowserArguments } from '../src/browser-cli.ts';
import { type BrowserProofResult, verifyImmutableBrowser } from '../src/browser.ts';

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
    surfaces: [],
    files: [],
    bundleSha256: '8'.repeat(64),
  };
}

function oracle(): SiteResponseOracle {
  return {
    site: {
      input: '/not-retained/private/artifact',
      manifest: manifest(),
      manifestSha256: '9'.repeat(64),
    },
    resolve: () => {
      throw new Error('Browser verifier should not bypass the edge response verifier.');
    },
  };
}

function proof(): BrowserProofResult {
  return {
    browser: { name: 'chromium', version: '142.0.0.0' },
    documentation: {
      hydrated: true,
      canonical: true,
      cspBlockedExternalImage: true,
      accessibilityViolations: 0,
    },
    storybook: {
      managerHydrated: true,
      directStoryHydrated: true,
      storyId: 'foundations-typography--default',
      accessibilityViolations: 0,
    },
    notFound: {
      routes: 2,
      narrowViewport: true,
      reducedMotion: true,
      forcedColors: true,
      visibleRecoveryLinks: true,
      visibleKeyboardFocus: true,
      horizontalOverflow: false,
      accessibilityViolations: 0,
    },
    isolation: { runtimeRequests: 42, externalRuntimeRequests: 0, cookies: 0 },
  };
}

function output(): string {
  const directory = mkdtempSync(resolve(tmpdir(), 'wayglass-browser-test-'));
  temporary.push(directory);
  return resolve(directory, 'browser-evidence.json');
}

afterEach(() => {
  for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('immutable browser verification', () => {
  it('binds verified artifact identity to allowlisted browser evidence', async () => {
    const destination = output();
    const evidence = await verifyImmutableBrowser(
      {
        input: '/not-retained/private/artifact',
        url: VERSION_URL,
        versionId: VERSION_ID,
        output: destination,
      },
      {
        checkResponses: oracle,
        runProof: async (origin) => {
          expect(origin.href).toBe(VERSION_URL);
          return proof();
        },
        now: () => new Date('2026-10-30T15:00:00.000Z'),
      },
    );

    expect(evidence).toMatchObject({
      schemaVersion: 1,
      capturedAt: '2026-10-30T15:00:00.000Z',
      target: { worker: 'wayglass-docs', versionId: VERSION_ID, versionUrl: VERSION_URL },
      artifact: { bundleSha256: '8'.repeat(64), manifestSha256: '9'.repeat(64) },
      proof: proof(),
    });
    const serialized = readFileSync(destination, 'utf8');
    expect(JSON.parse(serialized)).toEqual(evidence);
    expect(serialized).not.toContain('/not-retained/private/artifact');
    expect(serialized).not.toContain(destination);
    expect(serialized).not.toContain('authorization');
  });

  it('publishes no evidence when browser proof fails', async () => {
    const destination = output();
    await expect(
      verifyImmutableBrowser(
        {
          input: '/not-retained/private/artifact',
          url: VERSION_URL,
          versionId: VERSION_ID,
          output: destination,
        },
        {
          checkResponses: oracle,
          runProof: async () => {
            throw new Error('synthetic browser failure');
          },
        },
      ),
    ).rejects.toThrow('synthetic browser failure');
    expect(() => readFileSync(destination)).toThrow();
  });

  it('inherits immutable URL and strict invocation gates', async () => {
    await expect(
      verifyImmutableBrowser(
        {
          input: '/unused',
          url: 'https://phase-6d-f-wayglass-docs.owner.workers.dev/',
          versionId: VERSION_ID,
          output: output(),
        },
        { checkResponses: oracle, runProof: async () => proof() },
      ),
    ).rejects.toThrow('WG_CLOUDFLARE_EDGE_URL');
    expect(() => parseBrowserArguments(['--input', '/artifact'])).toThrow(
      'WG_CLOUDFLARE_BROWSER_INVOCATION',
    );
    expect(
      parseBrowserArguments([
        '--input',
        '/artifact',
        '--url',
        VERSION_URL,
        '--version-id',
        VERSION_ID,
        '--output',
        '/tmp/browser-evidence.json',
      ]),
    ).toEqual({
      input: '/artifact',
      url: VERSION_URL,
      versionId: VERSION_ID,
      output: '/tmp/browser-evidence.json',
    });
  });
});
