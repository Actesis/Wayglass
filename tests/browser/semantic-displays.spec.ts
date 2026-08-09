import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('keeps scalar-data imports side-effect free with useful fallback text', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const group = document.createElement('wg-metric-group');
    group.innerHTML = '<span>Fallback scalar content</span>';
    document.body.append(group);
    await Promise.all([
      import('/packages/elements/dist/metric-group.js'),
      import('/packages/elements/dist/key-value.js'),
      import('/packages/elements/dist/trend-indicator.js'),
    ]);
    return {
      registrations: ['wg-metric-group', 'wg-key-value', 'wg-trend-indicator'].map(
        (name) => customElements.get(name) !== undefined,
      ),
      text: group.textContent?.trim(),
      visible: group.getBoundingClientRect().height > 0,
    };
  });
  expect(result).toEqual({
    registrations: [false, false, false],
    text: 'Fallback scalar content',
    visible: true,
  });
});

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/fixture/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-status-indicator') !== undefined &&
      customElements.get('wg-boolean-value') !== undefined &&
      customElements.get('wg-metric') !== undefined &&
      customElements.get('wg-metric-group') !== undefined &&
      customElements.get('wg-key-value') !== undefined &&
      customElements.get('wg-trend-indicator') !== undefined &&
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
  await page.locator('#trend-rising').evaluate((element) => {
    element.setAttribute('direction', 'up');
    element.setAttribute('condition', 'good');
    element.setAttribute('knowledge', 'maybe');
    element.setAttribute('activity', 'working');
  });
  await page.locator('#key-value').evaluate((element) => {
    element.setAttribute('condition', 'good');
    element.setAttribute('knowledge', 'maybe');
    element.setAttribute('activity', 'working');
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
  await expect(page.locator('#trend-rising')).toHaveAttribute('direction', 'none');
  await expect(page.locator('#trend-rising')).toHaveAttribute('condition', 'neutral');
  await expect(page.locator('#trend-rising')).toHaveAttribute('knowledge', 'confirmed');
  await expect(page.locator('#trend-rising')).toHaveAttribute('activity', 'idle');
  await expect(page.locator('#key-value')).toHaveAttribute('condition', 'neutral');
  await expect(page.locator('#key-value')).toHaveAttribute('knowledge', 'confirmed');
  await expect(page.locator('#key-value')).toHaveAttribute('activity', 'idle');
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

test('groups scalar values without aggregating state or announcing updates', async ({ page }) => {
  const group = page.locator('#metric-group');
  const base = group.locator('[part="base"]').first();
  await expect(base).toHaveAttribute('role', 'group');
  await expect(base).toHaveAttribute('aria-label', 'Processing activity');
  await expect(base).toHaveAttribute('aria-busy', 'true');
  await expect(base).not.toHaveAttribute('aria-live');
  await expect(group).toContainText('Data stale');
  await expect(base).not.toHaveAttribute('aria-label', /stale/i);
  expect(
    await group
      .locator('[part="content"] > slot')
      .evaluate((element) => getComputedStyle(element).display),
  ).toBe('contents');

  await page.locator('#metric-group-action').focus();
  await group.evaluate((element) => {
    const value = element.querySelector('#key-value');
    if (value) element.prepend(value);
  });
  await expect(page.locator('#metric-group-action')).toBeFocused();
});

test('keeps trend direction visible and independent from condition', async ({ page }) => {
  const trend = page.locator('#trend-rising');
  await expect(trend.getByText('Rising')).toBeVisible();
  await expect(trend.getByText('12% over the previous hour')).toBeVisible();
  await expect(trend.getByText('Pending')).toBeVisible();
  await expect(trend.locator('[role="group"]')).toHaveAttribute(
    'aria-label',
    'Rising, 12% over the previous hour, Pending',
  );
  await expect(trend.locator('[part="signal"]')).toHaveAttribute('aria-hidden', 'true');
  await expect(trend.locator('[role="group"]')).not.toHaveAttribute('aria-live');

  const risingColor = await trend
    .locator('[part="signal"]')
    .evaluate((element) => getComputedStyle(element).color);
  await trend.evaluate(async (element) => {
    element.setAttribute('direction', 'falling');
    await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
  });
  await expect(trend.getByText('Falling')).toBeVisible();
  const fallingColor = await trend
    .locator('[part="signal"]')
    .evaluate((element) => getComputedStyle(element).color);
  expect(fallingColor).toBe(risingColor);

  for (const [direction, word] of [
    ['steady', 'Steady'],
    ['mixed', 'Mixed'],
    ['none', 'No direction'],
  ] as const) {
    await trend.evaluate(async (element, nextDirection) => {
      element.setAttribute('direction', nextDirection);
      await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    }, direction);
    await expect(trend.getByText(word)).toBeVisible();
  }
  await expect(trend.locator('[part="signal"]')).toBeHidden();

  await trend.evaluate(async (element) => {
    element.setAttribute('condition', 'positive');
    element.setAttribute('loading', '');
    await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
  });
  await expect(trend.getByText('Loading')).toBeVisible();
  await expect(trend.getByText('Positive')).toBeVisible();
  await expect(trend.locator('[role="group"]')).toHaveAttribute('aria-busy', 'true');
  await expect(trend.locator('[part="signal"]')).toBeHidden();
});

test('preserves native key-value content and exposes a readable missing value', async ({
  page,
}) => {
  const value = page.locator('#key-value');
  const time = value.locator('time');
  await expect(time).toHaveAttribute('datetime', '2026-08-08T19:24:00Z');
  await expect(time).toHaveText('12:24 PM local time');
  await expect(value.locator('[role="group"]')).toHaveAttribute('aria-label', 'Last confirmed');
  await expect(value.getByText('Data stale')).toBeVisible();

  const missing = page.locator('#key-value-missing');
  await expect(missing.locator('[part="value"]')).toHaveText('—');
  await expect(missing.locator('[part="value"]')).toHaveAttribute('aria-label', 'No value');
  await missing.evaluate(async (element) => {
    const emptyValue = document.createElement('span');
    emptyValue.slot = 'value';
    element.append(emptyValue);
    await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
  });
  await expect(missing.locator('[part="value"]')).toHaveText('—');
});

test('semantic displays add no tab stops and pass accessibility checks', async ({ page }) => {
  for (const selector of [
    '#status-mixed',
    '#boolean-asserted',
    '#boolean-unknown',
    '#boolean-loading',
    '#metric',
    '#metric-loading',
    '#metric-group',
    '#trend-rising',
    '#key-value',
    '#key-value-missing',
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
    .include('#metric-group')
    .analyze();
  expect(lightResults.violations).toEqual([]);
});
