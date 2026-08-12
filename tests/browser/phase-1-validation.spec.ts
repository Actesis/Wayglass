import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openOverview(page: import('@playwright/test').Page) {
  await page.goto('/tests/browser/operations-overview/?width=desktop&theme=wayglass-dark');
  await page.waitForFunction(
    () =>
      customElements.get('wg-button') !== undefined &&
      document.querySelectorAll('[data-function]').length === 3,
  );
}

test('preserves action order, visible focus, and pending-button focusability', async ({ page }) => {
  await openOverview(page);

  const actionOrder = await page
    .locator('wg-button')
    .evaluateAll((buttons) =>
      buttons.map(
        (button) => button.closest('[data-function]')?.getAttribute('data-function') ?? '',
      ),
    );
  expect(actionOrder).toEqual(['communications', 'processing']);

  const retry = page.locator('[data-function="communications"] wg-button').locator('button');
  const pause = page.locator('[data-function="processing"] wg-button').locator('button');

  await retry.focus();
  await expect(retry).toBeFocused();

  await pause.focus();
  await expect(pause).toBeFocused();

  const focusStyle = await pause.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(focusStyle.outlineStyle).not.toBe('none');
  expect(focusStyle.outlineWidth).toBeGreaterThan(0);

  await expect(pause).toHaveAttribute('aria-busy', 'true');
  await expect(pause).toHaveAttribute('aria-disabled', 'true');

  await retry.focus();
  await expect(retry).toBeFocused();
});

test('keeps every action at least 44 by 44 CSS pixels', async ({ page }) => {
  await openOverview(page);

  const targets = await page
    .locator('wg-button')
    .locator('button')
    .evaluateAll((buttons) =>
      buttons.map((button) => {
        const bounds = button.getBoundingClientRect();
        return {
          height: bounds.height,
          width: bounds.width,
        };
      }),
    );

  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) {
    expect(target.height).toBeGreaterThanOrEqual(44);
    expect(target.width).toBeGreaterThanOrEqual(44);
  }
});

test('removes nonessential transition duration when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openOverview(page);

  const transitionDurations = await page
    .locator('[data-function="communications"] wg-button')
    .locator('button')
    .evaluate((button) => getComputedStyle(button).transitionDuration.split(', '));

  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
  expect(transitionDurations.every((duration) => duration === '0s')).toBe(true);
});

test('retains boundaries, signals, and text alternatives in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await openOverview(page);

  const positive = page
    .locator('[data-function="access"] wg-status-indicator')
    .locator('[part="signal"]');
  const critical = page
    .locator('[data-function="processing"] wg-status-indicator')
    .locator('[part="signal"]');
  const panel = page.getByRole('region', { name: 'Intake control', exact: true });

  const colors = await Promise.all(
    [positive, critical].map((signal) =>
      signal.evaluate((element) => ({
        background: getComputedStyle(element).backgroundColor,
      })),
    ),
  );

  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  expect(colors[0]!.background).not.toBe(colors[1]!.background);
  await expect(panel).toHaveCSS('border-top-style', 'solid');
  await expect(page.getByText('Positive', { exact: true })).toBeVisible();
  await expect(
    page
      .locator('[data-function="processing"] wg-status-indicator')
      .getByText('Critical', { exact: true }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('reflows at the effective CSS viewport of a 200% zoomed 640px display', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/tests/browser/operations-overview/?width=phone&theme=wayglass-dark');
  await page.waitForFunction(
    () =>
      customElements.get('wg-value-tile') !== undefined &&
      document.querySelectorAll('[data-function]').length === 3,
  );

  const layout = await page.locator('[data-overview-width="phone"]').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    tops: Array.from(element.querySelectorAll('[data-function]')).map(
      (section) => section.getBoundingClientRect().top,
    ),
  }));

  expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
  expect(layout.tops[1]).toBeGreaterThan(layout.tops[0]!);
  expect(layout.tops[2]).toBeGreaterThan(layout.tops[1]!);
});
