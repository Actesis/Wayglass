import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const origin = process.env.WAYGLASS_SITE_ORIGIN!;

function rejectExternalRuntimeRequests(page: Page): () => void {
  const external = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['data:', 'blob:'].includes(url.protocol) && url.origin !== origin) external.add(url.href);
  });
  return () => expect([...external], 'runtime requests must remain same-origin').toEqual([]);
}

test('serves the exact route, redirect, header, and method contract over HTTP', async ({
  request,
}) => {
  const canonical = await request.get(`${origin}/phase-6.html?proof=browser`, {
    maxRedirects: 0,
  });
  expect(canonical.status()).toBe(307);
  expect(canonical.headers().location).toBe('/phase-6?proof=browser');
  expect(canonical.headers()['content-security-policy']).toBeUndefined();

  const missing = await request.get(`${origin}/storybook/missing-proof.js`);
  expect(missing.status()).toBe(404);
  expect(missing.headers()['content-type']).toBe('text/html; charset=utf-8');
  expect(missing.headers()['x-robots-tag']).toBe('noindex');

  const head = await request.head(`${origin}/storybook/iframe?viewMode=story`);
  expect(head.status()).toBe(200);
  expect(await head.body()).toHaveLength(0);
  expect(head.headers()['content-security-policy']).toContain("frame-ancestors 'self'");

  const rejected = await request.post(`${origin}/`);
  expect(rejected.status()).toBe(405);
  expect(rejected.headers().allow).toBe('GET, HEAD');
});

test('hydrates documentation with its canonical URL and enforced CSP', async ({ page }) => {
  const assertNoExternalRequests = rejectExternalRuntimeRequests(page);
  const response = await page.goto('/phase-6');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Phase 6');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://wayglass.hoagsoftworks.com/phase-6',
  );
  expect(response?.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
  ).toEqual([]);
  assertNoExternalRequests();

  const blockedRequest = page.waitForEvent('requestfailed', {
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
  const failed = await blockedRequest;
  expect(failed.failure()?.errorText).toBe('csp');
  const violations = await page.evaluate(
    () => (window as Window & { __wgCspViolations?: string[] }).__wgCspViolations ?? [],
  );
  expect(violations.some((value) => value.startsWith('img-src'))).toBe(true);
});

test('loads the Storybook manager and a same-origin preview', async ({ page }) => {
  const assertNoExternalRequests = rejectExternalRuntimeRequests(page);
  const response = await page.goto('/storybook/');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['x-robots-tag']).toBe('noindex');
  await expect(page.locator('#storybook-explorer-menu')).toBeVisible();

  const index = await page.request.get(`${origin}/storybook/index.json`);
  const entries = (await index.json()) as { entries: Record<string, { type: string }> };
  const story = Object.entries(entries.entries).find(([, entry]) => entry.type === 'story')?.[0];
  expect(story).toBeDefined();
  await page.goto(`/storybook/iframe?id=${encodeURIComponent(story!)}&viewMode=story`);
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
  expect(await page.locator('iframe').count()).toBe(0);
  assertNoExternalRequests();
});

test('renders a useful branded 404 with keyboard recovery links', async ({ page }) => {
  const assertNoExternalRequests = rejectExternalRuntimeRequests(page);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const response = await page.goto('/missing-browser-proof');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Documentation home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Storybook' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.getByRole('link', { name: 'Documentation home' }).focus();
  const focus = await page
    .getByRole('link', { name: 'Documentation home' })
    .evaluate((element) => ({
      outline: getComputedStyle(element).outlineStyle,
      forcedColors: matchMedia('(forced-colors: active)').matches,
    }));
  expect(focus.forcedColors).toBe(true);
  expect(focus.outline).not.toBe('none');
  assertNoExternalRequests();
});
