import { expect, test, type Page } from '@playwright/test';

const applications = {
  cedar: {
    baseUrl: 'http://127.0.0.1:6103',
    query: 'scenario=steady&theme=wayglass-light&density=comfortable',
    title: 'Whole-home overview',
    functions: 5,
  },
  northline: {
    baseUrl: 'http://127.0.0.1:6104',
    query: 'scenario=stale-trailer&theme=wayglass-light&density=compact',
    title: 'Outbound readiness',
    functions: 4,
  },
  harbor: {
    baseUrl: 'http://127.0.0.1:6105',
    query: 'scenario=stale-evidence&theme=wayglass-light&density=compact',
    title: 'Supervision overview',
    functions: 4,
  },
} as const;

async function open(page: Page, baseUrl: string, path: string, query: string) {
  await page.goto(`${baseUrl}${path}?${query}`);
  await page.waitForFunction(() => customElements.get('wg-panel') !== undefined);
}

test('keeps each application oriented around a distinct domain task and information architecture', async ({
  page,
}) => {
  for (const application of Object.values(applications)) {
    await open(page, application.baseUrl, '/', application.query);
    await expect(page.getByRole('heading', { name: application.title, level: 1 })).toBeVisible();
    await expect(page.locator('[data-function]')).toHaveCount(application.functions);
    await expect(page.locator('main > header + section').first()).toBeVisible();
    await expect(page.locator('p[aria-live="polite"]')).toHaveCount(1);
  }
});

test('uses the same asserted Boolean contract for unrelated domain values', async ({ page }) => {
  await open(page, applications.cedar.baseUrl, '/functions/lighting', applications.cedar.query);
  const porch = page.locator('wg-boolean-value[label="Porch light"]');
  await expect(porch).not.toHaveAttribute('asserted', '');
  await expect(porch).toHaveAttribute('not-asserted-label', 'Off');

  await open(
    page,
    applications.northline.baseUrl,
    '/loads/NL-2048',
    'scenario=hold-confirmed&theme=wayglass-light&density=compact',
  );
  const hold = page.locator('wg-boolean-value[label="Dispatch hold"]').first();
  await expect(hold).toHaveAttribute('asserted', '');
  await expect(hold).toHaveAttribute('asserted-label', 'Applied');

  await open(
    page,
    applications.harbor.baseUrl,
    '/tasks/HL-317',
    'scenario=merge-confirmed&theme=wayglass-light&density=compact',
  );
  const approval = page.locator('wg-boolean-value[label="Approval granted"]');
  await expect(approval).toHaveAttribute('asserted', '');
  await expect(approval).toHaveAttribute('asserted-label', 'Granted');
});

test('keeps condition, knowledge, and activity as independent axes', async ({ page }) => {
  await open(
    page,
    applications.cedar.baseUrl,
    '/functions/comfort',
    'scenario=stale&theme=wayglass-light&density=comfortable',
  );
  await expect(page.locator('wg-key-value[label="Air quality reading"]')).toHaveAttribute(
    'knowledge',
    'stale',
  );
  await expect(page.locator('wg-status-indicator[label="Air handler available"]')).toHaveAttribute(
    'condition',
    'positive',
  );

  await open(page, applications.northline.baseUrl, '/', applications.northline.query);
  const loadEvidence = page.locator(
    'wg-status-indicator[label="NL-2048 trailer observation requires review"]',
  );
  await expect(loadEvidence).toHaveAttribute('condition', 'caution');
  await expect(loadEvidence).toHaveAttribute('knowledge', 'stale');

  await open(page, applications.harbor.baseUrl, '/', applications.harbor.query);
  const decisionEvidence = page.locator(
    'wg-status-indicator[label="HL-317 merge decision required"]',
  );
  await expect(decisionEvidence).toHaveAttribute('condition', 'caution');
  await expect(decisionEvidence).toHaveAttribute('knowledge', 'stale');
  await expect(page.getByText(/Worker completion or availability does not confirm/)).toBeVisible();
});

test('preserves shared section purposes while allowing distinct brand geometry', async ({
  page,
}) => {
  const radii: number[] = [];
  for (const application of Object.values(applications)) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, application.baseUrl, '/', application.query);
    await expect(page.locator('wg-panel[purpose="information"]').first()).toBeVisible();
    await expect(page.locator('wg-panel[purpose="monitor"]').first()).toBeVisible();
    radii.push(
      await page
        .locator('[data-function]')
        .first()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).borderStartStartRadius)),
    );
  }

  expect(new Set(radii).size).toBe(3);

  await open(page, applications.harbor.baseUrl, '/', applications.harbor.query);
  const harborColumns = await page
    .locator('.harbor-function-grid')
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(harborColumns).toBe(4);
  const reviewWidth = await page
    .locator('[data-function="review-approval"]')
    .evaluate((element) => element.getBoundingClientRect().width);
  const intakeWidth = await page
    .locator('[data-function="work-intake"]')
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(reviewWidth).toBeGreaterThan(intakeWidth * 1.8);
});
