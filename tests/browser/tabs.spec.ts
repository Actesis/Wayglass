import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('keeps every tabs module side-effect free until explicit registration', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const tabs = document.createElement('wg-tabs');
    tabs.textContent = 'Fallback tabs content';
    document.body.append(tabs);

    await Promise.all([
      import('/packages/elements/dist/tab.js'),
      import('/packages/elements/dist/tab-list.js'),
      import('/packages/elements/dist/tab-panel.js'),
      import('/packages/elements/dist/tabs.js'),
    ]);

    return {
      registrations: ['wg-tab', 'wg-tab-list', 'wg-tab-panel', 'wg-tabs'].map(
        (name) => customElements.get(name) !== undefined,
      ),
      text: tabs.textContent,
      visible: tabs.getBoundingClientRect().height > 0,
    };
  });

  expect(result).toEqual({
    registrations: [false, false, false, false],
    text: 'Fallback tabs content',
    visible: true,
  });
});

async function openTabs(page: import('@playwright/test').Page) {
  await page.goto('/tests/browser/tabs/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-tabs') !== undefined &&
      document.querySelector('#automatic-tabs')?.getAttribute('value') === 'access' &&
      document.querySelectorAll('#automatic-tabs [role="tabpanel"]:not([hidden])').length === 1,
  );
}

test.beforeEach(async ({ page }) => {
  await openTabs(page);
});

test('exposes one named tablist with paired tab and panel semantics', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Operational functions' });
  const access = page.getByRole('tab', { name: 'Access', exact: true });
  const communications = page.getByRole('tab', { name: /Communications Caution · Data stale/ });
  const accessPanel = page.getByRole('tabpanel', { name: 'Access', exact: true });

  await expect(list).toBeVisible();
  await expect(access).toHaveAttribute('aria-selected', 'true');
  await expect(access).toHaveAttribute('tabindex', '0');
  await expect(communications).toHaveAttribute('aria-selected', 'false');
  await expect(communications).toHaveAttribute('tabindex', '-1');
  await expect(accessPanel).toBeVisible();

  const relationship = await access.evaluate((element) => ({
    controls: element.getAttribute('aria-controls'),
    id: element.id,
  }));
  await expect(accessPanel).toHaveAttribute('id', relationship.controls!);
  await expect(accessPanel).toHaveAttribute('aria-labelledby', relationship.id);
  await expect(page.getByRole('tabpanel', { name: /Communications/ })).toBeHidden();
});

test('shows keyboard focus and moves from the selected tab into its panel', async ({ page }) => {
  const access = page.getByRole('tab', { name: 'Access', exact: true });
  const accessPanel = page.getByRole('tabpanel', { name: 'Access', exact: true });

  await access.focus();
  await expect(access).toBeFocused();

  const focusStyle = await access.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(focusStyle.outlineStyle).not.toBe('none');
  expect(focusStyle.outlineWidth).toBeGreaterThan(0);

  await page.keyboard.press('Tab');
  await expect(accessPanel).toBeFocused();
});

test('uses automatic horizontal navigation, wrapping, disabled skipping, and RTL mapping', async ({
  page,
}) => {
  const tabs = page.locator('#automatic-tabs');
  const access = page.getByRole('tab', { name: 'Access', exact: true });
  const communications = page.getByRole('tab', { name: /Communications/ });
  const processing = page.getByRole('tab', { name: /Processing/ });

  await tabs.evaluate((element) => {
    const changes: unknown[] = [];
    (element as HTMLElement & { changes?: unknown[] }).changes = changes;
    element.addEventListener('wg-tab-change', (event) => {
      changes.push((event as CustomEvent).detail);
    });
  });

  await access.focus();
  await page.keyboard.press('ArrowRight');
  await expect(communications).toBeFocused();
  await expect(tabs).toHaveAttribute('value', 'communications');

  await page.keyboard.press('ArrowRight');
  await expect(processing).toBeFocused();
  await expect(tabs).toHaveAttribute('value', 'processing');

  await page.keyboard.press('ArrowRight');
  await expect(access).toBeFocused();
  await expect(tabs).toHaveAttribute('value', 'access');

  await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'));
  await page.keyboard.press('ArrowLeft');
  await expect(communications).toBeFocused();
  await expect(tabs).toHaveAttribute('value', 'communications');

  const changes = await tabs.evaluate(
    (element) => (element as HTMLElement & { changes?: unknown[] }).changes,
  );
  expect(changes).toEqual([
    { previousValue: 'access', trigger: 'keyboard', value: 'communications' },
    { previousValue: 'communications', trigger: 'keyboard', value: 'processing' },
    { previousValue: 'processing', trigger: 'keyboard', value: 'access' },
    { previousValue: 'access', trigger: 'keyboard', value: 'communications' },
  ]);
});

