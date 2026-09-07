import { AxeBuilder } from '@axe-core/playwright';
import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type BrowserType,
  type Page,
} from '@playwright/test';
import { createServer, type ServerResponse } from 'node:http';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

import { fail } from './error.ts';
import { probeReactConsumers } from './react-probe.ts';
import type {
  CommandRunner,
  ConsumerBrowserEngine,
  ConsumerBrowserProbeResult,
  ConsumerBuildStage,
  ConsumerProjectContext,
  ConsumerRuntimeProbe,
  ReactBuildProbeResult,
  VanillaBuildProbeResult,
} from './types.ts';
import { probeVanillaConsumers } from './vanilla-probe.ts';

export const consumerBrowserEngines = Object.freeze([
  'chromium',
  'firefox',
  'webkit',
] as const satisfies readonly ConsumerBrowserEngine[]);

export interface ConsumerBrowserExecution {
  readonly engine: ConsumerBrowserEngine;
  readonly url: string;
  readonly context: ConsumerProjectContext;
  readonly stage: ConsumerBuildStage;
}

export type ConsumerBrowserExecutor = (execution: ConsumerBrowserExecution) => Promise<void>;

export type ConsumerBrowserServer = <T>(
  root: string,
  operation: (url: string) => Promise<T>,
) => Promise<T>;

export interface BrowserConsumerProbeRequest {
  readonly evidencePath: string;
  readonly storePath: string;
  readonly runner: CommandRunner;
  readonly environment: NodeJS.ProcessEnv;
  readonly execute?: ConsumerBrowserExecutor;
}

const contentTypes: Readonly<Record<string, string>> = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
});

export interface BuiltConsumerAsset {
  readonly bytes: Buffer;
  readonly contentType: string;
}

export function readBuiltConsumerAsset(
  root: string,
  requestUrl: string,
): BuiltConsumerAsset | undefined {
  const dist = resolve(root, 'dist');
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://127.0.0.1').pathname);
  } catch {
    return undefined;
  }
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const path = resolve(dist, relative);
  if (!path.startsWith(`${dist}${sep}`)) return undefined;
  try {
    const status = lstatSync(path);
    if (!status.isFile() || status.isSymbolicLink()) return undefined;
    const realDist = realpathSync(dist);
    const realPath = realpathSync(path);
    if (!realPath.startsWith(`${realDist}${sep}`)) return undefined;
    return {
      bytes: readFileSync(realPath),
      contentType: contentTypes[extname(path)] ?? 'application/octet-stream',
    };
  } catch {
    return undefined;
  }
}

function send(response: ServerResponse, status: number, body = ''): void {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
    'content-type': 'text/plain; charset=utf-8',
  });
  response.end(body);
}

export async function withBuiltConsumerServer<T>(
  root: string,
  operation: (url: string) => Promise<T>,
): Promise<T> {
  const server = createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      send(response, 405, 'Method not allowed.');
      return;
    }
    const asset = readBuiltConsumerAsset(root, request.url ?? '/');
    if (asset === undefined) {
      send(response, 404, 'Not found.');
      return;
    }
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-length': asset.bytes.byteLength,
      'content-type': asset.contentType,
    });
    response.end(request.method === 'HEAD' ? undefined : asset.bytes);
  });

  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolveListen());
  });
  const address = server.address();
  if (address === null || typeof address === 'string') {
    server.close();
    fail('WG_RC_BROWSER_SERVER', 'Loopback browser server did not expose a TCP address.');
  }
  try {
    return await operation(`http://127.0.0.1:${address.port}/`);
  } finally {
    await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
  }
}

function assertBrowser(value: unknown, code: string, message: string): asserts value {
  if (!value) fail(code, message);
}

