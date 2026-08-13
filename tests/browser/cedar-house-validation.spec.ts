import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const cedarBaseUrl = 'http://127.0.0.1:6103';
const maximumQuery = {
  scenario: 'steady',
  theme: 'wayglass-dark',
  density: 'comfortable',
  fixture: 'maximum',
};

type CedarMutation = 'confirmed-control' | 'failed-control' | 'partial-secure' | 'telemetry';

async function openMaximumCedar(page: Page, path = '/', parameters: Record<string, string> = {}) {
  const query = new URLSearchParams({ ...maximumQuery, ...parameters });
  await page.goto(`${cedarBaseUrl}${path}?${query}`);
  await page.waitForFunction(
    (expectsTelemetry) =>
      customElements.get('wg-telemetry-strip') !== undefined &&
      (!expectsTelemetry ||
        document.querySelectorAll('[data-validation-telemetry]').length === 6) &&
      typeof (
        window as Window & {
          __cedarValidation?: { runMutation?: (mutation: CedarMutation) => number };
        }
      ).__cedarValidation?.runMutation === 'function',
    path === '/',
  );
}

async function pageOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function runMutation(page: Page, mutation: CedarMutation) {
  return page.evaluate((value) => {
    const validation = (
      window as Window & {
        __cedarValidation?: { runMutation?: (mutation: CedarMutation) => number };
      }
    ).__cedarValidation;
    if (!validation?.runMutation) throw new Error('Cedar validation harness is unavailable.');
    return validation.runMutation(value);
  }, mutation);
}

test('constructs the accepted maximum Cedar House fixture from one application truth', async ({
  page,
}) => {
  await openMaximumCedar(page);

  await expect(
    page.getByRole('list', { name: 'Household inventory' }).getByRole('listitem'),
  ).toHaveCount(40);
  await expect(page.locator('wg-metric, wg-boolean-value')).toHaveCount(24);
  await expect(page.locator('[data-validation-telemetry]')).toHaveCount(6);
  const sampleCounts = await page
    .locator('[data-validation-telemetry]')
    .evaluateAll((elements) =>
      elements.map((element) => (element as { samples: unknown[] }).samples.length),
    );
  expect(sampleCounts).toEqual([120, 120, 120, 120, 120, 120]);

  await openMaximumCedar(page, '/assets/hvac-air-handler');
  await expect(
    page.getByRole('list', { name: 'Maintenance history' }).getByRole('listitem'),
  ).toHaveCount(60);
});

test('preserves maximum-fixture navigation, focus, and next-frame mutation stability', async ({
  page,
}) => {
  await openMaximumCedar(page);
  const focusTarget = page.getByRole('link', { name: 'Open Maintenance' });
  await focusTarget.focus();

  const telemetryBefore = await page
    .locator('[data-validation-telemetry]')
    .first()
    .getByText(/120 confirmed samples/)
    .textContent();
  const duration = await runMutation(page, 'telemetry');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

  expect(duration).toBeLessThan(100);
  await expect(focusTarget).toBeFocused();
  await expect(page.locator('.cedar-announcement')).toBeEmpty();
  await expect(
    page
      .locator('[data-validation-telemetry]')
      .first()
      .getByText(/120 confirmed samples/),
  ).not.toHaveText(telemetryBefore ?? '');

  await focusTarget.click();
  await expect(page).toHaveURL(/\/functions\/maintenance\?.*fixture=maximum/);
  await page.goBack();
  await expect(
    page.getByRole('heading', { name: 'Validation-scale household context' }),
  ).toBeVisible();
});

test('contains the branded wall composition in every supported engine', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openMaximumCedar(page, '/', {
    theme: 'wayglass-light',
    density: 'compact',
    scenario: 'secure-partial',
  });

  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-function]')).toHaveCount(5);
  await expect(page.getByText(/Garage door is open/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Secure Cedar House' }).first()).toBeVisible();
});

test('commits each accepted maximum-fixture mutation without moving focus', async ({ page }) => {
  await openMaximumCedar(page);
  const focusTarget = page.getByRole('link', { name: 'Open Maintenance' });
  await focusTarget.focus();

  expect(await runMutation(page, 'confirmed-control')).toBeLessThan(100);
  await expect(page.locator('wg-boolean-value[label="Porch light"]')).toHaveAttribute(
    'asserted',
    '',
  );
  await expect(focusTarget).toBeFocused();

  expect(await runMutation(page, 'failed-control')).toBeLessThan(100);
  await expect(
    page.locator('.cedar-control-result').filter({ hasText: 'Porch light did not change' }),
  ).toBeVisible();
  await expect(focusTarget).toBeFocused();

  expect(await runMutation(page, 'partial-secure')).toBeLessThan(100);
  await expect(
    page.locator('.cedar-control-result').filter({ hasText: 'garage door remains unresolved' }),
  ).toBeVisible();
  await expect(focusTarget).toBeFocused();
});

