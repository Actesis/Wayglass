import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/fixture/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-status-indicator') !== undefined &&
      customElements.get('wg-boolean-value') !== undefined &&
      customElements.get('wg-metric') !== undefined &&
      customElements.get('wg-value-tile') !== undefined,
  );
});

test('normalizes invalid semantic display attributes', async ({ page }) => {
  await page.locator('#status-mixed').evaluate((element) => {
    element.setAttribute('condition', 'good');
    element.setAttribute('knowledge', 'maybe');
    element.setAttribute('activity', 'working');
    element.setAttribute('size', 'large');
  });
  await page.locator('#boolean-asserted').evaluate((element) => {
    element.setAttribute('knowledge', 'maybe');
    element.setAttribute('presentation', 'lamp');
  });
  await page.locator('#metric').evaluate((element) => {
    element.setAttribute('condition', 'warning');
    element.setAttribute('knowledge', 'old');
    element.setAttribute('activity', 'working');
    element.setAttribute('size', 'large');
  });
  await page.locator('#value-tile').evaluate((element) => element.setAttribute('emphasis', 'loud'));

  await expect(page.locator('#status-mixed')).toHaveAttribute('condition', 'neutral');
  await expect(page.locator('#status-mixed')).toHaveAttribute('knowledge', 'confirmed');
  await expect(page.locator('#status-mixed')).toHaveAttribute('activity', 'idle');
  await expect(page.locator('#status-mixed')).toHaveAttribute('size', 'compact');
  await expect(page.locator('#boolean-asserted')).toHaveAttribute('knowledge', 'confirmed');
  await expect(page.locator('#boolean-asserted')).toHaveAttribute('presentation', 'rail');
  await expect(page.locator('#metric')).toHaveAttribute('condition', 'neutral');
  await expect(page.locator('#metric')).toHaveAttribute('knowledge', 'confirmed');
  await expect(page.locator('#metric')).toHaveAttribute('activity', 'idle');
  await expect(page.locator('#metric')).toHaveAttribute('size', 'compact');
  await expect(page.locator('#value-tile')).toHaveAttribute('emphasis', 'standard');
});

test('summarizes status axes without becoming an interactive control', async ({ page }) => {
  const status = page.locator('#status-mixed');
  await expect(status.getByText('Caution')).toBeVisible();
  await expect(status.getByText('Stale')).toBeVisible();
  await expect(status.getByText('Pending')).toBeVisible();
  await expect(status.locator('[role="group"]')).toHaveAttribute(
    'aria-label',
    'Primary link, Caution, Data stale, Pending',
  );
  await expect(status).not.toHaveAttribute('tabindex', /.+/);

  const before = await status.locator('[part="signal"]').boundingBox();
  await status.evaluate((element) => {
    element.setAttribute('condition', 'critical');
    element.setAttribute('knowledge', 'conflicting');
  });
  const after = await status.locator('[part="signal"]').boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
});

test('keeps boolean value separate from knowledge and loading state', async ({ page }) => {
  const asserted = page.locator('#boolean-asserted');
  const unknown = page.locator('#boolean-unknown');
  const loading = page.locator('#boolean-loading');

  await expect(asserted.getByText('Verified')).toBeVisible();
  await expect(asserted.getByText('Stale')).toBeVisible();
  await expect(asserted.locator('[role="group"]')).toHaveAttribute(
    'aria-label',
    'Email, Verified, Data stale',
  );
  await expect(unknown.getByText('Closed')).toBeVisible();
  await expect(unknown.getByText('Unknown')).toBeVisible();
  await expect(unknown.locator('[role="group"]')).toHaveAttribute(
    'aria-label',
    'Access, Closed, Unknown',
  );
  await expect(loading.getByText('Loading')).toBeVisible();
  await expect(loading.locator('[role="group"]')).toHaveAttribute('aria-busy', 'true');

  const assertedSignal = await asserted.locator('[part="signal"]').evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      background: getComputedStyle(element).backgroundColor,
      width: box.width,
      height: box.height,
    };
  });
  await asserted.evaluate((element) => element.removeAttribute('asserted'));
  const notAssertedSignal = await asserted.locator('[part="signal"]').evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      background: getComputedStyle(element).backgroundColor,
      width: box.width,
      height: box.height,
    };
  });
  expect(assertedSignal.background).not.toBe(notAssertedSignal.background);
  expect(notAssertedSignal.background).toBe('rgba(0, 0, 0, 0)');
  expect(notAssertedSignal.width).toBe(assertedSignal.width);
  expect(notAssertedSignal.height).toBe(assertedSignal.height);
});