async function assertVanilla(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.dataset.wgVanillaProbe === 'WG_VANILLA_PROBE_READY',
  );
  const state = await page.evaluate(() => ({
    activity: document.documentElement.dataset.wgActivity,
    boolean: document.documentElement.dataset.wgBoolean,
    condition: document.documentElement.dataset.wgCondition,
    knowledge: document.documentElement.dataset.wgKnowledge,
    booleanRegistered: customElements.get('wg-boolean-value') !== undefined,
    toggleRegistered: customElements.get('wg-toggle') !== undefined,
    unusedRegistered: customElements.get('wg-media-viewer') !== undefined,
  }));
  assertBrowser(
    state.condition === 'critical' &&
      state.knowledge === 'stale' &&
      state.activity === 'pending' &&
      state.boolean === 'asserted',
    'WG_RC_BROWSER_VANILLA_AXES',
    'Vanilla browser fixture did not preserve independent known-state and Boolean axes.',
  );
  assertBrowser(
    state.booleanRegistered && state.toggleRegistered && !state.unusedRegistered,
    'WG_RC_BROWSER_VANILLA_REGISTRATION',
    'Vanilla browser fixture registration boundary is incorrect.',
  );
  const toggle = page.locator('wg-toggle');
  assertBrowser((await toggle.count()) === 1, 'WG_RC_BROWSER_VANILLA_SEMANTICS', 'Toggle missing.');
  const control = toggle.locator('[role="switch"]');
  assertBrowser(
    (await control.getAttribute('aria-label')) === 'Channel control' &&
      (await control.getAttribute('aria-checked')) === 'false',
    'WG_RC_BROWSER_VANILLA_SEMANTICS',
    'Vanilla toggle semantics are incorrect.',
  );
  await control.click();
  await page.waitForFunction(() =>
    (document.documentElement.dataset.wgVanillaRequest ?? '').includes('"trigger":"pointer"'),
  );
}

async function assertReactPrimary(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.dataset.wgReactProbe === 'WG_REACT_CLIENT_FALLBACK_READY',
  );
  const state = await page.evaluate(() => ({
    fallback: document.querySelector('[data-client-fallback]') !== null,
    toggleRegistered: customElements.get('wg-toggle') !== undefined,
    booleanRegistered: customElements.get('wg-boolean-value') !== undefined,
    unusedRegistered: customElements.get('wg-media-viewer') !== undefined,
  }));
  assertBrowser(
    !state.fallback && state.toggleRegistered && state.booleanRegistered && !state.unusedRegistered,
    'WG_RC_BROWSER_REACT_REGISTRATION',
    'React client fallback or guarded registration boundary is incorrect.',
  );
  const wrapper = page.locator('#root wg-toggle');
  const direct = page.locator('#direct wg-toggle');
  assertBrowser(
    (await wrapper.count()) === 1 && (await direct.count()) === 1,
    'WG_RC_BROWSER_REACT_PARITY',
    'React wrapper and direct element are not both rendered.',
  );
  for (const toggle of [wrapper, direct]) {
    const control = toggle.locator('[role="switch"]');
    assertBrowser(
      (await control.getAttribute('aria-label')) === 'Channel control' &&
        (await control.getAttribute('aria-checked')) === 'false',
      'WG_RC_BROWSER_REACT_SEMANTICS',
      'React wrapper/direct semantics differ.',
    );
  }
  await wrapper.locator('[role="switch"]').click();
  await page.waitForFunction(() =>
    (document.documentElement.dataset.wgReactRequest ?? '').includes('"trigger":"pointer"'),
  );
}

async function assertReactRemoval(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.dataset.wgReactRemoval === 'WG_REACT_BINDING_REMOVED',
  );
  const state = await page.evaluate(() => ({
    boolean: document.documentElement.dataset.wgBoolean,
    booleanRegistered: customElements.get('wg-boolean-value') !== undefined,
    toggleRegistered: customElements.get('wg-toggle') !== undefined,
    reactMarker: document.documentElement.dataset.wgReactProbe,
    renderedText: document.querySelector('wg-boolean-value')?.shadowRoot?.textContent,
  }));
  assertBrowser(
    state.boolean === 'asserted' &&
      state.booleanRegistered &&
      !state.toggleRegistered &&
      state.reactMarker === undefined &&
      state.renderedText?.includes('Binding removed') &&
      state.renderedText.includes('Direct element operational'),
    'WG_RC_BROWSER_REACT_REMOVAL',
    'Direct-element browser fixture retained React behavior or lost its Boolean element.',
  );
  assertBrowser(
    (await page.locator('wg-boolean-value').count()) === 1,
    'WG_RC_BROWSER_REACT_REMOVAL_SEMANTICS',
    'React-removal fixture did not render the direct element semantics.',
  );
}

