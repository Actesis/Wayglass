import { AxeBuilder } from '@axe-core/playwright';
import { chromium, type BrowserContext, type Page } from '@playwright/test';

import { checkSiteResponses, type SiteResponseOracle } from '../../site-composer/src/response.ts';
import type { SiteManifest } from '../../site-composer/src/types.ts';
import { WORKER_NAME } from './config.ts';
import { parseImmutableVersionUrl, type EdgeVerificationOptions } from './edge.ts';
import { resolveEvidenceOutputPath, writeSanitizedEvidence } from './evidence.ts';
import { fail } from './error.ts';

export interface BrowserProofResult {
  readonly browser: { readonly name: 'chromium'; readonly version: string };
  readonly documentation: {
    readonly hydrated: true;
    readonly canonical: true;
    readonly cspBlockedExternalImage: true;
    readonly accessibilityViolations: 0;
  };
  readonly storybook: {
    readonly managerHydrated: true;
    readonly directStoryHydrated: true;
    readonly storyId: string;
    readonly accessibilityViolations: 0;
  };
  readonly notFound: {
    readonly routes: 2;
    readonly narrowViewport: true;
    readonly reducedMotion: true;
    readonly forcedColors: true;
    readonly visibleRecoveryLinks: true;
    readonly visibleKeyboardFocus: true;
    readonly horizontalOverflow: false;
    readonly accessibilityViolations: 0;
  };
  readonly isolation: {
    readonly runtimeRequests: number;
    readonly externalRuntimeRequests: 0;
    readonly cookies: 0;
  };
}

export interface BrowserEvidence {
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
  };
  readonly proof: BrowserProofResult;
}

interface BrowserVerifierDependencies {
  readonly checkResponses?: (input: string) => SiteResponseOracle;
  readonly now?: () => Date;
  readonly runProof?: (origin: URL) => Promise<BrowserProofResult>;
}

interface RequestMonitor {
  readonly runtimeRequests: () => number;
  assertSameOrigin(): void;
}

function assert(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) fail(code, message);
}

function tokens(value: string | undefined): ReadonlySet<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean),
  );
}

function monitorRequests(page: Page, origin: URL): RequestMonitor {
  let runtimeRequests = 0;
  const external = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol === 'data:' || url.protocol === 'blob:') return;
    runtimeRequests += 1;
    if (url.origin !== origin.origin) external.add(url.origin);
  });
  return {
    runtimeRequests: () => runtimeRequests,
    assertSameOrigin() {
      assert(
        external.size === 0,
        'WG_CLOUDFLARE_BROWSER_EXTERNAL',
        'A browser surface made an external runtime request.',
      );
    },
  };
}

async function assertAccessible(
  page: Page,
  surface: string,
  options: { readonly forcedColors?: boolean } = {},
): Promise<void> {
  const builder = new AxeBuilder({ page });
  const results = await (
    options.forcedColors ? builder.disableRules(['color-contrast']) : builder
  ).analyze();
  assert(
    results.violations.length === 0,
    'WG_CLOUDFLARE_BROWSER_ACCESSIBILITY',
    `${surface} produced ${results.violations.length} automated accessibility violations.`,
  );
}

