import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const northlineBaseUrl = 'http://127.0.0.1:6104';
const maximumQuery = {
  scenario: 'stale-trailer',
  theme: 'wayglass-dark',
  density: 'compact',
  fixture: 'maximum',
};

type NorthlineMutation =
  'filter-sort' | 'hold-lifecycle' | 'insert-events' | 'replace-rows' | 'telemetry';

async function openMaximumNorthline(
  page: Page,
  path = '/functions/dispatch',
  parameters: Record<string, string> = {},
) {
  const query = new URLSearchParams({ ...maximumQuery, ...parameters });
  await page.goto(`${northlineBaseUrl}${path}?${query}`);
  await page.waitForFunction((expectsMaximumContext) => {
    const validation = (
      window as Window & {
        __northlineValidation?: { runMutation?: (mutation: NorthlineMutation) => number };
      }
    ).__northlineValidation;
    return (
      customElements.get('wg-panel') !== undefined &&
      (!expectsMaximumContext ||
        (document.querySelectorAll('[data-validation-telemetry]').length === 8 &&
          typeof validation?.runMutation === 'function'))
    );
  }, path === '/functions/dispatch');
}

async function pageOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function runMutation(page: Page, mutation: NorthlineMutation) {
  return page.evaluate((value) => {
    const validation = (
      window as Window & {
        __northlineValidation?: { runMutation?: (mutation: NorthlineMutation) => number };
      }
    ).__northlineValidation;
    if (!validation?.runMutation) throw new Error('Northline validation harness is unavailable.');
    return validation.runMutation(value);
  }, mutation);
}

test('constructs the accepted maximum Northline fixture from application-owned truth', async ({
  page,
}) => {
  await openMaximumNorthline(page);

  const table = page.getByRole('table', { name: 'Outbound load records' });
  await expect(table.locator('tbody tr')).toHaveCount(80);
  await expect(table.locator('thead th')).toHaveCount(12);
  await expect(page.locator('[data-validation-value]')).toHaveCount(24);
  await expect(page.locator('[data-validation-telemetry]')).toHaveCount(8);
  expect(
    await page
      .locator('[data-validation-telemetry]')
      .evaluateAll((elements) =>
        elements.map((element) => (element as { samples: unknown[] }).samples.length),
      ),
  ).toEqual(Array.from({ length: 8 }, () => 120));
  await expect(page.locator('[data-validation-status]')).toHaveCount(100);
  await expect(page.locator('[data-validation-event]')).toHaveCount(250);
  await expect(page.getByText('Application retention · 250 of 250 recent events')).toBeVisible();
});

test('preserves typed route identity through browser back and forward', async ({ page }) => {
  await openMaximumNorthline(page, '/');
  await expect(page).toHaveTitle('Outbound readiness — Northline Cold Storage');
  await page.getByRole('link', { name: 'Open Dispatch' }).click();
  await expect(page).toHaveURL(/\/functions\/dispatch\?.*fixture=maximum/);
  await expect(page.getByRole('heading', { name: 'Dispatch', level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Outbound readiness', level: 1 })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Dispatch', level: 1 })).toBeVisible();
});

test('contains the branded wall composition in every supported engine', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openMaximumNorthline(page, '/', {
    theme: 'wayglass-light',
    density: 'compact',
  });

  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-function]')).toHaveCount(4);
  await expect(page.getByText('1 outbound load needs review.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Dispatch' })).toBeVisible();
});

test('commits maximum-fixture mutations by the next frame without moving focus', async ({
  page,
}) => {
  await openMaximumNorthline(page);
  const focusTarget = page.getByRole('link', { name: 'Inspect NL-2048' }).first();
  await focusTarget.focus();
  const initialScroll = await page.evaluate(() => window.scrollY);

  for (const mutation of [
    'telemetry',
    'replace-rows',
    'insert-events',
    'filter-sort',
    'hold-lifecycle',
  ] as const) {
    expect(await runMutation(page, mutation)).toBeLessThan(100);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
    await expect(focusTarget).toBeFocused();
  }

  expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
  await expect(page.locator('.northline-announcement')).toHaveText(
    'NL-2048 is confirmed on dispatch hold.',
  );
  await expect(
    page.locator('tr[data-load-id="NL-2048"]').getByText('Held', { exact: true }),
  ).toBeVisible();
});

