import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/fixture/');
  await page.waitForFunction(() => customElements.get('wg-theme-provider') !== undefined);
});

test('resolves system theme and reflects density synchronously', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();

  const provider = page.locator('#provider');
  await expect(provider).toHaveAttribute('theme', 'system');
  await expect(provider).toHaveAttribute('density', 'compact');
  await expect(provider).toHaveAttribute('data-wg-theme', 'wayglass-light');
  await expect(provider).toHaveAttribute('data-wg-density', 'compact');
});

test('normalizes invalid public attributes', async ({ page }) => {
  const provider = page.locator('#provider');

  await provider.evaluate((element) => {
    element.setAttribute('theme', 'unknown');
    element.setAttribute('density', 'dense');
  });

  await expect(provider).toHaveAttribute('theme', 'system');
  await expect(provider).toHaveAttribute('density', 'compact');
});

test('emits typed detail only when the resolved theme changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();

  const detail = await page.locator('#provider').evaluate(
    (element) =>
      new Promise((resolve) => {
        element.addEventListener(
          'wg-theme-change',
          (event) => resolve((event as CustomEvent).detail),
          { once: true },
        );
        element.setAttribute('theme', 'wayglass-dark');
      }),
  );

  expect(detail).toEqual({
    theme: 'wayglass-dark',
    resolvedTheme: 'wayglass-dark',
    source: 'attribute',
  });
});

test('follows system preference changes while system selection is active', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();

  await page.locator('#provider').evaluate((element) => {
    element.addEventListener(
      'wg-theme-change',
      (event) => {
        document.documentElement.dataset.lastThemeChange = JSON.stringify(
          (event as CustomEvent).detail,
        );
      },
      { once: true },
    );
  });

  await page.emulateMedia({ colorScheme: 'dark' });

  await expect
    .poll(async () => {
      const serialized = await page.locator('html').getAttribute('data-last-theme-change');
      return serialized ? JSON.parse(serialized) : undefined;
    })
    .toEqual({
      theme: 'system',
      resolvedTheme: 'wayglass-dark',
      source: 'system',
    });
});

test('has no automated accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
