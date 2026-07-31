import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/menu-commands/');
  await page.waitForFunction(() => customElements.get('wg-menu') !== undefined);
});

test('keeps menu imports side-effect free', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    await Promise.all([
      import('/packages/elements/dist/menu.js'),
      import('/packages/elements/dist/command-item.js'),
    ]);
    return {
      menuRegistered: customElements.get('wg-menu') !== undefined,
      commandRegistered: customElements.get('wg-command-item') !== undefined,
    };
  });
  expect(result).toEqual({ menuRegistered: false, commandRegistered: false });
});

test('provides scoped client-only behavior without the Popover API', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto('/tests/browser/menu-commands/');
  await page.waitForFunction(() => customElements.get('wg-menu') !== undefined);
  const trigger = page.getByRole('button', { name: 'Report actions' });
  await trigger.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Refresh report/ })).toBeFocused();
  await page.locator('#outside-control').click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('exposes one named menu button and focuses the first command on open', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Report actions' });
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  const bounds = await trigger.boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(44);
  expect(bounds?.height).toBeGreaterThanOrEqual(44);

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Refresh report/ })).toBeFocused();
});

test('supports wrapping movement, Home, End, disabled discovery, and typeahead', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Report actions' });
  await trigger.focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('menuitem', { name: 'Export report' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: /Refresh report/ })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('menuitem', { name: 'Export report' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('menuitem', { name: /Refresh report/ })).toBeFocused();
  await page.keyboard.press('a');
  await expect(page.getByRole('menuitem', { name: /Archive report/ })).toBeFocused();
  await expect(page.getByRole('menuitem', { name: /Archive report/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.waitForTimeout(550);
  await page.keyboard.press('e');
  await expect(page.getByRole('menuitem', { name: 'Export report' })).toBeFocused();
});

test('emits one keyboard command, closes, and restores trigger focus', async ({ page }) => {
  await page.locator('#report-menu').evaluate((element) => {
    (element as HTMLElement & { commands?: unknown[] }).commands = [];
    element.addEventListener('wg-command', (event) => {
      (element as HTMLElement & { commands: unknown[] }).commands.push(
        (event as CustomEvent).detail,
      );
    });
  });

  const trigger = page.getByRole('button', { name: 'Report actions' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(
    await page
      .locator('#report-menu')
      .evaluate((element) => (element as HTMLElement & { commands: unknown[] }).commands),
  ).toEqual([{ value: 'copy-report-id', trigger: 'keyboard' }]);
});

test('suppresses disabled activation and reports programmatic activation accurately', async ({
  page,
}) => {
  await page.locator('#report-menu').evaluate((element) => {
    document.documentElement.dataset.commands = '0';
    element.addEventListener('wg-command', (event) => {
      document.documentElement.dataset.commands = String(
        Number(document.documentElement.dataset.commands) + 1,
      );
      document.documentElement.dataset.trigger = (event as CustomEvent).detail.trigger;
    });
  });
  await page.getByRole('button', { name: 'Report actions' }).click();
  await page.locator('#archive-command').evaluate((element) => (element as HTMLElement).click());
  await expect(page.locator('html')).toHaveAttribute('data-commands', '0');
  await page.locator('#copy-command').evaluate((element) => (element as HTMLElement).click());
  await expect(page.locator('html')).toHaveAttribute('data-commands', '1');
  await expect(page.locator('html')).toHaveAttribute('data-trigger', 'programmatic');
});

test('restores focus on Escape and preserves native traversal on Tab', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Report actions' });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.keyboard.press('Tab');
  await expect(page.locator('#following-control')).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('light dismisses without stealing focus from the outside target', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Report actions' });
  await trigger.click();
  await page.locator('#outside-control').click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toBeFocused();
});

test('supports programmatic opening without moving focus and explicit focus return', async ({
  page,
}) => {
  const outside = page.locator('#outside-control');
  await outside.focus();
  await page.locator('#report-menu').evaluate(async (element) => {
    await (element as HTMLElement & { show(options?: { focus?: string }): Promise<void> }).show({
      focus: 'none',
    });
  });
  await expect(outside).toBeFocused();
  await page.locator('#report-menu').evaluate((element) => {
    (element as HTMLElement & { hide(options?: { restoreFocus?: boolean }): void }).hide({
      restoreFocus: true,
    });
  });
  await expect(page.getByRole('button', { name: 'Report actions' })).toBeFocused();
});

test('moves focus predictably when the focused command is removed', async ({ page }) => {
  await page.getByRole('button', { name: 'Report actions' }).click();
  const copy = page.getByRole('menuitem', { name: 'Copy report identifier' });
  await copy.focus();
  await copy.evaluate((element) => element.remove());
  await expect(page.getByRole('menuitem', { name: /Archive report/ })).toBeFocused();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    await page.getByRole('button', { name: 'Report actions' }).click();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('keeps focus and semantics visible in forced colors and reduced motion', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-menu') !== undefined);
  await page.getByRole('button', { name: 'Report actions' }).click();
  const item = page.getByRole('menuitem', { name: /Refresh report/ });
  await expect(item).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('keeps the popup inside a narrow viewport without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 500 });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-menu') !== undefined);
  await page.getByRole('button', { name: 'Report actions' }).click();
  const popup = page.getByRole('menu');
  const bounds = await popup.boundingBox();
  expect(bounds?.x).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(320);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
});
