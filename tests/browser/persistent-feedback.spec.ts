import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/persistent-feedback/');
  await page.waitForFunction(() => customElements.get('wg-stale-data-marker') !== undefined);
});

test('keeps modules side-effect free and useful light DOM visible before upgrade', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const alert = document.createElement('wg-alert');
    alert.textContent = 'Persistent fallback outcome';
    document.body.append(alert);
    await Promise.all([
      import('/packages/elements/dist/alert.js'),
      import('/packages/elements/dist/badge.js'),
      import('/packages/elements/dist/empty-state.js'),
      import('/packages/elements/dist/offline-state.js'),
      import('/packages/elements/dist/progress.js'),
      import('/packages/elements/dist/skeleton.js'),
      import('/packages/elements/dist/stale-data-marker.js'),
    ]);
    return {
      registered: customElements.get('wg-alert') !== undefined,
      text: alert.textContent,
      visible: alert.getBoundingClientRect().height > 0,
    };
  });
  expect(result).toEqual({ registered: false, text: 'Persistent fallback outcome', visible: true });
});

test('keeps passive feedback unfocusable and without implicit live roles', async ({ page }) => {
  for (const selector of [
    '#review-badge',
    '#result-alert',
    '#import-progress',
    '#loading-skeleton',
    '#empty-results',
    '#offline-source',
    '#latency-freshness',
  ]) {
    await expect(page.locator(selector)).not.toHaveAttribute('tabindex', /.+/);
  }
  await expect(page.locator('#result-alert').locator('[part="message"]')).not.toHaveAttribute(
    'role',
    /.+/,
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('maps explicit alert announcements without including actions in the live node', async ({
  page,
}) => {
  const alert = page.locator('#result-alert');
  const message = alert.locator('[part="message"]');
  const actions = alert.locator('[part="actions"]');

  await alert.evaluate((element) => element.setAttribute('announcement', 'polite'));
  await expect(message).toHaveAttribute('role', 'status');
  await expect(message).toHaveAttribute('aria-atomic', 'true');
  await expect(actions).not.toHaveAttribute('role', /.+/);
  await expect(message.getByRole('button')).toHaveCount(0);
  expect(
    await actions.evaluate((element) =>
      (element.querySelector('slot') as HTMLSlotElement)
        .assignedElements()
        .map((item) => item.tagName),
    ),
  ).toEqual(['BUTTON']);
  await expect(alert.getByRole('button', { name: 'Review records' })).toHaveCount(1);

  await alert.evaluate((element) => element.setAttribute('announcement', 'assertive'));
  await expect(message).toHaveAttribute('role', 'alert');
});

test('normalizes closed presentation vocabularies', async ({ page }) => {
  const alert = page.locator('#result-alert');
  await alert.evaluate((element) => {
    element.setAttribute('condition', 'healthy');
    element.setAttribute('announcement', 'urgent');
  });
  await expect(alert).toHaveAttribute('condition', 'neutral');
  await expect(alert).toHaveAttribute('announcement', 'off');

  const skeleton = page.locator('#loading-skeleton');
  await skeleton.evaluate((element) => {
    element.setAttribute('shape', 'chart');
    element.setAttribute('motion', 'shimmer');
    element.setAttribute('lines', '99');
  });
  await expect(skeleton).toHaveAttribute('shape', 'text');
  await expect(skeleton).toHaveAttribute('motion', 'static');
  await expect(skeleton).toHaveAttribute('lines', '8');
});

test('retains native progress ownership, value, label, and indeterminate state', async ({
  page,
}) => {
  const progress = page.getByRole('progressbar', { name: 'Importing catalog' });
  await expect(progress).toHaveAttribute('value', '64');
  await expect(progress).toHaveAttribute('max', '100');
  await expect(page.locator('#import-progress')).not.toHaveAttribute('role', /.+/);

  await progress.evaluate((element) => element.removeAttribute('value'));
  expect(await progress.evaluate((element: HTMLProgressElement) => element.position)).toBe(-1);
});

test('reports invalid native progress anatomy without hiding content', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...values: unknown[]) => warnings.push(values.join(' '));
    const shell = document.createElement('wg-progress');
    const progress = document.createElement('progress');
    shell.append(progress);
    document.body.append(shell);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    console.warn = originalWarn;
    return {
      warning: warnings.find((value) => value.includes('[wg-progress]')) ?? '',
      visible: progress.getBoundingClientRect().width > 0,
    };
  });
  expect(result.warning).toContain('explicit accessible name');
  expect(result.visible).toBe(true);
});

test('keeps skeletons nonsemantic and bounds generated visual lines', async ({ page }) => {
  const skeleton = page.locator('#loading-skeleton');
  await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  await expect(skeleton.locator('[part="line"]')).toHaveCount(3);
  await expect(page.getByText('Loading supporting summary')).toBeVisible();
});

test('keeps stale knowledge and offline availability distinct from condition', async ({ page }) => {
  const colors = await page.evaluate(() => ({
    stale: getComputedStyle(
      document.querySelector('#latency-freshness')!.shadowRoot!.querySelector('[part="marker"]')!,
    ).backgroundColor,
    offline: getComputedStyle(
      document.querySelector('#offline-source')!.shadowRoot!.querySelector('[part="marker"]')!,
    ).backgroundImage,
    caution: getComputedStyle(
      document.querySelector('#review-badge')!.shadowRoot!.querySelector('[part="marker"]')!,
    ).backgroundColor,
  }));
  expect(colors.stale).not.toBe(colors.caution);
  expect(colors.offline).toContain('repeating-linear-gradient');
  await expect(page.locator('#latency-value')).toHaveAccessibleDescription(
    'Stale · observed 18 minutes ago',
  );
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('preserves boundaries and suppresses skeleton motion in forced colors and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-stale-data-marker') !== undefined);
  expect(
    await page
      .locator('#loading-skeleton')
      .locator('[part="line"]')
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('reflows at 320 CSS pixels without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const dimensions = await page.locator('html').evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(dimensions.scroll - dimensions.client).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: 'Retry source' })).toBeVisible();
});
