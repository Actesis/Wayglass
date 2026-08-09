import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Fixture = 'workspace' | 'envelope' | 'stress';

async function openTelemetryData(
  page: import('@playwright/test').Page,
  options: {
    fixture?: Fixture;
    width?: 'phone' | 'desktop' | 'wall';
    theme?: 'wayglass-dark' | 'wayglass-light';
    density?: 'compact' | 'comfortable';
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    fixture: options.fixture ?? 'workspace',
    width: options.width ?? 'desktop',
    theme: options.theme ?? 'wayglass-dark',
    density: options.density ?? 'compact',
  });
  await page.goto(`/tests/browser/telemetry-data/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-telemetry-strip') !== undefined &&
      document.querySelector('wg-telemetry-strip')?.shadowRoot !== null,
  );
}

test('renders the six production telemetry states from property-only samples', async ({ page }) => {
  await openTelemetryData(page, { fixture: 'envelope' });
  await expect(page.locator('.wg-telemetry-workspace > wg-telemetry-strip')).toHaveCount(6);
  for (const label of [
    'Processing throughput',
    'Queue depth',
    'Remote observations',
    'Response duration',
    'External capacity',
    'Transfer rate',
  ]) {
    await expect(page.getByRole('group', { name: label, exact: true })).toBeVisible();
  }
  await expect(page.locator('wg-telemetry-strip[samples]')).toHaveCount(0);
  expect(await page.locator('wg-telemetry-strip').first().getAttribute('samples')).toBeNull();
  expect(
    await page.locator('#telemetry-steady').evaluate((element) => {
      const strip = element as HTMLElement & { samples: readonly unknown[] };
      return strip.samples.length;
    }),
  ).toBe(12);
});

test('preserves authored gaps, knowledge, and independent strip state', async ({ page }) => {
  await openTelemetryData(page, { fixture: 'envelope' });
  await expect(page.locator('#telemetry-changing')).toContainText('Caution');
  await expect(page.locator('#telemetry-changing')).toContainText('Four observations are inferred');
  await expect(page.locator('#telemetry-stale')).toContainText('Data stale');
  await expect(page.locator('#telemetry-unavailable')).toContainText('Unavailable');
  await expect(page.locator('#telemetry-updating')).toContainText('Pending');
  await expect(page.locator('#telemetry-steady')).not.toContainText('Positive');

  const geometry = await page.locator('#telemetry-sparse').evaluate((element) => ({
    paths: element.shadowRoot!.querySelectorAll('path').length,
    gaps: element.shadowRoot!.querySelectorAll('[data-gap]').length,
  }));
  expect(geometry.paths).toBeGreaterThan(0);
  expect(geometry.gaps).toBe(3);
  expect(
    await page
      .locator('#telemetry-unavailable')
      .evaluate((element) => element.shadowRoot!.querySelectorAll('path').length),
  ).toBe(0);
});

test('replaces the live sample batch without emitting events or moving focus', async ({ page }) => {
  await openTelemetryData(page);
  const action = page.getByRole('button', { name: 'Apply next authored sample batch' });
  await action.focus();
  const before = await page
    .locator('#telemetry-updating')
    .evaluate((element) => element.shadowRoot!.querySelector('path')!.getAttribute('d'));
  await page.locator('#telemetry-updating').evaluate((element) => {
    let events = 0;
    const count = () => {
      events += 1;
      element.dataset.eventCount = String(events);
    };
    element.addEventListener('input', count);
    element.addEventListener('change', count);
  });
  await action.press('Enter');
  await expect(action).toBeFocused();
  await expect(page.locator('#telemetry-updating')).toContainText(
    'Latest confirmed observation: 76%',
  );
  await expect(page.locator('#telemetry-updating')).toContainText(
    'The next application-owned batch replaced the history.',
  );
  expect(
    await page
      .locator('#telemetry-updating')
      .evaluate((element) => element.shadowRoot!.querySelector('path')!.getAttribute('d')),
  ).not.toBe(before);
  await expect(page.locator('#telemetry-updating')).not.toHaveAttribute('data-event-count');
});

test('reflows telemetry compositions for phone, desktop, and wall widths', async ({ page }) => {
  const columnCounts: number[] = [];
  for (const width of ['phone', 'desktop', 'wall'] as const) {
    await openTelemetryData(page, { fixture: 'envelope', width });
    columnCounts.push(
      await page
        .locator('.wg-telemetry-workspace > wg-telemetry-strip')
        .evaluateAll(
          (strips) => new Set(strips.map((strip) => strip.getBoundingClientRect().left)).size,
        ),
    );
  }
  expect(columnCounts).toEqual([1, 2, 3]);
});

test('contains the six-strip envelope at 320 pixels and 200 percent text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openTelemetryData(page, { fixture: 'envelope', width: 'phone' });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await expect(page.getByText(/The source supplied no numeric observations/)).toBeVisible();
});

test('maps density spacing without changing sample geometry', async ({ page }) => {
  const results: { gap: number; path: string }[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openTelemetryData(page, { density });
    results.push(
      await page.locator('#telemetry-steady').evaluate((element) => ({
        gap: Number.parseFloat(
          getComputedStyle(element.shadowRoot!.querySelector('[part="base"]')!).gap,
        ),
        path: element.shadowRoot!.querySelector('path')!.getAttribute('d')!,
      })),
    );
  }
  expect(results[1]!.gap).toBeGreaterThan(results[0]!.gap);
  expect(results[1]!.path).toBe(results[0]!.path);
});

test('replaces twelve 120-sample strips by the next frame while retaining focus', async ({
  page,
  browserName,
}) => {
  await openTelemetryData(page, { fixture: 'stress', width: 'wall' });
  const strips = page.locator('.wg-telemetry-workspace > wg-telemetry-strip');
  await expect(strips).toHaveCount(12);
  expect(
    await strips.evaluateAll((elements) =>
      elements.map(
        (element) => (element as HTMLElement & { samples: readonly unknown[] }).samples.length,
      ),
    ),
  ).toEqual(Array.from({ length: 12 }, () => 120));

  const action = page.getByRole('button', { name: 'Apply next authored sample batch' });
  await action.focus();
  const result = await strips.evaluateAll(async (elements) => {
    const started = performance.now();
    const completions = elements.map((element) => {
      const strip = element as HTMLElement & {
        samples: readonly { observedAt: number; value: number | null; knowledge?: string }[];
        updateComplete: Promise<boolean>;
      };
      strip.samples = strip.samples.map((sample) => ({
        ...sample,
        value: sample.value === null ? null : Math.min(100, sample.value + 1),
      }));
      return strip.updateComplete;
    });
    const synchronousDuration = performance.now() - started;
    await Promise.all(completions);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    return {
      synchronousDuration,
      focused: document.activeElement?.textContent?.includes('Apply next authored sample batch'),
      marks: elements.reduce(
        (count, element) => count + element.shadowRoot!.querySelectorAll('path, [data-gap]').length,
        0,
      ),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(result.focused).toBe(true);
  expect(result.marks).toBeGreaterThan(12);
  expect(result.overflow).toBeLessThanOrEqual(1);
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('records the Chromium twelve-by-120 construction and mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The timing regression threshold is Chromium-specific.');
  const warmUpCount = 3;
  const iterationCount = 15;
  await openTelemetryData(page, { fixture: 'stress', width: 'wall' });

  for (let index = 0; index < warmUpCount; index += 1) {
    await page.reload();
    await page.waitForSelector('.wg-telemetry-workspace > wg-telemetry-strip');
  }

  const constructionDurations: number[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    await page.reload();
    await page.waitForSelector('.wg-telemetry-workspace > wg-telemetry-strip');
    constructionDurations.push(
      await page.evaluate(
        () =>
          (window as Window & { telemetryConstructionDuration?: number })
            .telemetryConstructionDuration ?? 0,
      ),
    );
  }

  const mutationDurations = await page
    .locator('.wg-telemetry-workspace')
    .evaluate(async (workspace, iterations) => {
      const strips = Array.from(workspace.querySelectorAll('wg-telemetry-strip')) as Array<
        HTMLElement & {
          samples: readonly { observedAt: number; value: number | null; knowledge?: string }[];
          updateComplete: Promise<boolean>;
        }
      >;
      const durations: number[] = [];
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        const started = performance.now();
        const completions = strips.map((strip) => {
          strip.samples = strip.samples.map((sample) => ({
            ...sample,
            value:
              sample.value === null
                ? null
                : Math.min(100, sample.value + (iteration % 2 === 0 ? 1 : -1)),
          }));
          return strip.updateComplete;
        });
        durations.push(performance.now() - started);
        await Promise.all(completions);
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
    stripCount: 12,
    samplesPerStrip: 120,
    medianConstructionMs: median(constructionDurations),
    medianMutationMs: median(mutationDurations),
    largestSynchronousMutationMs: Math.max(...mutationDurations),
  };
  console.info(`[phase-3c-performance] ${JSON.stringify(record)}`);
  expect(record.medianConstructionMs).toBeLessThan(100);
  expect(record.medianMutationMs).toBeLessThan(100);
  expect(record.largestSynchronousMutationMs).toBeLessThan(100);
});

test('retains non-color knowledge patterns in forced colors and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openTelemetryData(page, { fixture: 'envelope' });
  const patterns = await page.locator('.wg-telemetry-workspace').evaluate((workspace) =>
    Array.from(workspace.querySelectorAll('wg-telemetry-strip')).reduce<Record<string, string>>(
      (result, strip) => {
        for (const mark of strip.shadowRoot!.querySelectorAll<SVGElement>('[data-knowledge]')) {
          const knowledge = mark.dataset.knowledge!;
          result[knowledge] ||= getComputedStyle(mark).strokeDasharray;
        }
        return result;
      },
      {},
    ),
  );
  expect(patterns.confirmed).not.toBe(patterns.inferred);
  expect(patterns.stale).not.toBe(patterns.unavailable);
  expect(patterns.unknown).not.toBe(patterns.unavailable);
  expect(
    await page
      .locator('#telemetry-steady')
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe('0s');
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes telemetry accessibility checks in ${theme}`, async ({ page }) => {
    await openTelemetryData(page, { fixture: 'envelope', theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
  });
}
