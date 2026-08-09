import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/react-fixture/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-theme-provider') !== undefined &&
      customElements.get('wg-metric') !== undefined &&
      customElements.get('wg-metric-group') !== undefined &&
      customElements.get('wg-trend-indicator') !== undefined &&
      customElements.get('wg-key-value') !== undefined &&
      customElements.get('wg-telemetry-strip') !== undefined &&
      customElements.get('wg-status-list') !== undefined &&
      customElements.get('wg-status-entry') !== undefined &&
      customElements.get('wg-button') !== undefined &&
      customElements.get('wg-value-tile') !== undefined &&
      customElements.get('wg-tabs') !== undefined &&
      customElements.get('wg-tab-list') !== undefined &&
      customElements.get('wg-tab') !== undefined &&
      customElements.get('wg-tab-panel') !== undefined &&
      customElements.get('wg-toggle') !== undefined &&
      customElements.get('wg-segmented-control') !== undefined &&
      customElements.get('wg-navigation-rail') !== undefined &&
      customElements.get('wg-confirmation-dialog') !== undefined,
  );
});

test('registers wrappers and assigns typed element properties', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-ref-tag', 'wg-button');
  await expect(page.locator('#react-metric')).toHaveJSProperty('condition', 'caution');
  await expect(page.locator('#react-metric')).toHaveJSProperty('knowledge', 'stale');
  await expect(page.locator('#react-metric').getByText('184')).toBeVisible();
  await expect(page.locator('#react-metric-group')).toHaveJSProperty('label', 'React scalar data');
  await expect(page.locator('#react-trended-metric').getByText('Rising')).toBeVisible();
  await expect(page.locator('#react-key-value')).toHaveJSProperty('value', 'Standard review');
  await expect(page.locator('html')).toHaveAttribute(
    'data-telemetry-ref-tag',
    'wg-telemetry-strip',
  );
  await expect(page.locator('#react-telemetry')).toHaveJSProperty('samples', [
    { observedAt: 0, value: 12 },
    { observedAt: 1, value: 16, knowledge: 'inferred' },
    { observedAt: 2, value: null, knowledge: 'unavailable' },
    { observedAt: 3, value: 14 },
  ]);
  await expect(page.getByRole('group', { name: 'React queue depth' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'React delivery sources' })).toBeVisible();
  await expect(page.locator('#react-status-list')).toHaveJSProperty('busy', true);
  await expect(page.locator('#react-status-entry')).toHaveJSProperty('condition', 'caution');
  await expect(page.locator('#react-status-entry')).toHaveJSProperty('knowledge', 'stale');
  await expect(page.locator('#react-status-entry')).toHaveJSProperty('activity', 'pending');
  await expect(page.locator('html')).toHaveAttribute('data-tabs-ref-tag', 'wg-tabs');
  await expect(page.locator('#react-tabs')).toHaveJSProperty('activation', 'automatic');
  await expect(page.locator('#react-tabs')).toHaveJSProperty('orientation', 'horizontal');
  await expect(page.locator('#react-toggle')).toHaveJSProperty('asserted', true);
  await expect(page.locator('#react-segments')).toHaveJSProperty('value', 'compact');
});

test('forwards native events through React props', async ({ page }) => {
  await expect(page.locator('#activation-count')).toHaveText('0');
  await page.locator('#react-button').locator('button').click();
  await expect(page.locator('#activation-count')).toHaveText('1');
});

test('translates typed Custom Events to React callback props', async ({ page }) => {
  await page.locator('#switch-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-resolved-theme', 'wayglass-light');

  await page.getByRole('tab', { name: 'Security' }).click();
  await expect(page.locator('#react-tabs')).toHaveAttribute('data-selected-view', 'security');
  await expect(page.locator('#react-tabs')).toHaveJSProperty('value', 'security');
  await expect(page.locator('html')).toHaveAttribute(
    'data-tab-change',
    JSON.stringify({
      value: 'security',
      previousValue: 'overview',
      trigger: 'pointer',
    }),
  );

  await page.getByRole('switch', { name: 'React notifications' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-toggle-request',
    JSON.stringify({
      requestedAsserted: false,
      confirmedAsserted: true,
      trigger: 'pointer',
    }),
  );

  await page.getByRole('radio', { name: 'Comfortable' }).click();
  await expect(page.locator('#react-segments')).toHaveJSProperty('value', 'comfortable');
  await expect(page.locator('html')).toHaveAttribute(
    'data-segment-change',
    JSON.stringify({
      value: 'comfortable',
      previousValue: 'compact',
      trigger: 'pointer',
    }),
  );
});

test('forwards confirmation methods, refs, and typed action events', async ({ page }) => {
  const trigger = page.locator('#react-confirmation-trigger');
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Disconnect React records?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep React connected' })).toBeFocused();

  await page.getByRole('button', { name: 'Disconnect React records', exact: true }).click();
  await expect(trigger).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute(
    'data-confirmation-close',
    JSON.stringify({ dialogId: 'react-disconnect-source', reason: 'action' }),
  );
  await expect(page.locator('html')).toHaveAttribute(
    'data-confirmation-action',
    JSON.stringify({ dialogId: 'react-disconnect-source' }),
  );
});

test('preserves the production accessibility semantics', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