async function proveDocumentation(
  context: BrowserContext,
  origin: URL,
): Promise<{ readonly requests: number }> {
  const page = await context.newPage();
  const monitor = monitorRequests(page, origin);
  try {
    const response = await page.goto(new URL('/phase-6', origin).href, {
      waitUntil: 'networkidle',
    });
    assert(response?.status() === 200, 'WG_CLOUDFLARE_BROWSER_DOCS', 'Documentation did not load.');
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' });
    assert(
      (await page.getByRole('heading', { level: 1 }).textContent())?.includes('Phase 6'),
      'WG_CLOUDFLARE_BROWSER_DOCS',
      'Documentation did not hydrate its Phase 6 heading.',
    );
    assert(
      (await page.locator('link[rel="canonical"]').getAttribute('href')) ===
        'https://wayglass.hoagsoftworks.com/phase-6',
      'WG_CLOUDFLARE_BROWSER_DOCS',
      'Documentation canonical identity changed.',
    );
    assert(
      response.headers()['content-security-policy']?.includes("default-src 'self'"),
      'WG_CLOUDFLARE_BROWSER_CSP',
      'Documentation did not deliver the accepted CSP.',
    );
    const robots = tokens(response.headers()['x-robots-tag']);
    assert(
      robots.has('noindex') && robots.has('nofollow'),
      'WG_CLOUDFLARE_BROWSER_INDEXING',
      'The Version URL documentation response is not fully non-indexable.',
    );
    await assertAccessible(page, 'Documentation');
    monitor.assertSameOrigin();

    const blocked = page.waitForEvent('requestfailed', {
      predicate: (request) => request.url().includes('external.invalid/wayglass-csp-proof.png'),
    });
    await page.evaluate(() => {
      (window as Window & { __wgCspViolations?: string[] }).__wgCspViolations = [];
      document.addEventListener('securitypolicyviolation', (event) => {
        (window as Window & { __wgCspViolations?: string[] }).__wgCspViolations?.push(
          `${event.violatedDirective}:${event.blockedURI}`,
        );
      });
      const image = document.createElement('img');
      image.src = 'https://external.invalid/wayglass-csp-proof.png';
      document.body.append(image);
    });
    const failed = await blocked;
    assert(
      failed.failure()?.errorText === 'csp',
      'WG_CLOUDFLARE_BROWSER_CSP',
      'Chromium did not reject the external CSP probe.',
    );
    await page.waitForFunction(
      () =>
        (window as Window & { __wgCspViolations?: string[] }).__wgCspViolations?.some((value) =>
          value.startsWith('img-src'),
        ) === true,
    );
    return { requests: monitor.runtimeRequests() - 1 };
  } finally {
    await page.close();
  }
}

async function proveStorybook(
  context: BrowserContext,
  origin: URL,
): Promise<{ readonly requests: number; readonly storyId: string }> {
  const page = await context.newPage();
  const monitor = monitorRequests(page, origin);
  try {
    const response = await page.goto(new URL('/storybook/', origin).href, {
      waitUntil: 'networkidle',
    });
    assert(
      response?.status() === 200,
      'WG_CLOUDFLARE_BROWSER_STORYBOOK',
      'Storybook did not load.',
    );
    const robots = tokens(response.headers()['x-robots-tag']);
    assert(
      robots.has('noindex') && robots.has('nofollow'),
      'WG_CLOUDFLARE_BROWSER_INDEXING',
      'The Version URL Storybook response is not fully non-indexable.',
    );
    await page.locator('#storybook-explorer-menu').waitFor({ state: 'visible' });
    const indexResponse = await context.request.get(new URL('/storybook/index.json', origin).href);
    assert(
      indexResponse.status() === 200,
      'WG_CLOUDFLARE_BROWSER_STORYBOOK',
      'Storybook index did not load.',
    );
    const index = (await indexResponse.json()) as {
      entries?: Record<string, { type?: string }>;
    };
    const storyId = Object.entries(index.entries ?? {}).find(
      ([, entry]) => entry.type === 'story',
    )?.[0];
    assert(
      storyId !== undefined && /^[a-z0-9-]+$/.test(storyId),
      'WG_CLOUDFLARE_BROWSER_STORYBOOK',
      'Storybook exposed no safe concrete story ID.',
    );
    const storyResponse = await page.goto(
      new URL(`/storybook/iframe?id=${encodeURIComponent(storyId)}&viewMode=story`, origin).href,
      { waitUntil: 'networkidle' },
    );
    assert(
      storyResponse?.status() === 200,
      'WG_CLOUDFLARE_BROWSER_STORYBOOK',
      'The direct Storybook story did not load.',
    );
    await page.locator('#storybook-root').waitFor({ state: 'visible' });
    assert(
      (await page.locator('#storybook-root').textContent())?.trim() !== '',
      'WG_CLOUDFLARE_BROWSER_STORYBOOK',
      'The direct Storybook story did not render content.',
    );
    assert(
      (await page.locator('iframe').count()) === 0,
      'WG_CLOUDFLARE_BROWSER_STORYBOOK',
      'The direct Storybook proof unexpectedly nested another preview frame.',
    );
    await assertAccessible(page, 'Direct Storybook story');
    monitor.assertSameOrigin();
    return { requests: monitor.runtimeRequests(), storyId };
  } finally {
    await page.close();
  }
}

