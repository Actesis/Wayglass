import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openTimeline(page: import('@playwright/test').Page, query = ''): Promise<void> {
  await page.goto(`/tests/browser/timeline/${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-timeline') !== undefined &&
      document.querySelector('wg-timeline')?.shadowRoot !== null,
  );
}

test('keeps timeline imports side-effect free with useful fallback text', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const timeline = document.createElement('wg-timeline');
    timeline.innerHTML = '<wg-timeline-item>Fallback milestone summary</wg-timeline-item>';
    document.body.append(timeline);
    await Promise.all([
      import('/packages/elements/dist/timeline.js'),
      import('/packages/elements/dist/timeline-item.js'),
    ]);
    return {
      registrations: ['wg-timeline', 'wg-timeline-item'].map(
        (name) => customElements.get(name) !== undefined,
      ),
      text: timeline.textContent?.trim(),
      visible: timeline.getBoundingClientRect().height > 0,
    };
  });
  expect(result).toEqual({
    registrations: [false, false],
    text: 'Fallback milestone summary',
    visible: true,
  });
});

test('preserves authored temporal content before explicit registration', async ({ page }) => {
  await page.goto('/tests/browser/timeline/?upgrade=false');
  expect(await page.evaluate(() => customElements.get('wg-timeline'))).toBeUndefined();
  expect(await page.evaluate(() => customElements.get('wg-timeline-item'))).toBeUndefined();
  await expect(page.getByRole('heading', { name: 'Processing milestones' })).toBeVisible();
  await expect(page.getByText('Started at 9:18 AM')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect manual review' })).toBeVisible();
  await expect(page.getByText('Review context')).toBeVisible();
});

test('exposes named ordered content, chronology, busy state, and quiet native actions', async ({
  page,
}) => {
  await openTimeline(page);
  await expect(page.getByRole('list', { name: 'Processing milestones' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Recent milestones' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(4);
  await expect(page.getByText('Oldest to newest', { exact: true })).toBeVisible();
  await expect(page.getByText('Newest to oldest', { exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Processing milestones' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(page.locator('#review-item')).toHaveAttribute('role', 'listitem');
  await expect(page.locator('#review-item')).not.toHaveAttribute('tabindex');
  await expect(page.getByRole('button', { name: 'Inspect manual review' })).toBeEnabled();
  await expect(
    page.locator('[aria-live], [role="log"], [role="status"], [role="alert"]'),
  ).toHaveCount(0);
});

test('keeps milestone kind and known-state axes independent with native disclosure', async ({
  page,
}) => {
  await openTimeline(page);
  const review = page.locator('#review-item');
  await expect(review).toHaveAttribute('kind', 'interval');
  await expect(review.getByText('Caution', { exact: true })).toBeVisible();
  await expect(review.getByText('Data stale', { exact: true })).toBeVisible();
  await expect(review.getByText('Pending', { exact: true })).toBeVisible();
  await expect(review.getByText('Ongoing', { exact: true })).toBeVisible();
  await expect(review.locator('[part="sequence"]')).toHaveAttribute('aria-hidden', 'true');
  await expect(review.locator('[part="signal"]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#route-item [part="sequence"]')).toHaveCSS('display', 'none');
  await page.getByText('Review context', { exact: true }).click();
  await expect(page.getByText('Two authored checks remain')).toBeVisible();
});

test('covers every state value, intervals, long content, and optional actions in the envelope', async ({
  page,
}) => {
  await openTimeline(page, '?fixture=envelope');
  const coverage = await page.locator('#timeline-envelope').evaluate((timeline) => ({
    conditions: new Set(
      Array.from(timeline.querySelectorAll('wg-timeline-item')).map((item) =>
        item.getAttribute('condition'),
      ),
    ).size,
    knowledge: new Set(
      Array.from(timeline.querySelectorAll('wg-timeline-item')).map((item) =>
        item.getAttribute('knowledge'),
      ),
    ).size,
    pending: timeline.querySelectorAll('wg-timeline-item[activity="pending"]').length,
    intervals: timeline.querySelectorAll('wg-timeline-item[kind="interval"]').length,
    endTimes: timeline.querySelectorAll('[slot="end-time"]').length,
    actions: timeline.querySelectorAll('[slot="actions"]').length,
  }));
  expect(coverage.conditions).toBe(5);
  expect(coverage.knowledge).toBe(6);
  expect(coverage.pending).toBeGreaterThan(0);
  expect(coverage.intervals).toBe(coverage.endTimes);
  expect(coverage.actions).toBe(10);
  await expect(page.getByText(/معالجة إقليمية/)).toBeVisible();
});

test('normalizes invalid chronology, kind, and state attributes without emitting intent events', async ({
  page,
}) => {
  await openTimeline(page);
  const result = await page.locator('#processing-timeline').evaluate(async (timeline) => {
    const item = timeline.querySelector('wg-timeline-item')!;
    let events = 0;
    timeline.addEventListener('change', () => (events += 1));
    timeline.addEventListener('input', () => (events += 1));
    timeline.setAttribute('chronology', 'reverse');
    item.setAttribute('kind', 'period');
    item.setAttribute('condition', 'good');
    item.setAttribute('knowledge', 'maybe');
    item.setAttribute('activity', 'working');
    await Promise.all(
      [timeline, item].map(
        (element) => (element as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete,
      ),
    );
    return {
      chronology: timeline.getAttribute('chronology'),
      kind: item.getAttribute('kind'),
      condition: item.getAttribute('condition'),
      knowledge: item.getAttribute('knowledge'),
      activity: item.getAttribute('activity'),
      events,
    };
  });
  expect(result).toEqual({
    chronology: 'ascending',
    kind: 'milestone',
    condition: 'neutral',
    knowledge: 'confirmed',
    activity: 'idle',
    events: 0,
  });
});

test('preserves unsupported authored content and reports one stable diagnostic', async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  await openTimeline(page);
  await page.locator('#processing-timeline').evaluate(async (timeline) => {
    const unsupported = document.createElement('article');
    unsupported.textContent = 'Application-authored unsupported timeline content';
    timeline.append(unsupported);
    const element = timeline as HTMLElement & {
      requestUpdate(): void;
      updateComplete: Promise<boolean>;
    };
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;
  });
  await expect(page.getByText('Application-authored unsupported timeline content')).toBeVisible();
  expect(warnings.filter((warning) => warning.includes('[wg-timeline]'))).toHaveLength(1);
});

test('updates and inserts within 100 stable items without taking focus or following the new item', async ({
  page,
  browserName,
}) => {
  await openTimeline(page, '?fixture=envelope');
  await expect(page.locator('#timeline-envelope > wg-timeline-item')).toHaveCount(100);
  await page.locator('#timeline-action-050').focus();

  const result = await page.locator('#timeline-envelope').evaluate(async (timeline) => {
    const focusedItem = timeline.querySelector<HTMLElement>('#timeline-item-050')!;
    const focusedReference = focusedItem;
    const createItem = (id: string, label: string, dateTime: string, timeText: string) => {
      const item = document.createElement('wg-timeline-item');
      item.id = id;
      item.setAttribute('label', label);
      const time = document.createElement('time');
      time.slot = 'time';
      time.dateTime = dateTime;
      time.textContent = timeText;
      item.append(time);
      return item;
    };
    const insertedOldest = createItem(
      'new-oldest-milestone',
      'New oldest milestone',
      '2026-08-09T07:59:00-07:00',
      'Occurred at 7:59',
    );
    const insertedNewest = createItem(
      'new-newest-milestone',
      'New newest milestone',
      '2026-08-09T10:00:00-07:00',
      'Occurred at 10:00',
    );

    let events = 0;
    let scrollIntoViewCalls = 0;
    timeline.addEventListener('change', () => (events += 1));
    timeline.addEventListener('input', () => (events += 1));
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(
      options?: boolean | ScrollIntoViewOptions,
    ): void {
      scrollIntoViewCalls += 1;
      originalScrollIntoView.call(this, options);
    };
    const started = performance.now();
    timeline.insertBefore(insertedOldest, timeline.querySelector('wg-timeline-item'));
    timeline.append(insertedNewest);
    focusedItem.setAttribute('condition', 'critical');
    focusedItem.setAttribute('knowledge', 'conflicting');
    const synchronousDuration = performance.now() - started;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    Element.prototype.scrollIntoView = originalScrollIntoView;

    return {
      synchronousDuration,
      focused: document.activeElement?.id,
      sameNode: timeline.querySelector('#timeline-item-050') === focusedReference,
      count: timeline.querySelectorAll('wg-timeline-item').length,
      first: timeline.querySelector('wg-timeline-item')?.id,
      last: timeline.querySelector('wg-timeline-item:last-of-type')?.id,
      scrollIntoViewCalls,
      events,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(result.focused).toBe('timeline-action-050');
  expect(result.sameNode).toBe(true);
  expect(result.count).toBe(102);
  expect(result.first).toBe('new-oldest-milestone');
  expect(result.last).toBe('new-newest-milestone');
  expect(result.scrollIntoViewCalls).toBe(0);
  expect(result.events).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('records the Chromium 100-item construction and mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The timing regression threshold is Chromium-specific.');
  const warmUpCount = 3;
  const iterationCount = 15;
  await openTimeline(page, '?fixture=envelope');

  for (let index = 0; index < warmUpCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#timeline-envelope');
  }

  const constructionDurations: number[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#timeline-envelope');
    constructionDurations.push(
      await page.evaluate(
        () =>
          (window as Window & { timelineConstructionDuration?: number })
            .timelineConstructionDuration ?? 0,
      ),
    );
  }

  const mutationDurations = await page
    .locator('#timeline-envelope')
    .evaluate(async (timeline, iterations) => {
      const items = Array.from(timeline.querySelectorAll('wg-timeline-item')) as Array<
        HTMLElement & { updateComplete: Promise<boolean> }
      >;
      const durations: number[] = [];
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        const started = performance.now();
        items.forEach((item, index) => {
          item.setAttribute('condition', (index + iteration) % 2 === 0 ? 'positive' : 'caution');
          item.setAttribute('knowledge', (index + iteration) % 3 === 0 ? 'stale' : 'confirmed');
        });
        const first = timeline.querySelector('wg-timeline-item');
        if (first) timeline.append(first);
        durations.push(performance.now() - started);
        await Promise.all(items.map((item) => item.updateComplete));
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
    itemCount: 100,
    medianConstructionMs: median(constructionDurations),
    medianMutationMs: median(mutationDurations),
    largestSynchronousMutationMs: Math.max(...mutationDurations),
  };
  console.info(`[phase-3e-timeline-performance] ${JSON.stringify(record)}`);
  expect(record.medianConstructionMs).toBeLessThan(100);
  expect(record.medianMutationMs).toBeLessThan(100);
  expect(record.largestSynchronousMutationMs).toBeLessThan(100);
});

test('maps density and supports narrow RTL reflow, forced colors, and reduced motion', async ({
  page,
}) => {
  const gaps: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openTimeline(page, `?density=${density}`);
    gaps.push(
      await page
        .locator('#processing-timeline')
        .locator('[part="base"]')
        .first()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).gap)),
    );
  }
  expect(gaps[1]).toBeGreaterThan(gaps[0]!);

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await openTimeline(page, '?theme=wayglass-light&density=comfortable&dir=rtl');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    document.querySelector('main')!.style.filter = 'grayscale(1)';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await expect(page.getByText('Caution', { exact: true })).toBeVisible();
  await expect(page.getByText('Data stale', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect manual review' })).toBeVisible();
  const narrowActionOrder = await page
    .getByRole('button', { name: 'Inspect manual review' })
    .evaluate((button) => {
      const root = button.getRootNode();
      const control = root instanceof ShadowRoot ? root.host : button;
      const item = control.closest('wg-timeline-item')!;
      const content = item.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;
      const actions = item.shadowRoot!.querySelector<HTMLElement>('[part="actions"]')!;
      return {
        contentBottom: content.getBoundingClientRect().bottom,
        actionsTop: actions.getBoundingClientRect().top,
      };
    });
  expect(narrowActionOrder.actionsTop).toBeGreaterThanOrEqual(narrowActionOrder.contentBottom);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes timeline accessibility checks in ${theme}`, async ({ page }) => {
    await openTimeline(page, `?fixture=envelope&theme=${theme}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await expect(
      page.locator('[aria-live], [role="log"], [role="status"], [role="alert"]'),
    ).toHaveCount(0);
  });
}

test('has no automatically detectable accessibility violations', async ({ page }) => {
  await openTimeline(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
