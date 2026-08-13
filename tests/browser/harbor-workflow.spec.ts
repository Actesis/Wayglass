import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const harborBaseUrl = 'http://127.0.0.1:6105';

async function openWorkflow(page: import('@playwright/test').Page, scenario = 'steady') {
  const query = new URLSearchParams({
    scenario,
    theme: 'wayglass-dark',
    density: 'compact',
  });
  await page.goto(`${harborBaseUrl}/tasks/HL-317?${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-confirmation-dialog') !== undefined &&
      document.querySelector('main')?.getAttribute('data-route') === 'task',
  );
}

test('confirms exact merge scope and restores focus when the decision is cancelled', async ({
  page,
}) => {
  await openWorkflow(page);
  const invoker = page.getByRole('button', { name: 'Review merge approval for HL-317' });
  await invoker.click();
  const dialog = page.getByRole('dialog', { name: 'Approve merge for HL-317?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/Repository harbor-lab\/dependency-sentinel/)).toBeVisible();
  await expect(page.getByText(/target branch main/)).toBeVisible();
  await expect(page.getByText(/proposed revision deps\/harbor-client-4\.8\.2/)).toBeVisible();
  await expect(page.getByText(/Evidence is 2 minutes old with high confidence/)).toBeVisible();
  await expect(page.getByText(/expires at 2:36 PM MST/)).toBeVisible();
  await expect(page.getByText(/no automatic reversal/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep HL-317 unapproved' }).click();
  await expect(dialog).toBeHidden();
  await expect(invoker).toBeFocused();
  await expect(page.locator('wg-boolean-value[label="Approval granted"]')).not.toHaveAttribute(
    'asserted',
    '',
  );
});

test('keeps pending approval separate and then records a confirmed merge durably', async ({
  page,
}) => {
  await openWorkflow(page);
  await page.getByRole('button', { name: 'Review merge approval for HL-317' }).click();
  const dialog = page.getByRole('dialog', { name: 'Approve merge for HL-317?' });
  await dialog.getByRole('button', { name: 'Approve merge for HL-317' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('wg-button[pending]')).toHaveAttribute('pending', '');
  await expect(page.locator('wg-alert[data-approval-state="pending"]')).toContainText(
    'No merge has occurred',
  );
  await expect(page.locator('wg-key-value[label="Confirmed target result"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
  await expect(page.locator('wg-alert[data-approval-outcome="merged"]')).toContainText(
    'Merge confirmed on the target branch',
  );
  await expect(page.locator('wg-boolean-value[label="Approval granted"]')).toHaveAttribute(
    'asserted',
    '',
  );
  await expect(page.locator('wg-key-value[label="Confirmed target result"]')).toHaveAttribute(
    'value',
    'Merged',
  );
  await expect(page.locator('.harbor-announcement')).toHaveText(
    'Merge confirmed on the target branch.',
  );
});

test('retains not-merged truth through denial and timeout with a fresh decision path', async ({
  page,
}) => {
  for (const scenario of ['approval-denied', 'approval-timeout']) {
    await openWorkflow(page, scenario);
    await expect(page.locator('wg-key-value[label="Confirmed target result"]')).toHaveAttribute(
      'value',
      'Not merged',
    );
    await expect(page.locator('wg-boolean-value[label="Approval granted"]')).not.toHaveAttribute(
      'asserted',
      '',
    );
    await expect(
      page.getByRole('button', { name: 'Request merge approval again for HL-317' }),
    ).toBeEnabled();
  }
  await expect(page.locator('wg-alert[data-approval-outcome="timed-out"]')).toContainText(
    'target branch remains unchanged',
  );
  await expect(page.locator('wg-key-value[label="Approval expiry"]')).toHaveAttribute(
    'value',
    '2:25 PM MST',
  );
});

test('retains failed history and creates a visibly linked retry attempt', async ({ page }) => {
  await openWorkflow(page, 'merge-failed');
  await expect(page.locator('wg-alert[data-approval-outcome="merge-failed"]')).toContainText(
    'merge failed',
  );
  await expect(page.locator('wg-boolean-value[label="Approval granted"]')).toHaveAttribute(
    'asserted',
    '',
  );
  await expect(page.locator('wg-key-value[label="Confirmed target result"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
  await page.getByRole('button', { name: 'Retry HL-317 as a new attempt' }).click();
  await expect(page.locator('wg-key-value[label="Current attempt"]')).toHaveAttribute(
    'value',
    'attempt-hl-317-2',
  );
  await expect(page.locator('wg-key-value[label="Previous attempt"]')).toHaveAttribute(
    'value',
    'attempt-hl-317-1',
  );
  await expect(page.locator('[data-tool-record]').first()).toHaveAttribute(
    'data-tool-record',
    'tool-attempt-hl-317-2-created',
  );
  await expect(page.locator('[data-tool-record]').first()).toContainText('attempt-hl-317-2');
  await expect(page.locator('[data-tool-record]').nth(1)).toContainText('attempt-hl-317-1');
  await expect(page.locator('wg-key-value[label="Task state"]')).toHaveAttribute('value', 'queued');
  await expect(page.locator('wg-boolean-value[label="Approval granted"]')).not.toHaveAttribute(
    'asserted',
    '',
  );
  await expect(page.locator('.harbor-announcement')).toContainText('previous attempt retained');
});

test('records a pause request without claiming the active tool step stopped', async ({ page }) => {
  await openWorkflow(page);
  await page.getByRole('button', { name: 'Request pause for HL-317' }).click();
  await expect(page.locator('wg-alert[data-execution-request="pause"]')).toContainText(
    'active tool step may finish before execution stops',
  );
  await expect(page.locator('wg-key-value[label="Task state"]')).toHaveAttribute(
    'value',
    'blocked',
  );
  await expect(page.locator('wg-key-value[label="Task activity"]')).toHaveAttribute(
    'value',
    'pending',
  );
});

test('records cancellation intent without claiming cancellation is complete', async ({ page }) => {
  await openWorkflow(page);
  await page.getByRole('button', { name: 'Request cancellation for HL-317' }).click();
  await expect(page.locator('wg-alert[data-execution-request="cancel"]')).toContainText(
    'cancellation is not yet confirmed',
  );
  await expect(page.locator('wg-key-value[label="Task state"]')).toHaveAttribute(
    'value',
    'blocked',
  );
  await expect(page.locator('wg-key-value[label="Confirmed target result"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
});

test('contains the merge decision at phone width without accessibility violations', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openWorkflow(page, 'stale-evidence');
  await page.getByRole('button', { name: 'Review merge approval for HL-317' }).click();
  const dialog = page.getByRole('dialog', { name: 'Approve merge for HL-317?' });
  await expect(dialog).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  const actionsFit = await dialog.getByRole('button').evaluateAll((buttons) =>
    buttons.every((button) => {
      const bounds = button.getBoundingClientRect();
      return bounds.height >= 44 && bounds.left >= 0 && bounds.right <= window.innerWidth;
    }),
  );
  expect(actionsFit).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
