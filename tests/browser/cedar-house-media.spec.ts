import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const cedarBaseUrl = 'http://127.0.0.1:6103';

async function openAirHandler(page: import('@playwright/test').Page, scenario = 'maintenance-due') {
  const query = new URLSearchParams({
    scenario,
    theme: 'wayglass-dark',
    density: 'comfortable',
  });
  await page.goto(`${cedarBaseUrl}/assets/hvac-air-handler?${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-media-viewer') !== undefined &&
      document.querySelector<HTMLImageElement>('.cedar-asset-figure img')?.complete === true,
  );
}

test('keeps equipment identity, condition, instructions, and history outside the photograph', async ({
  page,
}) => {
  await openAirHandler(page);

  await expect(page.getByRole('heading', { name: 'HVAC air handler', level: 1 })).toBeVisible();
  await expect(
    page
      .getByRole('img', {
        name: /Tall gray air handler in a utility closet with the return filter visible/,
      })
      .first(),
  ).toBeVisible();
  await expect(page.getByText('Louvered utility closet', { exact: true })).toBeVisible();
  await expect(page.getByText('Lower front slot', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Replace the return filter' })).toBeVisible();
  await expect(page.getByText(/Note the existing airflow-arrow direction/)).toBeVisible();
  await expect(page.locator('wg-status-indicator[label="HVAC return filter due"]')).toHaveAttribute(
    'condition',
    'caution',
  );
  await expect(page.getByRole('list', { name: 'Maintenance history' })).toBeVisible();
  await expect(page.getByText('Resident recorded · not sensor verified').first()).toBeVisible();
});

test('opens focused media inspection and returns focus to its explicit invoker', async ({
  page,
}) => {
  await openAirHandler(page);

  const trigger = page.getByRole('button', { name: 'Inspect full-size air-handler photo' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Cedar House air handler' });
  await expect(dialog).toBeVisible();
  await expect(page.getByText('Utility closet · lower front return-filter slot')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Actual size' })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Actual size' }).click();
  await expect(dialog.getByRole('button', { name: 'Actual size' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await dialog.getByRole('button', { name: 'Close air-handler photo' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('preserves nonvisual identification and the workflow when media is unavailable', async ({
  page,
}) => {
  await openAirHandler(page, 'media-unavailable');

  await expect(page.locator('wg-media')).toHaveAttribute('state', 'unavailable');
  await expect(
    page.getByText(/Photo unavailable. Find the tall gray air-handler cabinet/),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Inspect full-size air-handler photo' }),
  ).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Replace the return filter' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Record filter replaced' })).toBeVisible();
});

test('shows stable loading media without hiding identity or instructions', async ({ page }) => {
  await openAirHandler(page, 'media-loading');

  await expect(page.locator('wg-media')).toHaveAttribute('state', 'loading');
  await expect(page.getByText(/Loading the equipment photo/)).toBeVisible();
  await expect(page.getByText('Louvered utility closet', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Replace the return filter' })).toBeVisible();
});

test('records resident evidence without implying sensor verification', async ({ page }) => {
  await openAirHandler(page);

  const trigger = page.getByRole('button', { name: 'Record filter replaced' });
  await trigger.click();
  const dialog = page.getByRole('dialog', {
    name: 'Record the Cedar House filter replacement?',
  });
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/does not represent sensor verification/)).toBeVisible();
  await page.getByRole('button', { name: 'Do not record' }).click();
  await expect(trigger).toBeFocused();
  await expect(page.locator('wg-status-indicator[label="HVAC return filter due"]')).toBeVisible();

  await trigger.click();
  await page.getByRole('button', { name: 'Record filter replaced', exact: true }).last().click();
  await expect(
    page.locator('wg-status-indicator[label="Filter replacement recorded"]'),
  ).toHaveAttribute('condition', 'positive');
  await expect(page.getByRole('button', { name: 'Filter replacement recorded' })).toBeDisabled();
  await expect(page.locator('.cedar-history li').first()).toContainText(
    'HVAC return filter replaced',
  );
  await expect(page.locator('.cedar-announcement')).toHaveText(
    'Filter replacement recorded for Cedar House. This is a resident record, not sensor verification.',
  );
});

test('contains the asset workflow at phone width and passes an automated accessibility scan', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openAirHandler(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  const trigger = page.getByRole('button', { name: 'Inspect full-size air-handler photo' });
  await expect(trigger).toBeVisible();
  expect((await trigger.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
