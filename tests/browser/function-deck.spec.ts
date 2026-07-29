import { expect, test } from '@playwright/test';

async function openFunctionDeck(
  page: import('@playwright/test').Page,
  parameters = 'width=desktop&theme=wayglass-dark',
) {
  await page.goto(`/tests/browser/function-deck/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-tabs') !== undefined &&
      document.querySelector('wg-tabs')?.getAttribute('value') === 'access',
  );
}

test.beforeEach(async ({ page }) => {
  await openFunctionDeck(page);
});

test('composes one focused function surface directly from tabs', async ({ page }) => {
  await expect(page.getByRole('tablist', { name: 'Operational functions' })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Access Positive · Confirmed/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('region', { name: 'Access', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Communications', exact: true })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Processing', exact: true })).toBeHidden();

  expect(await page.evaluate(() => customElements.get('wg-function-deck') !== undefined)).toBe(
    false,
  );
  await expect(page.locator('wg-function-deck')).toHaveCount(0);
});

test('uses wg-tabs as the only selection owner', async ({ page }) => {
  const tabs = page.locator('wg-tabs');
  const communications = page.getByRole('tab', {
    name: /Communications Caution · Data stale · Backup unavailable · Retry available/,
  });

  await communications.click();

  await expect(tabs).toHaveAttribute('value', 'communications');
  await expect(communications).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('region', { name: 'Communications', exact: true })).toBeVisible();
  await expect(page.getByText('Selected function: Communications', { exact: true })).toBeVisible();
});

test('keeps explicit consequential state labels visible for hidden functions', async ({ page }) => {
  const communications = page.getByRole('tab', {
    name: /Communications Caution · Data stale · Backup unavailable · Retry available/,
  });
  const processing = page.getByRole('tab', {
    name: /Processing Critical · Pause pending/,
  });

  await expect(communications).toContainText('Caution');
  await expect(communications).toContainText('Data stale');
  await expect(communications).toContainText('Backup unavailable');
  await expect(processing).toContainText('Critical');
  await expect(processing).toContainText('Pause pending');

  await expect(page.getByRole('region', { name: 'Communications', exact: true })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Processing', exact: true })).toBeHidden();
});

test('keeps a critical response path available outside the tablist', async ({ page }) => {
  const tabs = page.locator('wg-tabs');
  const processing = page.getByRole('tab', {
    name: /Processing Critical · Pause pending/,
  });
  const criticalResponse = page.locator('.wg-function-deck__critical-response');

  await expect(criticalResponse).toContainText('Critical response · Processing intake');
  await expect(criticalResponse).toContainText('Critical · Pause request pending');
  await expect(criticalResponse).toContainText('Confirmed gate remains Open');
  await expect(processing).toHaveAttribute('aria-selected', 'false');

  await tabs.evaluate((element) => {
    element.setAttribute('data-change-count', '0');
    element.addEventListener('wg-tab-change', () => {
      const count = Number(element.getAttribute('data-change-count') ?? '0');
      element.setAttribute('data-change-count', String(count + 1));
    });
  });

  await criticalResponse.getByRole('button', { name: 'Open Processing response' }).click();

  await expect(tabs).toHaveAttribute('value', 'processing');
  await expect(tabs).toHaveAttribute('data-change-count', '0');
  await expect(processing).toHaveAttribute('aria-selected', 'true');
  await expect(processing).toBeFocused();
  await expect(page.getByRole('region', { name: 'Processing', exact: true })).toBeVisible();
  await expect(page.getByText('Selected function: Processing', { exact: true })).toBeVisible();
});

test('keeps function identity and order aligned with the overview composition', async ({
  page,
}) => {
  const focusedFunctions = await page.locator('wg-tab').evaluateAll((tabs) =>
    tabs.map((tab) => {
      const summary = tab.querySelector('[slot="summary"]')?.textContent ?? '';

      return {
        value: tab.getAttribute('value'),
        label: tab.textContent?.replace(summary, '').trim(),
      };
    }),
  );

  await page.goto('/tests/browser/operations-overview/?width=desktop&theme=wayglass-dark');
  await page.waitForFunction(() => document.querySelectorAll('[data-function]').length === 3);

  const overviewFunctions = await page.locator('[data-function]').evaluateAll((functions) =>
    functions.map((functionElement) => ({
      value: functionElement.getAttribute('data-function'),
      label: functionElement.querySelector('h2')?.textContent?.trim(),
    })),
  );

  expect(overviewFunctions).toEqual(focusedFunctions);
});

test('does not repurpose elbow geometry as a nested selector', async ({ page }) => {
  await expect(page.locator('.wg-function-deck wg-elbow')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Access', level: 2 })).toBeVisible();
  await expect(page.locator('.wg-function-deck [aria-selected]')).toHaveCount(3);
  await expect(page.locator('.wg-function-deck [aria-selected]:not(wg-tab)')).toHaveCount(0);
});

test('provides a phone fixture without page overflow or lost summaries', async ({ page }) => {
  await openFunctionDeck(page, 'width=phone&theme=wayglass-dark');

  const viewport = page.locator('[data-function-deck-width="phone"]');
  const tabList = page.getByRole('tablist', { name: 'Operational functions' });

  await expect(viewport.locator('wg-theme-provider')).toHaveAttribute('density', 'compact');
  await expect(page.getByRole('tab', { name: /Access Positive · Confirmed/ })).toBeVisible();
  await expect(
    page.getByRole('tab', {
      name: /Communications Caution · Data stale · Backup unavailable · Retry available/,
    }),
  ).toBeAttached();
  await expect(
    page.getByRole('tab', { name: /Processing Critical · Pause pending/ }),
  ).toBeAttached();

  const overflow = await viewport.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const tabStrip = await tabList.evaluate((element) => ({
    clientWidth:
      element.shadowRoot?.querySelector<HTMLElement>('[part="list"]')?.clientWidth ??
      element.clientWidth,
    scrollWidth:
      element.shadowRoot?.querySelector<HTMLElement>('[part="list"]')?.scrollWidth ??
      element.scrollWidth,
    tabWidths: Array.from(
      element.querySelectorAll('wg-tab'),
      (tab) => tab.getBoundingClientRect().width,
    ),
  }));
  expect(tabStrip.scrollWidth).toBeGreaterThan(tabStrip.clientWidth);
  expect(tabStrip.tabWidths.every((width) => width >= 120)).toBeTruthy();
});

test('provides a desktop fixture with compact focused content', async ({ page }) => {
  const viewport = page.locator('[data-function-deck-width="desktop"]');

  await expect(viewport).toBeVisible();
  await expect(viewport.locator('wg-theme-provider')).toHaveAttribute('density', 'compact');
  await expect(
    page.locator('[data-function="access"] wg-status-indicator').first(),
  ).toHaveAttribute('size', 'compact');
  await expect(page.locator('[data-function="access"] wg-boolean-value')).toHaveAttribute(
    'presentation',
    'rail',
  );
});

test('provides a wall-display fixture with prominent semantic signals', async ({ page }) => {
  await openFunctionDeck(page, 'width=wall&theme=wayglass-dark');

  const viewport = page.locator('[data-function-deck-width="wall"]');

  await expect(viewport.locator('wg-theme-provider')).toHaveAttribute('density', 'comfortable');
  await expect(
    viewport.locator('.wg-function-deck__critical-response wg-status-indicator'),
  ).toHaveAttribute('size', 'prominent');
  await expect(
    viewport.locator('[data-function="access"] wg-status-indicator').first(),
  ).toHaveAttribute('size', 'prominent');
  await expect(viewport.locator('[data-function="access"] wg-boolean-value')).toHaveAttribute(
    'presentation',
    'field',
  );
});
