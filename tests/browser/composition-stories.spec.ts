import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Fixture = 'workspace' | 'feedback' | 'no-matches';

async function openCompositionStory(
  page: import('@playwright/test').Page,
  options: {
    fixture?: Fixture;
    width?: 'phone' | 'desktop' | 'wall';
    theme?: 'wayglass-dark' | 'wayglass-light';
    density?: 'compact' | 'comfortable';
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    fixture: options.fixture ?? 'workspace',
    width: options.width ?? 'desktop',
    theme: options.theme ?? 'wayglass-dark',
    density: options.density ?? 'compact',
  });
  await page.goto(`/tests/browser/composition-stories/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-filter-bar') !== undefined &&
      customElements.get('wg-command-bar') !== undefined &&
      document.querySelector('wg-event-log, wg-alert, wg-empty-state')?.shadowRoot !== null,
  );
}

test('renders production-backed collection tools with one result announcement owner', async ({
  page,
}) => {
  await openCompositionStory(page);
  await expect(page.getByRole('region', { name: 'Event filters' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Selected Event record commands' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Filtered operational events' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await expect(page.locator('[aria-live]')).toHaveCount(1);
  await expect(page.locator('wg-command-bar [role="toolbar"]')).toHaveCount(0);
});

test('applies filters without replacing records or moving focus and resets only the draft', async ({
  page,
}) => {
  await openCompositionStory(page);
  await page.locator('#composition-event-03').evaluate((record) => {
    (window as Window & { retainedCompositionRecord?: Element }).retainedCompositionRecord = record;
  });
  await page.getByRole('checkbox', { name: 'Caution' }).check();
  await page.getByRole('combobox', { name: 'Source' }).selectOption('south');
  const submitter = page.getByRole('button', { name: 'Apply Event filters' });
  await submitter.focus();
  await submitter.press('Enter');
  await expect(submitter).toBeFocused();
  await expect(page.getByText('2 filters applied: Caution, South coordination.')).toBeVisible();
  await expect(page.getByText('1 event, filtered from 5.')).toBeVisible();
  await expect(page.locator('wg-event-record:not([hidden])')).toHaveCount(1);
  expect(
    await page
      .locator('#composition-event-03')
      .evaluate(
        (record) =>
          record ===
          (window as Window & { retainedCompositionRecord?: Element }).retainedCompositionRecord,
      ),
  ).toBe(true);

  await page.getByRole('button', { name: 'Reset filter draft' }).click();
  await expect(page.getByText('2 filters applied: Caution, South coordination.')).toBeVisible();
  await expect(page.getByText('1 event, filtered from 5.')).toBeVisible();
  await expect(
    page.getByText('Draft controls reset. Applied filters and results are unchanged.'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByText('No filters applied.')).toBeVisible();
  await expect(page.getByText('5 events, filtered from 5.')).toBeVisible();
  await expect(page.locator('wg-event-record:not([hidden])')).toHaveCount(5);
});

test('keeps command priority visible and moves durable progress outside the command control', async ({
  page,
}) => {
  await openCompositionStory(page);
  const primary = page.getByRole('button', { name: 'Acknowledge 2 selected Event records' });
  const secondary = page.getByRole('button', { name: 'Assign 2 selected Event records' });
  const overflow = page.getByRole('button', { name: 'More selected Event record commands' });
  await expect(primary).toBeVisible();
  await expect(secondary).toBeVisible();
  await expect(overflow).toBeVisible();
  await primary.click();
  await expect(primary).toHaveAttribute('aria-busy', 'true');
  await expect(
    page.getByText('Acknowledging 2 selected Event records. Confirmed record state is unchanged.'),
  ).toBeVisible();
});

test('preserves primary actions and avoids page overflow in the phone composition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openCompositionStory(page, { width: 'phone' });
  await expect(
    page.getByRole('button', { name: 'Acknowledge 2 selected Event records' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test('shows persistent pending, rejection, retry, and unavailable reasons', async ({ page }) => {
  await openCompositionStory(page, { fixture: 'feedback', theme: 'wayglass-light' });
  await expect(
    page.getByRole('progressbar', { name: 'Applying South coordination filter' }),
  ).toBeVisible();
  await expect(
    page.getByText('5 retained events remain valid while the request is pending.'),
  ).toBeVisible();
  await expect(page.getByText('The 2 Event records remain unacknowledged.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Retry acknowledging 2 selected Event records' }),
  ).toBeVisible();
  await expect(page.getByText(/Archive is unavailable while operational review/)).toBeVisible();
});

test('keeps no-match context outside the filter bar with a clear recovery path', async ({
  page,
}) => {
  await openCompositionStory(page, { fixture: 'no-matches' });
  await expect(page.getByText('2 filters applied: Critical, Archive coordination.')).toBeVisible();
  await expect(page.getByText('0 events, filtered from 500.')).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'No events match Critical and Archive coordination' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear Event filters' })).toBeVisible();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes production composition accessibility checks in ${theme}`, async ({ page }) => {
    await openCompositionStory(page, { theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
