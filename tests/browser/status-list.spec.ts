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

    return {
      synchronousDuration,
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
  if (browserName === 'chromium') expect(result.synchronousDuration).toBeLessThan(100);
});

test('supports narrow reflow, forced colors, reduced motion, and accessibility', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await openStatusList(page, '?theme=wayglass-light&density=comfortable&dir=rtl');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
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
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
