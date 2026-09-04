import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Fixture = 'workspace' | 'envelope';

async function openScalarData(
  page: import('@playwright/test').Page,
  options: {
    fixture?: Fixture;
    width?: 'phone' | 'desktop' | 'wall';
    theme?: 'wayglass-dark' | 'wayglass-light';
    density?: 'compact' | 'comfortable';
  } = {},
) {
  const parameters = new URLSearchParams({
    fixture: options.fixture ?? 'workspace',
    width: options.width ?? 'desktop',
    theme: options.theme ?? 'wayglass-dark',
    density: options.density ?? 'compact',
  });
  await page.goto(`/tests/browser/scalar-data/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-metric-group') !== undefined &&
      document.querySelector('wg-metric-group')?.shadowRoot !== null,
  );
}

test('renders the production scalar workspace with separate named functions', async ({ page }) => {
  await openScalarData(page);
  const groups = page.locator('.wg-scalar-workspace > wg-metric-group');
  await expect(groups).toHaveCount(3);
  await expect(page.getByRole('group', { name: 'Processing interval', exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Assignment context', exact: true })).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Transfer observations', exact: true }),
  ).toBeVisible();
  await expect(page.locator('time')).toHaveAttribute('datetime', '2026-08-08T19:24:00Z');
  await expect(page.locator('code')).toHaveText('WG-OPS-000184');
  await expect(
    page.locator('wg-metric-group[busy]').locator('[part="base"]').first(),
  ).toHaveAttribute('aria-busy', 'true');
});

test('covers the 24-value envelope in stable DOM and visual order', async ({ page }) => {
  await openScalarData(page, { fixture: 'envelope' });
  const values = page.locator('#scalar-envelope > wg-metric, #scalar-envelope > wg-key-value');
  await expect(values).toHaveCount(24);
  expect(await values.evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(
    Array.from({ length: 24 }, (_, index) => `scalar-${String(index + 1).padStart(2, '0')}`),
  );

  const positions = await values.evaluateAll((nodes) =>
    nodes.map((node) => {
      const bounds = node.getBoundingClientRect();
      return { left: bounds.left, top: bounds.top };
    }),
  );
  for (let index = 1; index < positions.length; index += 1) {
    const previous = positions[index - 1]!;
    const current = positions[index]!;
    expect(current.top > previous.top || current.left > previous.left).toBe(true);
  }
});

test('covers difficult values and keeps trend separate from state meaning', async ({ page }) => {
  await openScalarData(page, { fixture: 'envelope' });
  for (const text of ['−18.6', '0', '0.0047', '9,876,543', '1.234,56', '١٬٢٨٤', '12 345,7']) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
  for (const direction of ['Rising', 'Falling', 'Steady', 'Mixed', 'No direction']) {
    await expect(page.getByText(direction, { exact: true }).first()).toBeVisible();
  }
  await expect(page.locator('#scalar-02').locator('[part="trend"]')).toBeHidden();
  await expect(page.locator('#scalar-09')).toContainText('Rising');
  await expect(page.locator('#scalar-09')).not.toContainText('Caution');
  await expect(page.locator('#scalar-10')).toContainText('Falling');
  await expect(page.locator('#scalar-10')).toContainText('Positive');
  await expect(page.locator('#scalar-14')).toContainText('Data stale');
  await expect(page.locator('#scalar-22')).toContainText('Unavailable');
});

test('reflows workspace columns for phone, desktop, and wall compositions', async ({ page }) => {
  const columnCounts: number[] = [];
  for (const width of ['phone', 'desktop', 'wall'] as const) {
    await openScalarData(page, { width });
    columnCounts.push(
      await page
        .locator('.wg-scalar-workspace > wg-metric-group')
        .evaluateAll(
          (groups) => new Set(groups.map((group) => group.getBoundingClientRect().left)).size,
        ),
    );
  }
  expect(columnCounts).toEqual([1, 2, 3]);
});

test('reflows 24 values at 320 CSS pixels and 200 percent text without page overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openScalarData(page, { fixture: 'envelope', width: 'phone' });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
  const narrowOrder = await page.locator('#scalar-envelope').evaluate((group) => {
    const lastValue = group.querySelector<HTMLElement>(':scope > wg-key-value:last-of-type');
    const actions = group.shadowRoot?.querySelector<HTMLElement>('[part="actions"]');
    return {
      lastValueBottom: lastValue?.getBoundingClientRect().bottom ?? 0,
      actionsTop: actions?.getBoundingClientRect().top ?? 0,
    };
  });
  expect(narrowOrder.actionsTop).toBeGreaterThanOrEqual(narrowOrder.lastValueBottom);
  await expect(page.getByText('Regional coordination — western interval')).toBeVisible();
  await expect(page.getByText('2,4% gegenüber der Vorstunde')).toBeVisible();
});

test('preserves focus and next-frame readiness while updating and reordering 24 values', async ({
  page,
  browserName,
}) => {
  await openScalarData(page, { fixture: 'envelope' });
  await page.locator('#scalar-envelope-action').focus();
  const result = await page.locator('#scalar-envelope').evaluate(async (group) => {
    const observer = PerformanceObserver.supportedEntryTypes.includes('longtask')
      ? new PerformanceObserver(() => undefined)
      : undefined;
    observer?.observe({ type: 'longtask', buffered: true });
    const values = Array.from(group.querySelectorAll<HTMLElement>('wg-metric, wg-key-value'));
    const started = performance.now();
    values.forEach((value, index) => value.setAttribute('value', `Updated ${index + 1}`));
    const first = values[0];
    if (first) group.append(first);
    const synchronousDuration = performance.now() - started;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const longTasks = observer?.takeRecords().map((entry) => entry.duration) ?? [];
    observer?.disconnect();
    return {
      synchronousDuration,
      longTasks,
      focused: document.activeElement?.id === 'scalar-envelope-action',
      valueCount: group.querySelectorAll('wg-metric, wg-key-value').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(result.focused).toBe(true);
  expect(result.valueCount).toBe(24);
  expect(result.overflow).toBeLessThanOrEqual(1);
  expect(result.longTasks.filter((duration) => duration >= 100)).toEqual([]);
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('records the Chromium 24-value construction and mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The timing regression threshold is Chromium-specific.');
  const warmUpCount = 3;
  const iterationCount = 15;
  await openScalarData(page, { fixture: 'envelope' });

  for (let index = 0; index < warmUpCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#scalar-envelope');
  }

  const constructionDurations: number[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#scalar-envelope');
    constructionDurations.push(
      await page.evaluate(
        () =>
          (window as Window & { scalarConstructionDuration?: number }).scalarConstructionDuration ??
          0,
      ),
    );
  }

  const mutationDurations = await page
    .locator('#scalar-envelope')
    .evaluate(async (group, iterations) => {
      const values = Array.from(group.querySelectorAll<HTMLElement>('wg-metric, wg-key-value'));
      const durations: number[] = [];
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        const started = performance.now();
        values.forEach((value, index) =>
          value.setAttribute('value', `${iteration % 2 === 0 ? 'A' : 'B'}-${index + 1}`),
        );
        durations.push(performance.now() - started);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
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
  console.info(`[phase-3b-performance] ${JSON.stringify(record)}`);
  expect(record.medianConstructionMs).toBeLessThan(100);
  expect(record.medianMutationMs).toBeLessThan(100);
  expect(record.largestSynchronousMutationMs).toBeLessThan(100);
});

test('maps density spacing without changing data semantics', async ({ page }) => {
  const gaps: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openScalarData(page, { density });
    gaps.push(
      await page
        .locator('wg-metric-group')
        .first()
        .locator('[part="base"]')
        .first()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).gap)),
    );
  }
  expect(gaps[1]).toBeGreaterThan(gaps[0]!);
});

test('retains direction and state text in forced colors, reduced motion, and grayscale', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openScalarData(page, { fixture: 'envelope' });
  await page.locator('[data-scalar-width]').evaluate((element) => {
    (element as HTMLElement).style.filter = 'grayscale(1)';
  });
  const signal = page.locator('wg-trend-indicator[direction="rising"] [part="signal"]').first();
  await expect(signal).toBeVisible();
  expect(await signal.evaluate((element) => getComputedStyle(element).color)).not.toBe(
    'rgba(0, 0, 0, 0)',
  );
  await expect(page.getByText('Rising', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Positive', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Caution', { exact: true }).first()).toBeVisible();
  expect(
    await page
      .locator('wg-trend-indicator')
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe('0s');
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes scalar-data accessibility checks in ${theme}`, async ({ page }) => {
    await openScalarData(page, { fixture: 'envelope', theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    expect(await page.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0);
  });
}