test('reflows at 200% root text in both official themes', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 320, height: 900 });

  for (const theme of ['wayglass-dark', 'wayglass-light']) {
    await openMaximumNorthline(page, '/functions/dispatch', { theme });
    await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
    await expect(page.getByLabel('Show')).toBeVisible();
    await expect(
      page.locator('wg-scroll-region[label="Outbound load records table"]'),
    ).toBeVisible();
  }
});

test('contains long content with direction-neutral RTL mechanics', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 1280, height: 800 });
  await openMaximumNorthline(page, '/functions/dispatch', { dir: 'rtl' });
  await page.evaluate(() => {
    document.documentElement.lang = 'de';
    const description = document.querySelector<HTMLElement>(
      '.northline-page-heading > p:last-child',
    );
    if (description) {
      description.textContent =
        'Koordination aller ausgehenden Ladungen einschließlich bestätigter Freigaben, unvollständiger Temperaturkenntnis und verfügbarer nächster Schritte.';
    }
  });

  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  await expect(page.locator('wg-theme-provider')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText(/einschließlich bestätigter Freigaben/)).toBeVisible();
});

test('retains meaning in forced colors, grayscale, and reduced motion', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openMaximumNorthline(page, '/loads/NL-2048', { scenario: 'hold-denied' });
  await page.addStyleTag({ content: 'wg-theme-provider { filter: grayscale(1); }' });

  await expect(page.getByText('Permission required')).toBeVisible();
  await expect(page.getByText(/NL-2048 remains scheduled/)).toBeVisible();
  await page.getByRole('button', { name: 'Retry dispatch hold' }).click();
  await expect(page.getByRole('dialog', { name: 'Place NL-2048 on dispatch hold?' })).toBeVisible();
  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  expect(
    (await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()).violations,
  ).toEqual([]);
});

test('keeps every theme and density combination contained', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const theme of ['wayglass-dark', 'wayglass-light']) {
    for (const density of ['compact', 'comfortable']) {
      await openMaximumNorthline(page, '/functions/dispatch', { theme, density });
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
    await openMaximumNorthline(page);
    const duration = await page.evaluate(
      () =>
        (
          window as Window & {
            __northlineValidation?: { constructionDuration?: number };
          }
        ).__northlineValidation?.constructionDuration ?? Number.POSITIVE_INFINITY,
    );
    if (iteration >= 3) constructionDurations.push(duration);
  }

  const mutationDurations: Record<NorthlineMutation, number[]> = {
    'filter-sort': [],
    'hold-lifecycle': [],
    'insert-events': [],
    'replace-rows': [],
    telemetry: [],
  };
  await page.evaluate(() => {
    const durations: number[] = [];
    const observer = PerformanceObserver.supportedEntryTypes.includes('longtask')
      ? new PerformanceObserver((list) =>
          durations.push(...list.getEntries().map(({ duration }) => duration)),
        )
      : null;
    observer?.observe({ type: 'longtask', buffered: true });
    (window as Window & { __northlineLongTasks?: number[] }).__northlineLongTasks = durations;
  });

  for (const mutation of Object.keys(mutationDurations) as NorthlineMutation[]) {
    for (let iteration = 0; iteration < 18; iteration += 1) {
      const duration = await runMutation(page, mutation);
      if (iteration >= 3) mutationDurations[mutation].push(duration);
    }
  }

  const median = (values: number[]) =>
    [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)]!;
  expect(median(constructionDurations)).toBeLessThan(100);
  expect(Math.max(...constructionDurations)).toBeLessThan(100);
  for (const durations of Object.values(mutationDurations)) {
    expect(median(durations)).toBeLessThan(100);
    expect(Math.max(...durations)).toBeLessThan(100);
  }
  expect(
    (
      await page.evaluate(
        () => (window as Window & { __northlineLongTasks?: number[] }).__northlineLongTasks ?? [],
      )
    ).filter((duration) => duration >= 100),
  ).toEqual([]);

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
