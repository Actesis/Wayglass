import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const harborBaseUrl = 'http://127.0.0.1:6105';

async function openTask(
  page: import('@playwright/test').Page,
  parameters: Record<string, string> = {},
) {
  const query = new URLSearchParams({
    scenario: 'stale-evidence',
    theme: 'wayglass-dark',
    density: 'compact',
    ...parameters,
  });
  await page.goto(`${harborBaseUrl}/tasks/HL-317?${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-event-log') !== undefined &&
      document.querySelector('main')?.getAttribute('data-route') === 'task',
  );
}

test('separates evidence provenance, freshness, confidence, activity, and merge truth', async ({
  page,
}) => {
  await openTask(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Task HL-317' })).toBeVisible();
  await expect(page.locator('wg-key-value[label="Evidence source"]')).toHaveAttribute(
    'value',
    'Synthetic evidence bundle 8841',
  );
  await expect(page.locator('wg-key-value[label="Evidence age"]')).toHaveAttribute(
    'value',
    '10 minutes',
  );
  await expect(page.locator('wg-key-value[label="Freshness policy"]')).toHaveAttribute(
    'value',
    '5 minutes maximum',
  );
  await expect(page.locator('wg-key-value[label="Outcome confidence"]')).toHaveAttribute(
    'value',
    'high',
  );
  await expect(page.locator('wg-key-value[label="Worker activity"]')).toHaveAttribute(
    'value',
    'waiting',
  );
  await expect(page.locator('wg-key-value[label="Confirmed merge state"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
  await expect(
    page.getByText(/do not establish that the proposed revision is correct/),
  ).toBeVisible();
});

test('presents retained task and tool records newest first without announcing each record', async ({
  page,
}) => {
  await openTask(page);
  const records = page.locator('[data-tool-record]');
  await expect(records).toHaveCount(4);
  await expect(records.nth(0)).toHaveAttribute('data-tool-record', 'tool-hl-317-tests');
  await expect(records.nth(3)).toHaveAttribute('data-tool-record', 'tool-hl-317-intake');
  await expect(page.getByText('Newest retained record first')).toBeVisible();
  await expect(page.locator('wg-event-log [aria-live]')).toHaveCount(0);
  await expect(page.locator('.harbor-announcement[aria-live="polite"]')).toHaveCount(1);
});

test('adds a meaningful tool update while retaining prior record identity and confirmed truth', async ({
  page,
}) => {
  await openTask(page, { scenario: 'new-tool-record' });
  const records = page.locator('[data-tool-record]');
  await expect(records).toHaveCount(5);
  await expect(records.nth(0)).toHaveAttribute('data-tool-record', 'tool-hl-317-policy');
  await expect(records.nth(1)).toHaveAttribute('data-tool-record', 'tool-hl-317-tests');
  await expect(page.locator('wg-key-value[label="Confirmed merge state"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
  await expect(page.locator('.harbor-announcement')).toBeEmpty();
});

test('keeps unavailable worker context independent from task evidence and outcome', async ({
  page,
}) => {
  await openTask(page, { scenario: 'unavailable' });
  await expect(page.locator('wg-key-value[label="Worker availability"]')).toHaveAttribute(
    'value',
    'unavailable',
  );
  await expect(page.locator('wg-key-value[label="Evidence age"]')).toHaveAttribute(
    'value',
    '2 minutes',
  );
  await expect(page.locator('wg-key-value[label="Confirmed merge state"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
});

test('claims no investigation records during initial loading', async ({ page }) => {
  await openTask(page, { scenario: 'initial-loading' });
  await expect(
    page.getByText('Loading task records; no evidence, approval, or merge result is claimed.'),
  ).toBeVisible();
  await expect(page.locator('wg-event-log')).toHaveCount(0);
  await expect(page.locator('[data-tool-record]')).toHaveCount(0);
});

test('contains the phone investigation and passes automated accessibility checks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openTask(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(
    page.getByRole('link', { name: 'Back to Review and approval' }).first(),
  ).toBeVisible();
  await expect(page.locator('[data-tool-record]')).toHaveCount(4);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
