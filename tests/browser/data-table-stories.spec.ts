import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Fixture = 'workspace' | 'states' | 'envelope' | 'validation';

async function openDataTableStory(
  page: import('@playwright/test').Page,
  options: {
    fixture?: Fixture;
    width?: 'phone' | 'desktop' | 'wall';
    theme?: 'wayglass-dark' | 'wayglass-light';
    density?: 'compact' | 'comfortable';
    direction?: 'ltr' | 'rtl';
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    fixture: options.fixture ?? 'workspace',
    width: options.width ?? 'desktop',
    theme: options.theme ?? 'wayglass-dark',
    density: options.density ?? 'compact',
    direction: options.direction ?? 'ltr',
  });
  await page.goto(`/tests/browser/data-table-stories/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-data-table') !== undefined &&
      customElements.get('wg-scroll-region') !== undefined &&
      document.querySelector('wg-data-table')?.shadowRoot !== null,
  );
}

test('renders one native semantic table with authored state axes and row actions', async ({
  page,
}) => {
  await openDataTableStory(page);
  await expect(page.getByRole('table', { name: 'Operational review records' })).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(5);
  await expect(page.getByRole('rowheader', { name: /Regional evidence review/ })).toBeVisible();
  await expect(page.getByText('Caution', { exact: true })).toBeVisible();
  await expect(page.getByText('Confirmed', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Idle', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('grid')).toHaveCount(0);
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

test('keeps sorting authored, preserves header focus, and reorders existing rows', async ({
  page,
}) => {
  await openDataTableStory(page);
  const firstRow = page.locator('#operational-review-table tbody tr').first();
  await firstRow.evaluate((row) => {
    (window as Window & { retainedFirstTableRow?: Element }).retainedFirstTableRow = row;
  });
  const sort = page.getByRole('button', { name: 'Updated, newest first' });
  await sort.focus();
  await sort.press('Enter');
  await expect(page.getByRole('button', { name: 'Updated, oldest first' })).toBeFocused();
  await expect(page.locator('#operational-review-table th[aria-sort]')).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
  await expect(page.locator('#operational-review-table tbody tr').first()).toHaveAttribute(
    'data-record-id',
    'WG-1854',
  );
  expect(
    await page
      .locator('#operational-review-table tbody tr')
      .last()
      .evaluate(
        (row) =>
          row === (window as Window & { retainedFirstTableRow?: Element }).retainedFirstTableRow,
      ),
  ).toBe(true);
  await expect(page.getByText('4 records shown; sorted by oldest update.')).toBeVisible();
});

test('uses the accepted confirmation pattern for a consequential table action', async ({
  page,
}) => {
  await openDataTableStory(page);
  const remove = page.getByRole('button', { name: 'Remove authorization review WG-1854' });
  await remove.click();
  await expect(
    page.getByRole('dialog', { name: 'Remove authorization review WG-1854?' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep record' })).toBeFocused();
  await page.getByRole('button', { name: 'Keep record' }).click();
  await expect(remove).toBeFocused();
});

test('keeps loading, empty, retained stale, and unavailable states outside data rows', async ({
  page,
}) => {
  await openDataTableStory(page, { fixture: 'states', theme: 'wayglass-light' });
  await expect(page.getByText('Loading assignment records', { exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Matching review records' })).toBeVisible();
  await expect(page.locator('#data-table-empty tbody tr')).toHaveCount(0);
  await expect(page.getByText('No matching records')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Retained delivery records' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(page.getByText('Stale · last confirmed 12 minutes ago')).toBeVisible();
  await expect(page.getByText('External capacity records unavailable')).toBeVisible();
  await expect(page.getByText('2 of 4 expected records are available.')).toBeVisible();
  await expect(page.getByText('Review records could not be loaded')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry review records' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Recovered review records' })).toBeVisible();
  await expect(page.getByText('Recovery completed.')).toBeVisible();
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

test('replaces twenty rows while retaining unaffected nodes and action focus', async ({ page }) => {
  await openDataTableStory(page, { fixture: 'envelope' });
  const rows = page.locator('#data-table-envelope tbody tr');
  await expect(rows).toHaveCount(25);
  await rows.first().evaluate((row) => {
    (window as Window & { retainedEnvelopeRow?: Element }).retainedEnvelopeRow = row;
  });
  const action = page.getByRole('button', { name: 'Apply next 20-record batch' });
  await action.focus();
  await action.press('Enter');
  await expect(action).toBeFocused();
  await expect(rows).toHaveCount(25);
  await expect(rows.nth(4)).toHaveAttribute('data-record-id', 'WG-105');
  await expect(rows.nth(5)).toHaveAttribute('data-record-id', 'WG-206');
  expect(
    await rows
      .first()
      .evaluate(
        (row) => row === (window as Window & { retainedEnvelopeRow?: Element }).retainedEnvelopeRow,
      ),
  ).toBe(true);
  await expect(
    page.getByText(
      '20 application-owned rows replaced; five retained rows and focus remained stable.',
    ),
  ).toBeVisible();
});

test('contains the wide table at 320 pixels and preserves the authored sticky header', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openDataTableStory(page, {
    fixture: 'envelope',
    width: 'phone',
    direction: 'rtl',
  });
  const region = page.locator('#data-table-envelope wg-scroll-region');
  await expect(region).toHaveAttribute('data-overflowing');
  await expect(region).toHaveAttribute('role', 'region');
  await expect(region).toHaveAttribute('aria-label', 'Wide operational reference table');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    await page
      .locator('#data-table-envelope thead th')
      .first()
      .evaluate((header) => getComputedStyle(header).position),
  ).toBe('sticky');
  await expect(page.getByRole('columnheader', { name: 'Record' })).toBeVisible();
});

test('renders the 200-row by 20-column native validation envelope with explicit relationships', async ({
  page,
}) => {
  await openDataTableStory(page, { fixture: 'validation', width: 'wall' });
  const table = page.getByRole('table', {
    name: 'Data-table performance and relationship validation envelope',
  });
  await expect(table).toBeVisible();
  await expect(page.locator('#data-table-validation tbody tr')).toHaveCount(200);
  await expect(page.locator('#data-table-validation tbody :is(th, td)')).toHaveCount(4000);
  await expect(page.locator('#data-table-validation thead th[scope="colgroup"]')).toHaveCount(6);
  await expect(page.locator('#data-table-validation thead th[scope="col"]')).toHaveCount(20);
  await expect(page.locator('#data-table-validation tbody th[scope="row"]')).toHaveCount(200);
  await expect(
    page.locator('#data-table-validation tbody tr').nth(99).locator('td').nth(16),
  ).toHaveAttribute(
    'headers',
    'validation-row-0100 validation-group-outcome validation-col-evidence',
  );
  await expect(page.getByRole('button', { name: 'Inspect validation record 0100' })).toBeAttached();
  await expect(page.locator('#data-table-validation [role="grid"], [aria-live]')).toHaveCount(0);
});

test('replaces twenty validation rows by the next frame without focus, identity, or event loss', async ({
  page,
  browserName,
}) => {
  await openDataTableStory(page, { fixture: 'validation', width: 'wall' });
  const focusedAction = page.getByRole('button', { name: 'Inspect validation record 0100' });
  await focusedAction.focus();
  const result = await page.locator('#data-table-validation').evaluate(async (dataTable) => {
    const observer = PerformanceObserver.supportedEntryTypes.includes('longtask')
      ? new PerformanceObserver(() => undefined)
      : undefined;
    observer?.observe({ type: 'longtask', buffered: true });
    const retainedRow = dataTable.querySelector('[data-record-id="WG-V1-0100"]');
    const table = dataTable.querySelector('table');
    const region = dataTable.querySelector('wg-scroll-region');
    let events = 0;
    dataTable.addEventListener('input', () => (events += 1));
    dataTable.addEventListener('change', () => (events += 1));
    const started = performance.now();
    document.querySelector<HTMLElement>('#replace-validation-rows')!.click();
    const synchronousDuration = performance.now() - started;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const longTasks = observer?.takeRecords().map((entry) => entry.duration) ?? [];
    observer?.disconnect();
    return {
      synchronousDuration,
      longTasks,
      focusedText: document.activeElement?.textContent?.trim(),
      sameRow: dataTable.querySelector('[data-record-id="WG-V1-0100"]') === retainedRow,
      sameTable: dataTable.querySelector('table') === table,
      sameRegion: dataTable.querySelector('wg-scroll-region') === region,
      rowCount: dataTable.querySelectorAll('tbody tr').length,
      firstReplacement: dataTable.querySelectorAll('tbody tr')[180]?.getAttribute('data-record-id'),
      finalReplacement: dataTable.querySelectorAll('tbody tr')[199]?.getAttribute('data-record-id'),
      explicitHeaders: dataTable
        .querySelectorAll('tbody tr')[199]
        ?.querySelectorAll('td')[16]
        ?.getAttribute('headers'),
      events,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(result.focusedText).toBe('Inspect validation record 0100');
  expect(result.sameRow).toBe(true);
  expect(result.sameTable).toBe(true);
  expect(result.sameRegion).toBe(true);
  expect(result.rowCount).toBe(200);
  expect(result.firstReplacement).toBe('WG-V2-0181');
  expect(result.finalReplacement).toBe('WG-V2-0200');
  expect(result.explicitHeaders).toBe(
    'validation-row-0200 validation-group-outcome validation-col-evidence',
  );
  expect(result.events).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
  expect(result.longTasks.filter((duration) => duration >= 100)).toEqual([]);
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('records the Chromium 200-by-20 construction and twenty-row mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The timing regression threshold is Chromium-specific.');
  const warmUpCount = 3;
  const iterationCount = 15;
  await openDataTableStory(page, { fixture: 'validation', width: 'wall' });

  for (let index = 0; index < warmUpCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#data-table-validation tbody tr:nth-child(200)');
  }

  const constructionDurations: number[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#data-table-validation tbody tr:nth-child(200)');
    constructionDurations.push(
      await page.evaluate(
        () =>
          (window as Window & { dataTableConstructionDuration?: number })
            .dataTableConstructionDuration ?? 0,
      ),
    );
  }

  const mutationDurations = await page
    .locator('#data-table-validation')
    .evaluate(async (dataTable, iterations) => {
      const durations: number[] = [];
      const replace = document.querySelector<HTMLElement>('#replace-validation-rows')!;
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        const started = performance.now();
        replace.click();
        durations.push(performance.now() - started);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (dataTable.querySelectorAll('tbody tr').length !== 200) throw new Error('row drift');
      }
      return durations;
    }, iterationCount);

  const median = (values: readonly number[]) => {
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  };
  const record = {
    warmUpCount,
    iterationCount,
    medianConstructionMs: median(constructionDurations),
    medianMutationMs: median(mutationDurations),
    largestSynchronousMutationMs: Math.max(...mutationDurations),
  };
  console.info(`[phase-3g-performance] ${JSON.stringify(record)}`);
  expect(record.medianConstructionMs).toBeLessThan(100);
  expect(record.medianMutationMs).toBeLessThan(100);
  expect(record.largestSynchronousMutationMs).toBeLessThan(100);
});

test('preserves the validation envelope at 320 pixels, 200 percent text, RTL, and adaptive media', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openDataTableStory(page, {
    fixture: 'validation',
    width: 'phone',
    direction: 'rtl',
    theme: 'wayglass-light',
    density: 'comfortable',
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    document.querySelector<HTMLElement>('.wg-data-table-viewport')!.style.filter = 'grayscale(1)';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const region = page.locator('#data-table-validation wg-scroll-region');
  await expect(region).toHaveAttribute('data-overflowing');
  await expect(region).toHaveAttribute('aria-label', 'Two-hundred-record validation table');
  await expect(page.getByText('200 records · 20 columns')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect validation record 0200' })).toBeAttached();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    await page
      .getByRole('button', { name: 'Inspect validation record 0100' })
      .evaluate((button) => button.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(44);
});

test('maps compact and comfortable validation density without changing relationships', async ({
  page,
}) => {
  const paddings: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openDataTableStory(page, { fixture: 'validation', density });
    const sample = page.locator('#data-table-validation tbody td').first();
    paddings.push(
      await sample.evaluate((cell) => Number.parseFloat(getComputedStyle(cell).paddingBlockStart)),
    );
    await expect(sample).toHaveAttribute(
      'headers',
      'validation-row-0001 validation-group-identity validation-col-reference',
    );
  }
  expect(paddings[1]).toBeGreaterThan(paddings[0]!);
});

for (const fixture of ['workspace', 'states', 'envelope', 'validation'] as const) {
  for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
    test(`${fixture} passes accessibility checks in ${theme}`, async ({ page }) => {
      await openDataTableStory(page, { fixture, theme });
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