test('keeps metric geometry stable while exposing value, unit, and state', async ({ page }) => {
  const metric = page.locator('#metric');
  await expect(metric.getByText('184')).toBeVisible();
  await expect(metric.getByText('ms')).toBeVisible();
  await expect(metric.getByText('Caution')).toBeVisible();
  await expect(metric.getByText('Stale')).toBeVisible();
  await expect(metric.locator('[role="group"]')).toHaveAttribute(
    'aria-label',
    'Latency, 184 ms, Caution, Data stale',
  );

  const value = metric.locator('[part="value"]');
  const before = await value.boundingBox();
  const numericVariant = await value.evaluate(
    (element) => getComputedStyle(element).fontVariantNumeric,
  );
  await metric.evaluate((element) => element.setAttribute('value', '8'));
  const after = await value.boundingBox();
  expect(numericVariant).toContain('tabular-nums');
  expect(after?.width).toBe(before?.width);

  const loading = page.locator('#metric-loading');
  await expect(loading.getByText('Loading')).toBeVisible();
  await expect(loading.locator('[role="group"]')).toHaveAttribute('aria-busy', 'true');
});

test('composes a named value region and preserves narrow action order', async ({ page }) => {
  const tile = page.locator('#value-tile');
  await expect(page.getByRole('region', { name: 'Connection overview' })).toBeVisible();
  await expect(tile.locator('section')).toHaveAttribute('aria-busy', 'true');
  await expect(tile).toContainText('Confirmed values remain visible while refreshing.');
  await expect(tile).toContainText('Refreshing connection');
  await expect(tile).not.toHaveAttribute('condition');
  await expect(tile).not.toHaveAttribute('knowledge');
  await expect(tile).not.toHaveAttribute('activity');

  const positions = await tile.evaluate((element) => {
    const content = element.shadowRoot?.querySelector<HTMLElement>('[part="content"]');
    const actions = element.shadowRoot?.querySelector<HTMLElement>('[part="actions"]');
    return {
      contentTop: content?.getBoundingClientRect().top,
      actionsTop: actions?.getBoundingClientRect().top,
    };
  });
  expect(positions.actionsTop).toBeGreaterThan(positions.contentTop!);

  await page.locator('#tile-action').evaluate((element) => (element as HTMLElement).focus());
  await expect(page.locator('#tile-action').locator('button')).toBeFocused();
});

test('semantic displays add no tab stops and pass accessibility checks', async ({ page }) => {
  for (const selector of [
    '#status-mixed',
    '#boolean-asserted',
    '#boolean-unknown',
    '#boolean-loading',
    '#metric',
    '#metric-loading',
  ]) {
    await expect(page.locator(selector)).not.toHaveAttribute('tabindex', /.+/);
  }

  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(darkResults.violations).toEqual([]);

  await page.locator('#provider > wg-theme-provider').evaluate(async (element) => {
    element.setAttribute('theme', 'wayglass-light');
    await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
  });
  const lightResults = await new AxeBuilder({ page })
    .include('#status-mixed')
    .include('#boolean-asserted')
    .include('#boolean-unknown')
    .include('#boolean-loading')
    .include('#metric')
    .include('#metric-loading')
    .analyze();
  expect(lightResults.violations).toEqual([]);
});