test('separates focus from selection in manual vertical activation', async ({ page }) => {
  const tabs = page.locator('#manual-tabs');
  const overview = page.getByRole('tab', { name: 'Overview', exact: true });
  const security = page.getByRole('tab', { name: 'Security', exact: true });

  await overview.focus();
  await page.keyboard.press('ArrowDown');
  await expect(security).toBeFocused();
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await expect(security).toHaveAttribute('aria-selected', 'false');
  await expect(tabs).toHaveAttribute('value', 'overview');

  await page.keyboard.press('Enter');
  await expect(security).toHaveAttribute('aria-selected', 'true');
  await expect(tabs).toHaveAttribute('value', 'security');
  await expect(page.getByRole('tabpanel', { name: 'Security' })).toBeVisible();

  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'History' })).toBeFocused();
  await expect(tabs).toHaveAttribute('value', 'security');

  await page.keyboard.press('Home');
  await expect(overview).toBeFocused();
  await expect(tabs).toHaveAttribute('value', 'security');

  await page.keyboard.press('Space');
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await expect(tabs).toHaveAttribute('value', 'overview');
});

test('emits one pointer change and keeps programmatic selection silent and focus-stable', async ({
  page,
}) => {
  const tabs = page.locator('#automatic-tabs');
  const processing = page.getByRole('tab', { name: /Processing/ });

  await tabs.evaluate((element) => {
    document.documentElement.dataset.changeCount = '0';
    element.addEventListener('wg-tab-change', () => {
      const count = Number(document.documentElement.dataset.changeCount);
      document.documentElement.dataset.changeCount = String(count + 1);
    });
  });

  await processing.click();
  await expect(processing).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('data-change-count', '1');

  await tabs.evaluate((element) => {
    (element as HTMLElement & { value: string }).value = 'communications';
  });
  await expect(tabs).toHaveAttribute('value', 'communications');
  await expect(processing).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('data-change-count', '1');
});

test('normalizes invalid coordinator variants', async ({ page }) => {
  const tabs = page.locator('#automatic-tabs');

  await tabs.evaluate((element) => {
    element.setAttribute('activation', 'lazy');
    element.setAttribute('orientation', 'diagonal');
  });

  await expect(tabs).toHaveAttribute('activation', 'automatic');
  await expect(tabs).toHaveAttribute('orientation', 'horizontal');
  await expect(tabs.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
});

test('excludes invalid entries and preserves a dynamically added pair when reordered', async ({
  page,
}) => {
  const tabs = page.locator('#automatic-tabs');

  await tabs.evaluate((element) => {
    const list = element.querySelector('wg-tab-list')!;
    const orphan = document.createElement('wg-tab');
    orphan.setAttribute('value', 'orphan');
    orphan.textContent = 'Orphan';
    list.append(orphan);
  });

  const orphan = tabs.locator('wg-tab[value="orphan"]');
  await expect(orphan).toBeHidden();
  await expect(orphan).not.toHaveAttribute('aria-controls', /.+/);
  await expect(tabs).toHaveAttribute('value', 'access');

  await tabs.evaluate((element) => {
    element.querySelector('wg-tab[value="orphan"]')?.remove();

    const list = element.querySelector('wg-tab-list')!;
    const tab = document.createElement('wg-tab');
    tab.setAttribute('value', 'diagnostics');
    tab.textContent = 'Diagnostics';

    const panel = document.createElement('wg-tab-panel');
    panel.setAttribute('value', 'diagnostics');
    panel.textContent = 'Diagnostics content';

    list.append(tab);
    element.append(panel);
  });

  const diagnostics = page.getByRole('tab', { name: 'Diagnostics' });
  await expect(diagnostics).toBeVisible();
  await expect(diagnostics).toHaveAttribute('aria-controls', /.+/);
  await diagnostics.click();
  await expect(tabs).toHaveAttribute('value', 'diagnostics');
  await expect(page.getByRole('tabpanel', { name: 'Diagnostics' })).toBeVisible();

  await diagnostics.evaluate((tab) => tab.parentElement!.prepend(tab));
  await expect(diagnostics).toBeFocused();
  await expect(diagnostics).toHaveAttribute('aria-selected', 'true');
  await expect(tabs).toHaveAttribute('value', 'diagnostics');
});

test('falls forward and restores focus when the selected pair is removed', async ({ page }) => {
  const tabs = page.locator('#automatic-tabs');
  const communications = page.getByRole('tab', { name: /Communications/ });
  const retry = page.getByRole('button', { name: 'Retry Communications link' });

  await communications.click();
  await retry.focus();
  await expect(retry).toBeFocused();

  await tabs.evaluate((element) => {
    element.querySelector('wg-tab[value="communications"]')?.remove();
    element.querySelector('wg-tab-panel[value="communications"]')?.remove();
  });

  const processing = page.getByRole('tab', { name: /Processing/ });
  await expect(tabs).toHaveAttribute('value', 'processing');
  await expect(processing).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: /Processing/ })).toBeVisible();
});

