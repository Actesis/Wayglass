import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const cedarBaseUrl = 'http://127.0.0.1:6103';

async function openCedarControl(
  page: import('@playwright/test').Page,
  route: 'access' | 'lighting',
  scenario = 'steady',
) {
  const query = new URLSearchParams({
    scenario,
    theme: 'wayglass-dark',
    density: 'comfortable',
  });
  await page.goto(`${cedarBaseUrl}/functions/${route}?${query}`);
  await page.waitForFunction(() => customElements.get('wg-confirmation-dialog') !== undefined);
}

test('keeps the confirmed porch-light value while a routine request is pending', async ({
  page,
}) => {
  await openCedarControl(page, 'lighting');

  const porch = page.locator('wg-boolean-value[label="Porch light"]');
  const request = page.locator('.cedar-control-result');
  const action = page.getByRole('button', { name: 'Turn porch light on' });
  const actionHost = page.locator('wg-button').filter({ hasText: 'Turn porch light on' });

  await expect(porch).not.toHaveAttribute('asserted');
  await action.click();
  await expect(request).toHaveAttribute('data-request-state', 'pending');
  await expect(request).toContainText('confirmed value has not changed');
  await expect(porch).not.toHaveAttribute('asserted');
  await expect(actionHost).toHaveAttribute('pending', '');
  await expect(
    page
      .getByRole('navigation', { name: 'Household functions' })
      .getByText(/Porch request pending/),
  ).toBeVisible();

  await expect(request).toHaveAttribute('data-request-state', 'succeeded');
  await expect(request).toContainText('Porch light confirmed on');
  await expect(porch).toHaveAttribute('asserted', '');
  await expect(page.locator('.cedar-announcement')).toHaveText('Porch light confirmed on.');
});

test('retains confirmed truth and offers a durable result after a failed lighting request', async ({
  page,
}) => {
  await openCedarControl(page, 'lighting', 'request-failed');

  await page.getByRole('button', { name: 'Turn porch light on' }).click();
  const result = page.locator('.cedar-control-result');
  await expect(result).toHaveAttribute('data-request-state', 'failed');
  await expect(result).toContainText('Porch light did not change. It remains off.');
  await expect(page.locator('wg-boolean-value[label="Porch light"]')).not.toHaveAttribute(
    'asserted',
  );
  await expect(page.locator('.cedar-announcement')).toHaveText(
    'Porch light did not change. It remains off.',
  );
});

test('names secure-house scope, cancels safely, restores focus, and retains a partial result', async ({
  page,
}) => {
  await openCedarControl(page, 'access', 'secure-partial');

  const trigger = page.getByRole('button', { name: 'Secure Cedar House' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Secure Cedar House?' });
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/front door lock and garage door for Cedar House/)).toBeVisible();
  await expect(page.getByText(/Current exception: Garage door is open/)).toBeVisible();
  await page.getByRole('button', { name: 'Keep current access state' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole('button', { name: 'Secure Cedar House', exact: true }).last().click();
  const result = page.locator('.cedar-control-result');
  await expect(result).toHaveAttribute('data-request-state', 'pending');
  await expect(page.locator('wg-boolean-value[label="Garage door"]')).not.toHaveAttribute(
    'asserted',
  );
  await expect(result).toHaveAttribute('data-request-state', 'partial');
  await expect(result).toContainText('garage door remains unresolved');
  await expect(page.locator('.cedar-announcement')).toHaveText(
    'Cedar House was partially secured. The garage door remains unresolved.',
  );
});

test('shows permission denial without implying a secure-house request succeeded', async ({
  page,
}) => {
  await openCedarControl(page, 'access', 'permission-denied');

  await page.getByRole('button', { name: 'Secure Cedar House' }).click();
  await page.getByRole('button', { name: 'Secure Cedar House', exact: true }).last().click();
  const result = page.locator('.cedar-control-result');
  await expect(result).toHaveAttribute('data-request-state', 'denied');
  await expect(result).toContainText('Permission is required');
  await expect(result).toContainText('confirmed access state is unchanged');
});

test('contains the consequential workflow and touch targets at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openCedarControl(page, 'access', 'secure-partial');

  await page.getByRole('button', { name: 'Secure Cedar House' }).click();
  const dialog = page.getByRole('dialog', { name: 'Secure Cedar House?' });
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
});

test('has no automatically detectable accessibility violations with confirmation open', async ({
  page,
}) => {
  await openCedarControl(page, 'access', 'unavailable');
  await page.getByRole('button', { name: 'Secure Cedar House' }).click();
  await expect(page.getByText(/cannot currently confirm a result/)).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
