import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const harborBaseUrl = 'http://127.0.0.1:6105';
const maximumQuery = {
  scenario: 'stale-evidence',
  theme: 'wayglass-dark',
  density: 'compact',
  fixture: 'maximum',
};

type HarborMutation =
  | 'approval-lifecycle'
  | 'retry-attempt'
  | 'insert-tool-records'
  | 'replace-task-rows'
  | 'telemetry';

async function openMaximumHarbor(
  page: Page,
  path = '/tasks/HL-317',
  parameters: Record<string, string> = {},
) {
  const query = new URLSearchParams({ ...maximumQuery, ...parameters });
  await page.goto(`${harborBaseUrl}${path}?${query}`);
  await page.waitForFunction((expectsMaximumContext) => {
    const validation = (
      window as Window & {
        __harborValidation?: { runMutation?: (mutation: HarborMutation) => number };
      }
    ).__harborValidation;
    return (
      customElements.get('wg-panel') !== undefined &&
      (!expectsMaximumContext ||
        (document.querySelectorAll('[data-validation-event]').length === 250 &&
          typeof validation?.runMutation === 'function'))
    );
  }, path === '/tasks/HL-317');
}

async function pageOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function runMutation(page: Page, mutation: HarborMutation) {
  return page.evaluate((value) => {
    const validation = (
      window as Window & {
        __harborValidation?: { runMutation?: (mutation: HarborMutation) => number };
      }
    ).__harborValidation;
    if (!validation?.runMutation) throw new Error('Harbor validation harness is unavailable.');
    return validation.runMutation(value);
  }, mutation);
}

test('constructs the accepted maximum Harbor fixture from application-owned truth', async ({
  page,
}) => {
  await openMaximumHarbor(page, '/');
  await expect(page.locator('wg-metric[label="Available workers"]')).toHaveAttribute(
    'unit',
    'of 12',
  );

  await openMaximumHarbor(page);
  const table = page.getByRole('table', { name: 'Harbor retained task records' });
  await expect(table.locator('tbody tr')).toHaveCount(60);
  await expect(table.locator('thead th')).toHaveCount(10);
  await expect(page.locator('[data-validation-value]')).toHaveCount(24);
  await expect(page.locator('[data-validation-telemetry]')).toHaveCount(6);
  expect(
    await page
      .locator('[data-validation-telemetry]')
      .evaluateAll((elements) =>
        elements.map((element) => (element as { samples: unknown[] }).samples.length),
      ),
  ).toEqual(Array.from({ length: 6 }, () => 120));
  await expect(page.locator('[data-validation-event]')).toHaveCount(250);
  await expect(
    page.getByText('Application retention · 250 of 250 recent tool records'),
  ).toBeVisible();
});

test('preserves typed route identity through browser back and forward', async ({ page }) => {
  await openMaximumHarbor(page, '/');
  await expect(page).toHaveTitle('Supervision overview — Harbor Lab');
  await page.getByRole('link', { name: 'Open Review and approval' }).click();
  await expect(page).toHaveURL(/\/functions\/review-approval\?.*fixture=maximum/);
  await page.getByRole('link', { name: 'Inspect HL-317' }).click();
  await expect(page.getByRole('heading', { name: 'Task HL-317', level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Review and approval', level: 1 })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Task HL-317', level: 1 })).toBeVisible();
});

test('contains the branded wall composition in every supported engine', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openMaximumHarbor(page, '/', {
    theme: 'wayglass-light',
    density: 'compact',
  });

  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-function]')).toHaveCount(4);
  await expect(page.getByText('1 task needs a human decision.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Inspect HL-317' }).first()).toBeVisible();
});

test('commits maximum-fixture mutations by the next frame without moving focus', async ({
  page,
}) => {
  await openMaximumHarbor(page);
  const focusTarget = page.getByRole('link', { name: 'Back to Review and approval' }).first();
  await focusTarget.focus();
  const initialScroll = await page.evaluate(() => window.scrollY);

  for (const mutation of [
    'telemetry',
    'replace-task-rows',
    'insert-tool-records',
    'approval-lifecycle',
    'retry-attempt',
  ] as const) {
    expect(await runMutation(page, mutation)).toBeLessThan(100);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
    await expect(focusTarget).toBeFocused();
  }

  expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
  await expect(page.locator('wg-key-value[label="Current attempt"]')).toHaveAttribute(
    'value',
    /attempt-hl-317-validation-/,
  );
  await expect(page.locator('wg-key-value[label="Confirmed merge state"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
});

test('reflows at 200% root text in both official themes', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 320, height: 900 });

  for (const theme of ['wayglass-dark', 'wayglass-light']) {
    await openMaximumHarbor(page, '/tasks/HL-317', { theme });
    await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
    await expect(
      page.getByRole('button', { name: 'Review merge approval for HL-317' }),
    ).toBeVisible();
    await expect(
      page.locator('wg-scroll-region[label="Harbor retained task records table"]'),
    ).toBeVisible();
  }
});

test('contains long content with direction-neutral RTL mechanics', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.setViewportSize({ width: 1280, height: 800 });
  await openMaximumHarbor(page, '/tasks/HL-317', { dir: 'rtl' });
  await page.evaluate(() => {
    document.documentElement.lang = 'de';
    const description = document.querySelector<HTMLElement>('.harbor-page-heading > p:last-child');
    if (description) {
      description.textContent =
        'Prüfen Sie Aufgabenherkunft, Werkzeugverlauf, Beweisalter, menschliche Freigabe und bestätigten Zielzustand, ohne Aktivität mit einem vertrauenswürdigen Ergebnis zu verwechseln.';
    }
  });

  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  await expect(page.locator('wg-theme-provider')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText(/bestätigten Zielzustand/)).toBeVisible();
});

test('retains meaning in forced colors, grayscale, and reduced motion', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Tier B presentation permutations run in Chromium.');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openMaximumHarbor(page, '/tasks/HL-317', { scenario: 'merge-failed' });
  await page.addStyleTag({ content: 'wg-theme-provider { filter: grayscale(1); }' });

  await expect(page.getByText('Merge failed', { exact: true })).toBeVisible();
  await expect(page.getByText(/target branch remains unchanged/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry HL-317 as a new attempt' })).toBeVisible();
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
      await openMaximumHarbor(page, '/tasks/HL-317', { theme, density });
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
    await openMaximumHarbor(page);
    const duration = await page.evaluate(
      () =>
        (
          window as Window & {
            __harborValidation?: { constructionDuration?: number };
          }
        ).__harborValidation?.constructionDuration ?? Number.POSITIVE_INFINITY,
    );
    if (iteration >= 3) constructionDurations.push(duration);
  }

  const mutationDurations: Record<HarborMutation, number[]> = {
    'approval-lifecycle': [],
    'retry-attempt': [],
    'insert-tool-records': [],
    'replace-task-rows': [],
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
    (window as Window & { __harborLongTasks?: number[] }).__harborLongTasks = durations;
  });

  for (const mutation of Object.keys(mutationDurations) as HarborMutation[]) {
    for (let iteration = 0; iteration < 18; iteration += 1) {
      const duration = await runMutation(page, mutation);
      if (iteration >= 3) mutationDurations[mutation].push(duration);
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
      );
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
        () => (window as Window & { __harborLongTasks?: number[] }).__harborLongTasks ?? [],
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