test('reflows at 200% root text in both official themes', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 320, height: 900 });

  for (const theme of ['wayglass-dark', 'wayglass-light']) {
    await openMaximumCedar(page, '/', { theme });
    await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
    await expect(page.getByRole('link', { name: 'Open Maintenance' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Turn porch light/ })).toBeVisible();
  }
});

test('contains long content with direction-neutral RTL mechanics', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 1280, height: 800 });
  await openMaximumCedar(page, '/', { dir: 'rtl', density: 'compact' });
  await page.evaluate(() => {
    document.documentElement.lang = 'de';
    const description = document.querySelector<HTMLElement>('.cedar-page-heading > p:last-child');
    if (description) {
      description.textContent =
        'Ist das gesamte Haus für den Abend vorbereitet, einschließlich aller bestätigten Zustände, ausstehenden Wartungsarbeiten und verfügbaren nächsten Schritte?';
    }
  });

  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  await expect(page.locator('wg-theme-provider')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText(/einschließlich aller bestätigten Zustände/)).toBeVisible();
});

test('retains meaning in forced colors, grayscale, and reduced motion', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openMaximumCedar(page, '/functions/access', { scenario: 'secure-partial' });
  await page.addStyleTag({ content: 'wg-theme-provider { filter: grayscale(1); }' });

  await expect(page.getByText('Garage door', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Open', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Secure Cedar House' }).click();
  await expect(page.getByRole('dialog', { name: 'Secure Cedar House?' })).toBeVisible();
  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);

  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});

test('keeps every theme and density combination contained', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const theme of ['wayglass-dark', 'wayglass-light']) {
    for (const density of ['compact', 'comfortable']) {
      await openMaximumCedar(page, '/', { theme, density });
      expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
      await expect(page.locator('wg-theme-provider')).toHaveAttribute('theme', theme);
      await expect(page.locator('wg-theme-provider')).toHaveAttribute('density', density);
    }
  }
});

test('meets the recorded Chromium construction and mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Timing evidence is recorded in Chromium only.');
  const constructionDurations: number[] = [];
  for (let iteration = 0; iteration < 18; iteration += 1) {
    await openMaximumCedar(page);
    const duration = await page.evaluate(
      () =>
        (
          window as Window & {
            __cedarValidation?: { constructionDuration?: number };
          }
        ).__cedarValidation?.constructionDuration ?? Number.POSITIVE_INFINITY,
    );
    if (iteration >= 3) constructionDurations.push(duration);
  }

  const mutationDurations: Record<CedarMutation, number[]> = {
    'confirmed-control': [],
    'failed-control': [],
    'partial-secure': [],
    telemetry: [],
  };
  const longTasks = await page.evaluate(() => {
    const durations: number[] = [];
    const observer = PerformanceObserver.supportedEntryTypes.includes('longtask')
      ? new PerformanceObserver((list) =>
          durations.push(...list.getEntries().map(({ duration }) => duration)),
        )
      : null;
    observer?.observe({ type: 'longtask', buffered: true });
    (window as Window & { __cedarLongTasks?: number[] }).__cedarLongTasks = durations;
    return durations;
  });
  expect(longTasks).toEqual([]);

  for (const mutation of Object.keys(mutationDurations) as CedarMutation[]) {
    for (let iteration = 0; iteration < 18; iteration += 1) {
      const duration = await runMutation(page, mutation);
      if (iteration >= 3) mutationDurations[mutation].push(duration);
    }
  }

  const median = (values: number[]) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
  expect(median(constructionDurations)).toBeLessThan(100);
  expect(Math.max(...constructionDurations)).toBeLessThan(100);
  for (const durations of Object.values(mutationDurations)) {
    expect(median(durations)).toBeLessThan(100);
    expect(Math.max(...durations)).toBeLessThan(100);
  }
  const observedLongTasks = await page.evaluate(
    () => (window as Window & { __cedarLongTasks?: number[] }).__cedarLongTasks ?? [],
  );
  expect(observedLongTasks.filter((duration) => duration >= 100)).toEqual([]);

  console.info(
    JSON.stringify({
      construction: {
        median: median(constructionDurations),
        maximum: Math.max(...constructionDurations),
      },
      mutations: Object.fromEntries(
        Object.entries(mutationDurations).map(([name, durations]) => [
          name,
          { median: median(durations), maximum: Math.max(...durations) },
        ]),
      ),
    }),
  );
});
