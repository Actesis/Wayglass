import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openStatusList(page: import('@playwright/test').Page, query = ''): Promise<void> {
  await page.goto(`/tests/browser/status-list/${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-status-list') !== undefined &&
      document.querySelector('wg-status-list')?.shadowRoot !== null,
  );
}

test('keeps status-list imports side-effect free with useful fallback text', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const list = document.createElement('wg-status-list');
    list.innerHTML = '<wg-status-entry>Fallback source summary</wg-status-entry>';
    document.body.append(list);
    await Promise.all([
      import('/packages/elements/dist/status-list.js'),
      import('/packages/elements/dist/status-entry.js'),
    ]);
    return {
      registrations: ['wg-status-list', 'wg-status-entry'].map(
        (name) => customElements.get(name) !== undefined,
      ),
      text: list.textContent?.trim(),
      visible: list.getBoundingClientRect().height > 0,
    };
  });
  expect(result).toEqual({
    registrations: [false, false],
    text: 'Fallback source summary',
    visible: true,
  });
});

test('preserves authored content before explicit registration', async ({ page }) => {
  await page.goto('/tests/browser/status-list/?upgrade=false');
  expect(await page.evaluate(() => customElements.get('wg-status-list'))).toBeUndefined();
  expect(await page.evaluate(() => customElements.get('wg-status-entry'))).toBeUndefined();
  await expect(page.getByRole('heading', { name: 'Active sources' })).toBeVisible();
  await expect(page.getByText('Delivery is operating inside its expected range.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect North source' })).toBeVisible();
  await expect(page.locator('wg-status-list').first()).not.toHaveAttribute('role');
});

test('exposes named lists, list items, busy state, and native actions without live regions', async ({
  page,
}) => {
  await openStatusList(page);
  await expect(page.getByRole('list', { name: 'Active sources' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Unavailable sources' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(4);
  await expect(page.getByRole('list', { name: 'Active sources' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(page.locator('#north-source')).toHaveAttribute('role', 'listitem');
  await expect(page.locator('#north-source')).not.toHaveAttribute('tabindex');
  await expect(page.getByRole('button', { name: 'Inspect North source' })).toBeEnabled();
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

test('renders condition, knowledge, and activity independently with icon-free text', async ({
  page,
}) => {
  await openStatusList(page);
  await expect(page.locator('#north-source').getByText('Positive', { exact: true })).toBeVisible();
  await expect(page.locator('#central-source').getByText('Neutral', { exact: true })).toBeVisible();
  const south = page.locator('#south-source');
  await expect(south.getByText('Caution', { exact: true })).toBeVisible();
  await expect(south.getByText('Data stale', { exact: true })).toBeVisible();
  await expect(south.getByText('Pending', { exact: true })).toBeVisible();
  await expect(south.locator('[part="signal"]')).toHaveAttribute('aria-hidden', 'true');
  await expect(
    page.locator('#archive-source').getByText('Unavailable', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Verified', { exact: true })).toBeVisible();
});

test('covers every state value and optional-content shape in the 100-entry envelope', async ({
  page,
}) => {
  await openStatusList(page, '?fixture=envelope');
  for (const condition of ['neutral', 'informational', 'positive', 'caution', 'critical']) {
    await expect(page.locator(`wg-status-entry[condition="${condition}"]`).first()).toBeVisible();
  }
  for (const knowledge of [
    'confirmed',
    'inferred',
    'stale',
    'unknown',
    'conflicting',
    'unavailable',
  ]) {
    await expect(page.locator(`wg-status-entry[knowledge="${knowledge}"]`).first()).toBeVisible();
  }
  await expect(page.locator('wg-status-entry[activity="pending"]')).toHaveCount(14);
  await expect(page.locator('wg-status-entry > [slot="value"]')).toHaveCount(25);
  await expect(page.locator('wg-status-entry > time[slot="time"]')).toHaveCount(20);
  await expect(page.locator('wg-status-entry > [slot="metadata"]')).toHaveCount(16);
  await expect(page.locator('wg-status-entry > button[slot="actions"]')).toHaveCount(10);
  await expect(page.locator('#status-entry-001 > [slot="value"]')).toHaveCount(0);
});

test('keeps loading, filtered-empty, partial, offline, and failure feedback application-authored', async ({
  page,
}) => {
  await openStatusList(page, '?fixture=feedback');
  await expect(page.getByRole('list')).toHaveCount(5);
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('list', { name: 'Loading sources' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(
    page.getByRole('progressbar', { name: 'Loading current source summaries' }),
  ).toBeVisible();
  await expect(page.getByRole('group', { name: 'No matching sources' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Remote source is offline' })).toBeVisible();
  await expect(page.getByText('Three sources could not be reached')).toBeVisible();
  await expect(page.getByText('Current summaries are unavailable')).toBeVisible();
  await expect(page.locator('wg-status-list [aria-live]')).toHaveCount(0);
});

test('normalizes invalid state attributes without emitting user-intent events', async ({
  page,
}) => {
  await openStatusList(page);
  const result = await page.locator('#south-source').evaluate(async (entry) => {
    let events = 0;
    entry.addEventListener('change', () => (events += 1));
    entry.addEventListener('input', () => (events += 1));
    entry.setAttribute('condition', 'good');
    entry.setAttribute('knowledge', 'maybe');
    entry.setAttribute('activity', 'working');
    await (entry as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
    return {
      condition: entry.getAttribute('condition'),
      knowledge: entry.getAttribute('knowledge'),
      activity: entry.getAttribute('activity'),
      events,
    };
  });
  expect(result).toEqual({
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
  await openStatusList(page);
  await page.locator('#active-list').evaluate(async (list) => {
    const unsupported = document.createElement('article');
    unsupported.textContent = 'Application-authored unsupported content';
    list.append(unsupported);
    const element = list as HTMLElement & {
      requestUpdate(): void;
      updateComplete: Promise<boolean>;
    };
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;
  });
  await expect(page.getByText('Application-authored unsupported content')).toBeVisible();
  expect(warnings.filter((warning) => warning.includes('[wg-status-list]'))).toHaveLength(1);
});

test('updates and reorders 100 stable entries without disturbing focused authored content', async ({
  page,
  browserName,
}) => {
  await openStatusList(page, '?fixture=envelope');
  await expect(page.locator('#status-envelope > wg-status-entry')).toHaveCount(100);
  await page.locator('#status-action-050').focus();

  const result = await page.locator('#status-envelope').evaluate(async (list) => {
    const observer = PerformanceObserver.supportedEntryTypes.includes('longtask')
      ? new PerformanceObserver(() => undefined)
      : undefined;
    observer?.observe({ type: 'longtask', buffered: true });
    const entries = Array.from(list.querySelectorAll<HTMLElement>('wg-status-entry'));
    const focusedEntry = document.querySelector<HTMLElement>('#status-entry-050')!;
    const focusedReference = focusedEntry;
    let events = 0;
    list.addEventListener('change', () => (events += 1));
    list.addEventListener('input', () => (events += 1));

    const started = performance.now();
    focusedEntry.setAttribute('condition', 'critical');
    focusedEntry.setAttribute('knowledge', 'conflicting');
    for (const entry of entries.slice(0, 49).reverse()) list.insertBefore(entry, focusedEntry);
    for (const entry of entries.slice(50).reverse()) list.append(entry);
    const synchronousDuration = performance.now() - started;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const longTasks = observer?.takeRecords().map((entry) => entry.duration) ?? [];
    observer?.disconnect();

    return {
      synchronousDuration,
      longTasks,
      focused: document.activeElement?.id,
      sameNode: document.querySelector('#status-entry-050') === focusedReference,
      count: list.querySelectorAll('wg-status-entry').length,
      first: list.querySelector('wg-status-entry')?.id,
      events,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(result.focused).toBe('status-action-050');
  expect(result.sameNode).toBe(true);
  expect(result.count).toBe(100);
  expect(result.first).toBe('status-entry-049');
  expect(result.events).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
  expect(result.longTasks.filter((duration) => duration >= 100)).toEqual([]);
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('preserves identity and unaffected focus across insertion, cross-list movement, and removal recovery', async ({
  page,
}) => {
  await openStatusList(page, '?fixture=envelope');
  await page.locator('#status-action-050').focus();
  const result = await page.locator('#status-envelope').evaluate(async (list) => {
    const focusedEntry = list.querySelector<HTMLElement>('#status-entry-050')!;
    const focusedReference = focusedEntry;
    const movedEntry = list.querySelector<HTMLElement>('#status-entry-049')!;
    const movedReference = movedEntry;
    const createEntry = (id: string, label: string) => {
      const entry = document.createElement('wg-status-entry');
      entry.id = id;
      entry.setAttribute('label', label);
      const summary = document.createElement('span');
      summary.slot = 'description';
      summary.textContent = `${label} summary.`;
      entry.append(summary);
      return entry;
    };

    const before = createEntry('inserted-before', 'Inserted before');
    const after = createEntry('inserted-after', 'Inserted after');
    list.insertBefore(before, focusedEntry);
    list.insertBefore(after, focusedEntry.nextSibling);

    const destination = document.createElement('wg-status-list');
    destination.id = 'moved-list';
    destination.setAttribute('label', 'Moved sources');
    document.querySelector('main')!.append(destination);
    destination.append(movedEntry);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const focusAfterInsertAndMove = document.activeElement?.id;
    const insertedOrder = [
      before.nextElementSibling?.id,
      after.previousElementSibling?.id,
      after.nextElementSibling?.id,
    ];
    const recovery = list.querySelector<HTMLButtonElement>('#status-action-060')!;
    recovery.focus();
    focusedEntry.remove();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    return {
      focusAfterInsertAndMove,
      focusAfterRecovery: document.activeElement?.id,
      focusedSameBeforeRemoval: focusedEntry === focusedReference,
      movedSameNode: destination.querySelector('#status-entry-049') === movedReference,
      insertedOrder,
      remaining: list.querySelectorAll('wg-status-entry').length,
    };
  });

  expect(result.focusAfterInsertAndMove).toBe('status-action-050');
  expect(result.focusAfterRecovery).toBe('status-action-060');
  expect(result.focusedSameBeforeRemoval).toBe(true);
  expect(result.movedSameNode).toBe(true);
  expect(result.insertedOrder).toEqual([
    'status-entry-050',
    'status-entry-050',
    'status-entry-051',
  ]);
  expect(result.remaining).toBe(100);
});

test('records the Chromium 100-entry construction and mutation envelope', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'The timing regression threshold is Chromium-specific.');
  const warmUpCount = 3;
  const iterationCount = 15;
  await openStatusList(page, '?fixture=envelope');

  for (let index = 0; index < warmUpCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#status-envelope');
  }

  const constructionDurations: number[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    await page.reload();
    await page.waitForSelector('#status-envelope');
    constructionDurations.push(
      await page.evaluate(
        () =>
          (window as Window & { statusListConstructionDuration?: number })
            .statusListConstructionDuration ?? 0,
      ),
    );
  }

  const mutationDurations = await page
    .locator('#status-envelope')
    .evaluate(async (list, iterations) => {
      const entries = Array.from(list.querySelectorAll('wg-status-entry')) as Array<
        HTMLElement & { updateComplete: Promise<boolean> }
      >;
      const durations: number[] = [];
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        const started = performance.now();
        entries.forEach((entry, index) => {
          entry.setAttribute('condition', (index + iteration) % 2 === 0 ? 'positive' : 'caution');
          entry.setAttribute('knowledge', (index + iteration) % 3 === 0 ? 'stale' : 'confirmed');
        });
        const first = list.querySelector('wg-status-entry');
        if (first) list.append(first);
        durations.push(performance.now() - started);
        await Promise.all(entries.map((entry) => entry.updateComplete));
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
    entryCount: 100,
    medianConstructionMs: median(constructionDurations),
    medianMutationMs: median(mutationDurations),
    largestSynchronousMutationMs: Math.max(...mutationDurations),
  };
  console.info(`[phase-3d-performance] ${JSON.stringify(record)}`);
  expect(record.medianConstructionMs).toBeLessThan(100);
  expect(record.medianMutationMs).toBeLessThan(100);
  expect(record.largestSynchronousMutationMs).toBeLessThan(100);
});

test('maps compact and comfortable density without changing authored semantics', async ({
  page,
}) => {
  const gaps: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openStatusList(page, `?density=${density}`);
    gaps.push(
      await page
        .locator('#active-list')
        .locator('section[part="base"]')
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).gap)),
    );
    await expect(page.getByRole('list', { name: 'Active sources' })).toBeVisible();
  }
  expect(gaps[1]).toBeGreaterThan(gaps[0]!);
});

test('supports narrow reflow, forced colors, reduced motion, and accessibility', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await openStatusList(page, '?theme=wayglass-light&density=comfortable&dir=rtl');
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
  await expect(page.getByRole('button', { name: 'Inspect South source' })).toBeVisible();
  const narrowActionOrder = await page.locator('#south-source').evaluate((entry) => {
    const content = entry.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;
    const actions = entry.shadowRoot!.querySelector<HTMLElement>('[part="actions"]')!;
    return {
      contentBottom: content.getBoundingClientRect().bottom,
      actionsTop: actions.getBoundingClientRect().top,
    };
  });
  expect(narrowActionOrder.actionsTop).toBeGreaterThanOrEqual(narrowActionOrder.contentBottom);
  expect(
    await page
      .locator('#south-source')
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe('0s');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes status-list accessibility checks in ${theme}`, async ({ page }) => {
    await openStatusList(page, `?fixture=envelope&theme=${theme}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
  });
}