test('falls back without moving unrelated focus when selection is disabled', async ({ page }) => {
  const tabs = page.locator('#automatic-tabs');
  const processing = page.getByRole('tab', { name: /Processing/ });
  const heading = page.getByRole('heading', { name: 'Selection foundation' });

  await processing.click();
  await heading.evaluate((element) => {
    element.tabIndex = 0;
    element.focus();
  });

  await processing.evaluate((element) => element.setAttribute('disabled', ''));
  await expect(tabs).toHaveAttribute('value', 'communications');
  await expect(heading).toBeFocused();
});

test('preserves selection and focus during remote panel-content updates', async ({ page }) => {
  const tabs = page.locator('#automatic-tabs');
  const retry = page.getByRole('button', { name: 'Review Access policy' });

  await retry.focus();
  await page
    .locator('#automatic-tabs wg-tab-panel[value="access"]')
    .evaluate((panel) => panel.append(document.createTextNode(' Remote state refreshed.')));

  await expect(tabs).toHaveAttribute('value', 'access');
  await expect(retry).toBeFocused();
});

test('keeps tabs touch-sized and removes transitions for reduced motion', async ({ page }) => {
  const targets = await page.locator('#automatic-tabs wg-tab').evaluateAll((tabs) =>
    tabs.map((tab) => {
      const bounds = tab.getBoundingClientRect();
      return { height: bounds.height, width: bounds.width };
    }),
  );

  for (const target of targets) {
    expect(target.height).toBeGreaterThanOrEqual(44);
    expect(target.width).toBeGreaterThanOrEqual(44);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-tabs') !== undefined);

  const durations = await page.getByRole('tab', { name: 'Access', exact: true }).evaluate((tab) => {
    const visual = tab.shadowRoot!.querySelector('[part="tab"]')!;
    return getComputedStyle(visual).transitionDuration.split(', ');
  });
  expect(durations.every((duration) => duration === '0s')).toBe(true);
});

test('keeps selection discoverable without page overflow at 200% zoom', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-tabs') !== undefined);

  const access = page.getByRole('tab', { name: 'Access', exact: true });
  await access.focus();
  await page.keyboard.press('End');

  const processing = page.getByRole('tab', { name: /Processing/ });
  await expect(processing).toBeFocused();
  await expect(processing).toHaveAttribute('aria-selected', 'true');

  const layout = await processing.evaluate((tab) => {
    const list = tab.closest('wg-tab-list')!;
    const scroller = list.shadowRoot!.querySelector('[part="list"]')!;
    const tabBounds = tab.getBoundingClientRect();
    const scrollerBounds = scroller.getBoundingClientRect();

    return {
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      selectedWithinScroller:
        tabBounds.left >= scrollerBounds.left - 1 && tabBounds.right <= scrollerBounds.right + 1,
    };
  });

  expect(layout.documentScrollWidth - layout.documentClientWidth).toBeLessThanOrEqual(1);
  expect(layout.selectedWithinScroller).toBe(true);
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in the ${theme} theme`, async ({ page }) => {
    const provider = page.locator('wg-theme-provider');
    await provider.evaluate((element, nextTheme) => {
      element.setAttribute('theme', nextTheme);
    }, theme);
    await expect(provider).toHaveAttribute('data-wg-theme', theme);
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const animations = Array.from(document.querySelectorAll('wg-tab')).flatMap((tab) =>
        Array.from(tab.shadowRoot?.querySelector('[part="tab"]')?.getAnimations() ?? []),
      );
      await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
    });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('retains selected, focus, and relationship semantics in forced colors without Axe violations', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-tabs') !== undefined);

  const access = page.getByRole('tab', { name: 'Access', exact: true });
  await access.focus();
  await expect(access).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Access' })).toBeVisible();

  const forcedColors = await access.evaluate((tab) => {
    const visual = tab.shadowRoot!.querySelector('[part="tab"]')!;
    const selection = tab.shadowRoot!.querySelector('[part="selection"]')!;
    return {
      active: matchMedia('(forced-colors: active)').matches,
      borderStyle: getComputedStyle(visual).borderBlockStartStyle,
      selection: getComputedStyle(selection).backgroundColor,
    };
  });
  expect(forcedColors.active).toBe(true);
  expect(forcedColors.borderStyle).toBe('solid');
  expect(forcedColors.selection).not.toBe('rgba(0, 0, 0, 0)');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
