import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/core-controls/');
  await page.waitForFunction(() => customElements.get('wg-segmented-control') !== undefined);
});

test('keeps control and icon imports side-effect free with visible fallback content', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const control = document.createElement('wg-icon-button');
    control.textContent = 'Fallback command graphic';
    document.body.append(control);
    const before = control.getBoundingClientRect();
    await Promise.all([
      import('/packages/elements/dist/icon-button.js'),
      import('/packages/icons/dist/index.js'),
    ]);
    return {
      controlRegistered: customElements.get('wg-icon-button') !== undefined,
      iconRegistered: customElements.get('wg-icon') !== undefined,
      text: control.textContent,
      visible: before.width > 0 && before.height > 0,
    };
  });
  expect(result).toEqual({
    controlRegistered: false,
    iconRegistered: false,
    text: 'Fallback command graphic',
    visible: true,
  });
});

test('keeps icon commands named, native, touch-sized, and pending-safe', async ({ page }) => {
  const refresh = page.getByRole('button', { name: 'Refresh account status' });
  const pending = page.getByRole('button', { name: 'Dismiss account notice' });
  await expect(refresh).toBeVisible();
  await expect(pending).toHaveAttribute('aria-busy', 'true');

  const bounds = await refresh.boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(44);
  expect(bounds?.height).toBeGreaterThanOrEqual(44);

  const pendingHost = page.locator('#pending-command');
  await pendingHost.evaluate((element) => {
    (element as HTMLElement).focus();
    (element as HTMLElement).click();
  });
  expect(
    await pendingHost.evaluate(
      (element) => element.shadowRoot?.activeElement?.getAttribute('part') === 'button',
    ),
  ).toBe(true);
});

test('emits a request without changing confirmed switch truth', async ({ page }) => {
  const host = page.locator('#confirmed-toggle');
  const toggle = page.getByRole('switch', { name: 'Email notifications' });
  await host.evaluate((element) => {
    (element as HTMLElement & { requests?: unknown[] }).requests = [];
    element.addEventListener('wg-toggle-request', (event) => {
      (element as HTMLElement & { requests: unknown[] }).requests.push(
        (event as CustomEvent).detail,
      );
    });
  });

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await expect(host).toHaveAttribute('asserted', '');
  expect(
    await host.evaluate((element) => (element as HTMLElement & { requests: unknown[] }).requests),
  ).toEqual([{ confirmedAsserted: true, requestedAsserted: false, trigger: 'pointer' }]);
});

test('suppresses pending requests and permits rejected retries', async ({ page }) => {
  const pending = page.getByRole('switch', { name: 'Activity summaries' });
  const rejected = page.getByRole('switch', { name: 'Security notices' });
  const unavailable = page.getByRole('switch', { name: 'Directory synchronization' });
  await page.evaluate(() => {
    document.documentElement.dataset.requests = '0';
    document.addEventListener('wg-toggle-request', () => {
      document.documentElement.dataset.requests = String(
        Number(document.documentElement.dataset.requests) + 1,
      );
    });
  });

  await pending.click({ force: true });
  await expect(page.locator('html')).toHaveAttribute('data-requests', '0');
  await unavailable.click({ force: true });
  await expect(page.locator('html')).toHaveAttribute('data-requests', '0');
  await rejected.click();
  await expect(page.locator('html')).toHaveAttribute('data-requests', '1');
  await expect(rejected).toHaveAttribute('aria-checked', 'false');
});

test('uses radio semantics, roving focus, disabled skipping, and silent programmatic selection', async ({
  page,
}) => {
  const group = page.getByRole('radiogroup', { name: 'Display density' });
  const compact = page.getByRole('radio', { name: 'Compact' });
  const comfortable = page.getByRole('radio', { name: 'Comfortable' });
  await expect(group).toBeVisible();
  await expect(compact).toHaveAttribute('aria-checked', 'true');
  await compact.focus();
  await page.keyboard.press('ArrowRight');
  await expect(comfortable).toBeFocused();
  await expect(comfortable).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(compact).toBeFocused();

  await group.evaluate((element) => {
    document.documentElement.dataset.segmentChanges = '0';
    element.addEventListener('wg-segment-change', () => {
      document.documentElement.dataset.segmentChanges = String(
        Number(document.documentElement.dataset.segmentChanges) + 1,
      );
    });
    (element as HTMLElement & { value: string }).value = 'comfortable';
  });
  await expect(group).toHaveAttribute('value', 'comfortable');
  await expect(page.locator('html')).toHaveAttribute('data-segment-changes', '0');
});

test('maps RTL arrows and restores selection and focus after mutation', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Display density' });
  const compact = page.getByRole('radio', { name: 'Compact' });
  const comfortable = page.getByRole('radio', { name: 'Comfortable' });
  await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'));
  await compact.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(comfortable).toBeFocused();

  await comfortable.evaluate((element) => element.setAttribute('disabled', ''));
  await expect(compact).toBeFocused();
  await expect(compact).toHaveAttribute('aria-checked', 'true');
  await expect(group).toHaveAttribute('value', 'compact');

  await compact.evaluate((element) => element.remove());
  await expect(group).toHaveAttribute('value', '');
});

test('leaves navigation as native links in a named landmark', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Account' });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('wg-navigation-rail')).not.toHaveAttribute('role', /.+/);
  await nav.getByRole('link', { name: 'Activity' }).click();
  await expect(page).toHaveURL(/#activity$/);
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('retains semantics and focus treatment in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-segmented-control') !== undefined);
  const compact = page.getByRole('radio', { name: 'Compact' });
  await compact.focus();
  await expect(compact).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('reflows without page overflow at a 320 CSS-pixel viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-segmented-control') !== undefined);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
  await expect(page.getByRole('switch', { name: 'Email notifications' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Preferences' })).toBeVisible();
});
