import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openEventLog(page: import('@playwright/test').Page, query = ''): Promise<void> {
  await page.goto(`/tests/browser/event-log/${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-event-log') !== undefined &&
      document.querySelector('wg-event-log')?.shadowRoot !== null,
  );
}

test('keeps event-log imports side-effect free with useful fallback text', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const log = document.createElement('wg-event-log');
    log.innerHTML = '<wg-event-record>Fallback event summary</wg-event-record>';
    document.body.append(log);
    await Promise.all([
      import('/packages/elements/dist/event-log.js'),
      import('/packages/elements/dist/event-record.js'),
    ]);
    return {
      registrations: ['wg-event-log', 'wg-event-record'].map(
        (name) => customElements.get(name) !== undefined,
      ),
      text: log.textContent?.trim(),
      visible: log.getBoundingClientRect().height > 0,
    };
  });
  expect(result).toEqual({
    registrations: [false, false],
    text: 'Fallback event summary',
    visible: true,
  });
});

test('preserves authored event fields before explicit registration', async ({ page }) => {
  await page.goto('/tests/browser/event-log/?upgrade=false');
  expect(await page.evaluate(() => customElements.get('wg-event-log'))).toBeUndefined();
  expect(await page.evaluate(() => customElements.get('wg-event-record'))).toBeUndefined();
  await expect(page.getByRole('heading', { name: 'Intake events' })).toBeVisible();
  await expect(page.getByText('Received 10:19 AM')).toBeVisible();
  await expect(page.getByText('Priority: Review')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect delayed source response' })).toBeVisible();
});

test('uses quiet named-list semantics with explicit chronology and authored unseen status', async ({
  page,
}) => {
  await openEventLog(page);
  await expect(page.getByRole('list', { name: 'Intake events' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Delivery events' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(4);
  await expect(
    page.getByText('Newest to oldest by occurrence time', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Oldest to newest by occurrence time', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('list', { name: 'Intake events' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(page.getByText('12 newer records are paused.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Jump to newest intake event' })).toBeEnabled();
  await expect(
    page.locator('[aria-live], [role="log"], [role="status"], [role="alert"]'),
  ).toHaveCount(0);
});

test('keeps occurrence state, receipt context, duplicate summaries, and native details distinct', async ({
  page,
}) => {
  await openEventLog(page);
  const delayed = page.locator('#delayed-record');
  await expect(delayed.getByText('Caution', { exact: true })).toBeVisible();
  await expect(delayed.getByText('Data stale', { exact: true })).toBeVisible();
  await expect(delayed.getByText('Pending', { exact: true })).toBeVisible();
  await expect(delayed.getByText('Received 10:19 AM', { exact: true })).toBeVisible();
  await expect(delayed.getByText('Source: North intake', { exact: true })).toBeVisible();
  await expect(delayed.locator('[part="signal"]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#duplicate-one [part="summary"]')).toHaveText(
    'Policy evaluation completed',
  );
  await expect(page.locator('#duplicate-two > [slot="summary"]')).toHaveText(
    'Policy evaluation completed',
  );
  await expect(page.locator('#duplicate-one')).not.toHaveAttribute('tabindex');
  await expect(page.locator('#duplicate-two')).not.toHaveAttribute('tabindex');
  await page.getByText('Inspect occurrence details', { exact: true }).click();
  await expect(page.getByText('The retained source response remains available')).toBeVisible();
});

test('covers every state value, dense optional fields, repeated summaries, and actions in the envelope', async ({
  page,
}) => {
  await openEventLog(page, '?fixture=envelope');
  const coverage = await page.locator('#event-envelope').evaluate((log) => ({
    conditions: new Set(
      Array.from(log.querySelectorAll('wg-event-record')).map((record) =>
        record.getAttribute('condition'),
      ),
    ).size,
    knowledge: new Set(
      Array.from(log.querySelectorAll('wg-event-record')).map((record) =>
        record.getAttribute('knowledge'),
      ),
    ).size,
    pending: log.querySelectorAll('wg-event-record[activity="pending"]').length,
    sources: log.querySelectorAll('[slot="source"]').length,
    categories: log.querySelectorAll('[slot="category"]').length,
    references: log.querySelectorAll('[slot="reference"]').length,
    receivedTimes: log.querySelectorAll('[slot="received-time"]').length,
    metadata: log.querySelectorAll('[slot="metadata"]').length,
    actions: log.querySelectorAll('[slot="actions"]').length,
    repeated: log.querySelectorAll('wg-event-record[label="Repeated visible event"]').length,
  }));
  expect(coverage.conditions).toBe(5);
  expect(coverage.knowledge).toBe(6);
  expect(coverage.pending).toBeGreaterThan(0);
  expect(coverage.sources).toBeGreaterThan(0);
  expect(coverage.categories).toBeGreaterThan(0);
  expect(coverage.references).toBeGreaterThan(0);
  expect(coverage.receivedTimes).toBeGreaterThan(0);
  expect(coverage.metadata).toBeGreaterThan(0);
  expect(coverage.actions).toBe(10);
  expect(coverage.repeated).toBeGreaterThan(1);
  await expect(page.getByText(/معالجة إقليمية/)).toBeVisible();
});

test('normalizes invalid chronology and state attributes without emitting intent events', async ({
  page,
}) => {
  await openEventLog(page);
  const result = await page.locator('#intake-log').evaluate(async (log) => {
    const record = log.querySelector('wg-event-record')!;
    let events = 0;
    log.addEventListener('change', () => (events += 1));
    log.addEventListener('input', () => (events += 1));
    log.setAttribute('chronology', 'reverse');
    record.setAttribute('condition', 'error');
    record.setAttribute('knowledge', 'maybe');
    record.setAttribute('activity', 'working');
    await Promise.all(
      [log, record].map(
        (element) => (element as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete,
      ),
    );
    return {
      chronology: log.getAttribute('chronology'),
      condition: record.getAttribute('condition'),
      knowledge: record.getAttribute('knowledge'),
      activity: record.getAttribute('activity'),
      events,
    };
  });
  expect(result).toEqual({
    chronology: 'ascending',
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
  await openEventLog(page);
  await page.locator('#intake-log').evaluate(async (log) => {
    const unsupported = document.createElement('article');
    unsupported.textContent = 'Application-authored unsupported event-log content';
    log.append(unsupported);
    const element = log as HTMLElement & {
      requestUpdate(): void;
      updateComplete: Promise<boolean>;
    };
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;
  });
  await expect(page.getByText('Application-authored unsupported event-log content')).toBeVisible();
  expect(warnings.filter((warning) => warning.includes('[wg-event-log]'))).toHaveLength(1);
});

test('inserts 50 records into the 500-record envelope without taking focus or forcing scroll', async ({
  page,
  browserName,
}) => {
  await openEventLog(page, '?fixture=envelope');
  await expect(page.locator('#event-envelope > wg-event-record')).toHaveCount(500);
  await page.locator('#event-action-250').focus();

  const result = await page.locator('#event-envelope').evaluate(async (log) => {
    const focusedRecord = log.querySelector<HTMLElement>('#event-record-250')!;
    const focusedReference = focusedRecord;
    const fragment = document.createDocumentFragment();
    for (let index = 1; index <= 50; index += 1) {
      const suffix = String(index).padStart(2, '0');
      const record = document.createElement('wg-event-record');
      record.id = `inserted-event-${suffix}`;
      record.setAttribute('label', `Inserted event ${suffix}`);
      const time = document.createElement('time');
      time.slot = 'time';
      time.dateTime = `2026-08-09T19:${suffix}:00-07:00`;
      time.textContent = `Occurred 19:${suffix}`;
      record.append(time);
      fragment.append(record);
    }

    let events = 0;
    let scrollIntoViewCalls = 0;
    log.addEventListener('change', () => (events += 1));
    log.addEventListener('input', () => (events += 1));
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(
      options?: boolean | ScrollIntoViewOptions,
    ): void {
      scrollIntoViewCalls += 1;
      originalScrollIntoView.call(this, options);
    };

    const started = performance.now();
    log.insertBefore(fragment, log.querySelector('wg-event-record'));
    focusedRecord.setAttribute('condition', 'critical');
    focusedRecord.setAttribute('knowledge', 'conflicting');
    const synchronousDuration = performance.now() - started;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    Element.prototype.scrollIntoView = originalScrollIntoView;

    return {
      synchronousDuration,
      focused: document.activeElement?.id,
      sameNode: log.querySelector('#event-record-250') === focusedReference,
      count: log.querySelectorAll('wg-event-record').length,
      first: log.querySelector('wg-event-record')?.id,
      scrollIntoViewCalls,
      events,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(result.focused).toBe('event-action-250');
  expect(result.sameNode).toBe(true);
  expect(result.count).toBe(550);
  expect(result.first).toBe('inserted-event-01');
  expect(result.scrollIntoViewCalls).toBe(0);
  expect(result.events).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('inserts 50 records away from the newest boundary without taking reading context', async ({
  page,
  browserName,
}) => {
  await openEventLog(page, '?fixture=envelope');
  await page.locator('#event-action-250').focus();
  const result = await page.locator('#event-envelope').evaluate(async (log) => {
    const focusedRecord = log.querySelector<HTMLElement>('#event-record-250')!;
    const focusedReference = focusedRecord;
    const fragment = document.createDocumentFragment();
    for (let index = 1; index <= 50; index += 1) {
      const suffix = String(index).padStart(2, '0');
      const record = document.createElement('wg-event-record');
      record.id = `older-inserted-event-${suffix}`;
      record.setAttribute('label', `Older inserted event ${suffix}`);
      const time = document.createElement('time');
      time.slot = 'time';
      time.dateTime = `2026-08-08T18:${suffix}:00-07:00`;
      time.textContent = `Older occurrence 18:${suffix}`;
      record.append(time);
      fragment.append(record);
    }

    let events = 0;
    let scrollIntoViewCalls = 0;
    log.addEventListener('change', () => (events += 1));
    log.addEventListener('input', () => (events += 1));
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(
      options?: boolean | ScrollIntoViewOptions,
    ): void {
      scrollIntoViewCalls += 1;
      originalScrollIntoView.call(this, options);
    };
    const started = performance.now();
    log.append(fragment);
    const synchronousDuration = performance.now() - started;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    Element.prototype.scrollIntoView = originalScrollIntoView;

    return {
      synchronousDuration,
      focused: document.activeElement?.id,
      sameNode: log.querySelector('#event-record-250') === focusedReference,
      count: log.querySelectorAll('wg-event-record').length,
      first: log.querySelector('wg-event-record')?.id,
      last: log.querySelector('wg-event-record:last-of-type')?.id,
      scrollIntoViewCalls,
      events,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(result.focused).toBe('event-action-250');
  expect(result.sameNode).toBe(true);
  expect(result.count).toBe(550);
  expect(result.first).toBe('event-record-001');
  expect(result.last).toBe('older-inserted-event-50');
  expect(result.scrollIntoViewCalls).toBe(0);
  expect(result.events).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('records the Chromium 500-record construction and mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The timing regression threshold is Chromium-specific.');
  const warmUpCount = 3;
  const iterationCount = 15;
  await openEventLog(page, '?fixture=envelope');

  for (let index = 0; index < warmUpCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#event-envelope');
  }

  const constructionDurations: number[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#event-envelope');
    constructionDurations.push(
      await page.evaluate(
        () =>
          (window as Window & { eventLogConstructionDuration?: number })
            .eventLogConstructionDuration ?? 0,
      ),
    );
  }

  const mutationDurations = await page
    .locator('#event-envelope')
    .evaluate(async (log, iterations) => {
      const records = Array.from(log.querySelectorAll('wg-event-record')) as Array<
        HTMLElement & { updateComplete: Promise<boolean> }
      >;
      const durations: number[] = [];
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        const started = performance.now();
        records.forEach((record, index) => {
          record.setAttribute('condition', (index + iteration) % 2 === 0 ? 'positive' : 'caution');
          record.setAttribute('knowledge', (index + iteration) % 3 === 0 ? 'stale' : 'confirmed');
        });
        const first = log.querySelector('wg-event-record');
        if (first) log.append(first);
        durations.push(performance.now() - started);
        await Promise.all(records.map((record) => record.updateComplete));
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
    recordCount: 500,
    medianConstructionMs: median(constructionDurations),
    medianMutationMs: median(mutationDurations),
    largestSynchronousMutationMs: Math.max(...mutationDurations),
  };
  console.info(`[phase-3e-event-log-performance] ${JSON.stringify(record)}`);
  expect(record.medianConstructionMs).toBeLessThan(100);
  expect(record.medianMutationMs).toBeLessThan(100);
  expect(record.largestSynchronousMutationMs).toBeLessThan(100);
});

test('maps density and supports narrow RTL reflow, forced colors, and reduced motion', async ({
  page,
}) => {
  const gaps: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openEventLog(page, `?density=${density}`);
    gaps.push(
      await page
        .locator('#intake-log')
        .locator('[part="base"]')
        .first()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).gap)),
    );
  }
  expect(gaps[1]).toBeGreaterThan(gaps[0]!);

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await openEventLog(page, '?theme=wayglass-light&density=comfortable&dir=rtl');
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
  await expect(page.getByRole('button', { name: 'Inspect delayed source response' })).toBeVisible();
  const narrowActionOrder = await page
    .getByRole('button', { name: 'Inspect delayed source response' })
    .evaluate((button) => {
      const root = button.getRootNode();
      const control = root instanceof ShadowRoot ? root.host : button;
      const record = control.closest('wg-event-record')!;
      const content = record.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;
      const actions = record.shadowRoot!.querySelector<HTMLElement>('[part="actions"]')!;
      return {
        contentBottom: content.getBoundingClientRect().bottom,
        actionsTop: actions.getBoundingClientRect().top,
      };
    });
  expect(narrowActionOrder.actionsTop).toBeGreaterThanOrEqual(narrowActionOrder.contentBottom);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes event-log accessibility checks in ${theme}`, async ({ page }) => {
    await openEventLog(page, `?fixture=envelope&theme=${theme}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await expect(
      page.locator('[aria-live], [role="log"], [role="status"], [role="alert"]'),
    ).toHaveCount(0);
  });
}

test('has no automatically detectable accessibility violations', async ({ page }) => {
  await openEventLog(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
