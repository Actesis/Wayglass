import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the browser accessibility harness detects no violations in a known-good fixture', async ({
  page,
}) => {
  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <head><title>Wayglass accessibility fixture</title></head>
      <body>
        <main>
          <h1>System condition</h1>
          <p><strong>Status:</strong> Normal</p>
          <button type="button">View details</button>
        </main>
      </body>
    </html>
  `);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