async function proveNotFound(
  context: BrowserContext,
  origin: URL,
): Promise<{ readonly requests: number }> {
  const page = await context.newPage();
  const monitor = monitorRequests(page, origin);
  try {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    for (const path of ['/missing-browser-proof', '/storybook/missing-browser-proof']) {
      const response = await page.goto(new URL(path, origin).href, { waitUntil: 'networkidle' });
      assert(
        response?.status() === 404,
        'WG_CLOUDFLARE_BROWSER_NOT_FOUND',
        'A branded missing route did not return 404.',
      );
      await page.getByRole('heading', { name: 'Page not found' }).waitFor({ state: 'visible' });
      await page.getByRole('link', { name: 'Documentation home' }).waitFor({ state: 'visible' });
      await page.getByRole('link', { name: 'Storybook' }).waitFor({ state: 'visible' });
    }
    const presentation = await page.evaluate(() => ({
      forcedColors: matchMedia('(forced-colors: active)').matches,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    assert(
      presentation.forcedColors && presentation.reducedMotion && !presentation.overflow,
      'WG_CLOUDFLARE_BROWSER_NOT_FOUND',
      'The narrow missing page did not preserve its accepted media and overflow behavior.',
    );
    const recovery = page.getByRole('link', { name: 'Documentation home' });
    await recovery.focus();
    assert(
      (await recovery.evaluate((element) => getComputedStyle(element).outlineStyle)) !== 'none',
      'WG_CLOUDFLARE_BROWSER_NOT_FOUND',
      'The missing page recovery link had no visible keyboard focus.',
    );
    await assertAccessible(page, 'Branded missing page', { forcedColors: true });
    monitor.assertSameOrigin();
    return { requests: monitor.runtimeRequests() };
  } finally {
    await page.close();
  }
}

export async function runChromiumBrowserProof(origin: URL): Promise<BrowserProofResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: false,
    baseURL: origin.href,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  try {
    const documentation = await proveDocumentation(context, origin);
    const storybook = await proveStorybook(context, origin);
    const notFound = await proveNotFound(context, origin);
    const cookies = await context.cookies();
    assert(
      cookies.length === 0,
      'WG_CLOUDFLARE_BROWSER_COOKIE',
      'The Version URL created browser cookies.',
    );
    const version = browser.version();
    assert(
      /^\d+(?:\.\d+){1,3}$/.test(version),
      'WG_CLOUDFLARE_BROWSER_VERSION',
      'Chromium returned an unexpected version identity.',
    );
    return {
      browser: { name: 'chromium', version },
      documentation: {
        hydrated: true,
        canonical: true,
        cspBlockedExternalImage: true,
        accessibilityViolations: 0,
      },
      storybook: {
        managerHydrated: true,
        directStoryHydrated: true,
        storyId: storybook.storyId,
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
      isolation: {
        runtimeRequests: documentation.requests + storybook.requests + notFound.requests,
        externalRuntimeRequests: 0,
        cookies: 0,
      },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

export async function verifyImmutableBrowser(
  options: EdgeVerificationOptions,
  dependencies: BrowserVerifierDependencies = {},
): Promise<BrowserEvidence> {
  const origin = parseImmutableVersionUrl(options.url, options.versionId);
  const destination = resolveEvidenceOutputPath(options.output);
  const oracle = (dependencies.checkResponses ?? checkSiteResponses)(options.input);
  const proof = await (dependencies.runProof ?? runChromiumBrowserProof)(origin);
  const evidence: BrowserEvidence = {
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
    },
    proof,
  };
  writeSanitizedEvidence(destination, evidence);
  return evidence;
}