const browserTypes: Readonly<Record<ConsumerBrowserEngine, BrowserType>> = {
  chromium,
  firefox,
  webkit,
};

export async function observeConsumerBrowserVersions(): Promise<
  Readonly<Record<ConsumerBrowserEngine, string>>
> {
  const versions = {} as Record<ConsumerBrowserEngine, string>;
  for (const engine of consumerBrowserEngines) {
    let browser: Browser;
    try {
      browser = await browserTypes[engine].launch();
    } catch (error) {
      const detail =
        error instanceof Error ? error.message.split('\n')[0] : 'unknown launch failure';
      fail(
        'WG_RC_BROWSER_UNAVAILABLE',
        `${engine} is unavailable for environment observation: ${detail}.`,
      );
    }
    try {
      versions[engine] = browser.version();
    } finally {
      await browser.close();
    }
  }
  return Object.freeze(versions);
}

export async function executeConsumerBrowser(execution: ConsumerBrowserExecution): Promise<void> {
  let browser: Browser;
  try {
    browser = await browserTypes[execution.engine].launch();
  } catch (error) {
    const detail = error instanceof Error ? error.message.split('\n')[0] : 'unknown launch failure';
    fail(
      'WG_RC_BROWSER_UNAVAILABLE',
      `${execution.engine} is unavailable for the release-candidate probe: ${detail}.`,
    );
  }
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto(execution.url, { waitUntil: 'networkidle' });
    assertBrowser(response?.ok(), 'WG_RC_BROWSER_RESPONSE', 'Consumer fixture did not load.');
    if (execution.context.scenario.kind === 'vanilla') await assertVanilla(page);
    else if (execution.stage === 'primary') await assertReactPrimary(page);
    else await assertReactRemoval(page);
    const accessibility = await new AxeBuilder({ page }).analyze();
    assertBrowser(
      accessibility.violations.length === 0,
      'WG_RC_BROWSER_ACCESSIBILITY',
      `Automated accessibility violations: ${accessibility.violations.map(({ id }) => id).join(', ')}.`,
    );
    assertBrowser(
      pageErrors.length === 0,
      'WG_RC_BROWSER_PAGE_ERROR',
      `Consumer fixture reported page errors: ${pageErrors.join('; ')}.`,
    );
  } finally {
    await browser.close();
  }
}

export function createConsumerBrowserProbe(
  results: ConsumerBrowserProbeResult[],
  execute: ConsumerBrowserExecutor = executeConsumerBrowser,
  serve: ConsumerBrowserServer = withBuiltConsumerServer,
): ConsumerRuntimeProbe {
  return async (context, stage) => {
    await serve(context.root, async (url) => {
      for (const engine of consumerBrowserEngines) {
        await execute({ engine, url, context, stage });
        results.push(
          Object.freeze({
            scenarioId: context.scenario.id,
            kind: context.scenario.kind,
            stage,
            engine,
            runtime: true,
            semantics: true,
            accessibility: true,
          }),
        );
      }
    });
  };
}

export async function probeBrowserConsumers(
  request: BrowserConsumerProbeRequest,
): Promise<readonly ConsumerBrowserProbeResult[]> {
  return (await runBrowserConsumerMatrix(request)).browsers;
}

export interface BrowserConsumerMatrixResult {
  readonly vanilla: readonly VanillaBuildProbeResult[];
  readonly react: readonly ReactBuildProbeResult[];
  readonly browsers: readonly ConsumerBrowserProbeResult[];
}

export async function runBrowserConsumerMatrix(
  request: BrowserConsumerProbeRequest,
): Promise<BrowserConsumerMatrixResult> {
  const results: ConsumerBrowserProbeResult[] = [];
  const runtime = createConsumerBrowserProbe(results, request.execute);
  const vanilla = await probeVanillaConsumers(request, runtime);
  const react = await probeReactConsumers(request, runtime);
  return Object.freeze({ vanilla, react, browsers: Object.freeze(results) });
}
