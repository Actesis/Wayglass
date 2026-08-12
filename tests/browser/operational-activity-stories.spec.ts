import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Composition = 'overview' | 'focused';
type Scenario =
  | 'steady'
  | 'initial-loading'
  | 'retained-refresh'
  | 'stale-partial'
  | 'unavailable'
  | 'filtered-empty'
  | 'failed-request'
  | 'recovered'
  | 'live-update';

async function openOperationalActivity(
  page: import('@playwright/test').Page,
  options: {
    composition?: Composition;
    scenario?: Scenario;
    width?: 'phone' | 'desktop' | 'wall';
    theme?: 'wayglass-dark' | 'wayglass-light';
    density?: 'compact' | 'comfortable';
    selected?: 'intake' | 'processing' | 'delivery';
    direction?: 'ltr' | 'rtl';
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    composition: options.composition ?? 'overview',
    scenario: options.scenario ?? 'steady',
    width: options.width ?? 'desktop',
    theme: options.theme ?? 'wayglass-dark',
    density: options.density ?? 'compact',
    selected: options.selected ?? 'intake',
    direction: options.direction ?? 'ltr',
  });
  await page.goto(`/tests/browser/operational-activity-stories/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-tabs') !== undefined &&
      document.querySelector('[data-operational-activity-root]') !== null,
  );
}

test('composes three ordered functions from one state with stable authored record identity', async ({
  page,
}) => {
  await openOperationalActivity(page);
  const functions = page.locator('.wg-operational-overview > [data-function]');
  await expect(functions).toHaveCount(3);
  await expect(functions.nth(0)).toHaveAttribute('data-function', 'intake');
  await expect(functions.nth(1)).toHaveAttribute('data-function', 'processing');
  await expect(functions.nth(2)).toHaveAttribute('data-function', 'delivery');
  await expect(page.locator('wg-event-record')).toHaveCount(4);
  await expect(page.locator('tbody tr[data-record-key]')).toHaveCount(4);
  await expect(
    page.locator('wg-event-record').filter({ hasText: 'Record accepted for processing.' }),
  ).toHaveCount(2);
  await expect(page.locator('wg-event-record[data-record-key="intake-event-104"]')).toHaveCount(1);
  await expect(page.locator('wg-event-record[data-record-key="intake-event-103"]')).toHaveCount(1);
  await expect(page.locator('[data-announcement-owner][aria-live="polite"]')).toHaveCount(1);
  await expect(page.locator('[aria-live]')).toHaveCount(1);
});

test('uses one accepted tabs selector and keeps consequential response reachable', async ({
  page,
}) => {
  await openOperationalActivity(page, { composition: 'focused' });
  await expect(page.getByRole('tablist', { name: 'Operational Activity functions' })).toHaveCount(
    1,
  );
  await expect(page.getByRole('tab')).toHaveCount(3);
  const intake = page.locator('wg-tab[value="intake"]');
  await expect(intake).toHaveAttribute('aria-selected', 'true');
  await intake.focus();
  await intake.press('ArrowRight');
  await expect(page.locator('wg-tab[value="processing"]')).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Open Delivery response' }).click();
  await expect(page.locator('wg-tab[value="delivery"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('wg-tab[value="delivery"]')).toBeFocused();
});

test('owns filtering and sorting once while preserving retained row nodes and focus', async ({
  page,
}) => {
  await openOperationalActivity(page);
  await page.locator('#operational-intake-query').fill('Central');
  await page.getByRole('button', { name: 'Apply Intake event filters' }).click();
  await expect(page.locator('wg-event-record')).toHaveCount(2);
  await expect(page.locator('[data-announcement-owner]')).toHaveText(
    'Intake filters applied. 2 records shown.',
  );

  const firstRow = page.locator('tbody tr[data-record-key]').first();
  await firstRow.evaluate((row) => {
    (window as Window & { retainedDeliveryRow?: Element }).retainedDeliveryRow = row;
  });
  const sort = page.getByRole('button', { name: 'Updated, newest first' });
  await sort.focus();
  await sort.press('Enter');
  await expect(page.getByRole('button', { name: 'Updated, oldest first' })).toBeFocused();
  expect(
    await page
      .locator('tbody tr[data-record-key]')
      .last()
      .evaluate(
        (row) => row === (window as Window & { retainedDeliveryRow?: Element }).retainedDeliveryRow,
      ),
  ).toBe(true);
  await expect(page.locator('[data-announcement-owner]')).toHaveText(
    'Delivery records sorted by oldest update first.',
  );
});

test('separates a pending Processing request from the retained confirmed state', async ({
  page,
}) => {
  await openOperationalActivity(page, {
    composition: 'focused',
    selected: 'processing',
  });
  await page.getByRole('button', { name: 'Request Processing intake pause' }).click();
  await expect(page.locator('[data-processing-request-status]')).toHaveText(
    'Pause requested. Confirmed Processing intake remains open.',
  );
  await expect(page.locator('[data-announcement-owner]')).toHaveText(
    'Processing pause requested. Confirmed Processing intake remains open.',
  );
  await page.getByRole('button', { name: 'Confirm Processing pause result' }).click();
  await expect(page.locator('[data-processing-request-status]')).toHaveText(
    'Pause accepted. Confirmed Processing intake is closed.',
  );
});

test('renders deterministic loading, retained refresh, empty, failed, and live-update states', async ({
  page,
}) => {
  await openOperationalActivity(page, { scenario: 'initial-loading' });
  await expect(page.locator('wg-progress')).toHaveCount(3);
  await expect(page.locator('wg-event-record, tbody tr[data-record-key]')).toHaveCount(0);

  await openOperationalActivity(page, { scenario: 'retained-refresh' });
  await expect(page.locator('[aria-busy="true"]')).not.toHaveCount(0);
  await expect(page.locator('wg-event-record')).toHaveCount(4);
  await expect(page.locator('tbody tr[data-record-key]')).toHaveCount(4);

  await openOperationalActivity(page, { scenario: 'filtered-empty' });
  await expect(page.getByText('No Intake events match the applied filters')).toBeVisible();
  await expect(page.getByText('No Delivery records match the applied filters')).toBeVisible();

  await openOperationalActivity(page, {
    composition: 'focused',
    scenario: 'failed-request',
    selected: 'processing',
  });
  await expect(
    page.getByText('Pause rejected. Confirmed Processing intake remains open. Retry is available.'),
  ).toBeVisible();

  await openOperationalActivity(page, { scenario: 'live-update' });
  await expect(page.locator('wg-event-record')).toHaveCount(5);
  await expect(page.locator('tbody tr[data-record-key]')).toHaveCount(5);
  await expect(page.locator('[data-announcement-owner]')).toBeEmpty();
});

test('keeps stale, unavailable, and recovered truth explicit without duplicate announcements', async ({
  page,
}) => {
  await openOperationalActivity(page, { scenario: 'stale-partial' });
  await expect(page.getByText('Partial.', { exact: true })).toHaveCount(2);
  await expect(
    page.getByText(/latest sample is stale and one source is unavailable/i),
  ).toBeVisible();
  await expect(
    page.locator('.wg-operational-feedback').filter({
      hasText: 'Delivery is partial. Three of four expected destinations reported.',
    }),
  ).toBeVisible();

  await openOperationalActivity(page, { scenario: 'unavailable' });
  await expect(page.locator('wg-offline-state')).toHaveCount(2);
  await expect(page.getByText(/last-confirmed records remain visible/i).first()).toBeVisible();

  await openOperationalActivity(page, { scenario: 'recovered' });
  await expect(page.getByText('Recovered.', { exact: true })).toHaveCount(3);
  await expect(page.locator('[aria-live]')).toHaveCount(1);
  await expect(page.locator('[data-announcement-owner]')).toBeEmpty();
});

test('preserves all three functions in the wall overview without creating a second composition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openOperationalActivity(page, {
    composition: 'overview',
    width: 'wall',
    density: 'comfortable',
  });
  await expect(page.locator('.wg-operational-overview')).toHaveCount(1);
  await expect(page.locator('.wg-operational-focused')).toHaveCount(0);
  for (const name of ['Intake', 'Processing', 'Delivery']) {
    await expect(page.getByRole('region', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('tablist')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test('contains phone and RTL layouts and has no automated accessibility violations', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openOperationalActivity(page, {
    composition: 'focused',
    width: 'phone',
    theme: 'wayglass-light',
    density: 'comfortable',
    direction: 'rtl',
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const controls = page.locator('button, input, select, [role="tab"]');
  const undersized = await controls.evaluateAll((elements) =>
    elements.flatMap((element) => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44)
        ? [
            {
              tag: element.tagName,
              label: element.getAttribute('aria-label'),
              width: box.width,
              height: box.height,
            },
          ]
        : [];
    }),
  );
  expect(undersized).toEqual([]);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('retains consequential state at 200 percent text with forced colors and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openOperationalActivity(page, {
    composition: 'focused',
    scenario: 'unavailable',
    selected: 'processing',
    width: 'phone',
    theme: 'wayglass-light',
    density: 'comfortable',
    direction: 'rtl',
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    document.querySelector<HTMLElement>('.wg-operational-viewport')!.style.filter = 'grayscale(1)';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

  await expect(page.getByRole('tab')).toHaveCount(3);
  await expect(page.locator('wg-tab[value="intake"]')).toContainText(
    'Unavailable · Last-confirmed records retained · Retry available',
  );
  await expect(page.getByRole('button', { name: 'Open Intake recovery' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    await page.locator('wg-tab[value="intake"]').evaluate((tab) => {
      const style = getComputedStyle(tab);
      return [style.animationDuration, style.transitionDuration];
    }),
  ).toEqual(['0s', '0s']);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('records the Chromium integrated construction and filter-mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The timing regression threshold is Chromium-specific.');
  const warmUpCount = 3;
  const iterationCount = 15;
  await openOperationalActivity(page, { width: 'wall' });

  for (let index = 0; index < warmUpCount; index += 1) {
    await page.reload();
    await page.waitForSelector('[data-operational-activity-root]');
  }

  const constructionDurations: number[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    await page.reload();
    await page.waitForSelector('[data-operational-activity-root]');
    constructionDurations.push(
      await page.evaluate(
        () =>
          (window as Window & { operationalActivityConstructionDuration?: number })
            .operationalActivityConstructionDuration ?? 0,
      ),
    );
  }

  const mutationRecord = await page.evaluate(async (iterations) => {
    const durations: number[] = [];
    const input = document.querySelector<HTMLInputElement>('#operational-intake-query')!;
    const apply = [...document.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent?.trim() === 'Apply Intake event filters',
    )!;
    const observer = PerformanceObserver.supportedEntryTypes.includes('longtask')
      ? new PerformanceObserver(() => undefined)
      : undefined;
    observer?.observe({ type: 'longtask', buffered: true });
    for (let index = 0; index < iterations; index += 1) {
      input.value = index % 2 === 0 ? 'Central' : '';
      const started = performance.now();
      apply.click();
      durations.push(performance.now() - started);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    const longTasks = observer?.takeRecords().map((entry) => entry.duration) ?? [];
    observer?.disconnect();
    return {
      durations,
      longTasks,
      rootCount: document.querySelectorAll('[data-operational-activity-root]').length,
      announcementOwnerCount: document.querySelectorAll('[data-announcement-owner]').length,
    };
  }, iterationCount);

  const median = (values: readonly number[]) => {
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  };
  const record = {
    warmUpCount,
    iterationCount,
    medianConstructionMs: median(constructionDurations),
    medianMutationMs: median(mutationRecord.durations),
    largestSynchronousMutationMs: Math.max(...mutationRecord.durations),
  };
  console.info(`[phase-3h-performance] ${JSON.stringify(record)}`);
  expect(record.medianConstructionMs).toBeLessThan(100);
  expect(record.medianMutationMs).toBeLessThan(100);
  expect(record.largestSynchronousMutationMs).toBeLessThan(100);
  expect(mutationRecord.longTasks.filter((duration) => duration >= 100)).toEqual([]);
  expect(mutationRecord.rootCount).toBe(1);
  expect(mutationRecord.announcementOwnerCount).toBe(1);
});
