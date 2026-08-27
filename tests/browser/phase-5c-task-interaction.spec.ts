import { expect, test, type Locator, type Page } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';
const sampleCount = 2_880;
const sampleInterval = 30_000;
const windowStart = Date.UTC(2026, 7, 18, 0, 0, 0);
const svgPlotStart = 80;
const svgPlotEnd = 976;

type AdapterName = 'native' | 'uplot' | 'd3';

const adapters: ReadonlyArray<{ name: AdapterName; selector: string }> = [
  { name: 'native', selector: '.p5c-native' },
  { name: 'uplot', selector: '.p5c-uplot' },
  { name: 'd3', selector: '.p5c-d3' },
];

async function selectSeries(adapter: Locator, currentIndex: number, targetIndex: number) {
  for (let index = currentIndex; index < targetIndex; index += 1) {
    await adapter.getByRole('button', { name: 'Next series' }).click();
  }
}

async function settleExactSample(adapter: Locator, targetIndex: number) {
  const displayedTime = await adapter.locator('[data-inspector-time]').textContent();
  const displayedTimestamp = Date.parse(displayedTime!.replace(' UTC', 'Z').replace(' ', 'T'));
  const displayedIndex = Math.round((displayedTimestamp - windowStart) / sampleInterval);
  const difference = targetIndex - displayedIndex;
  const maximumPointerDifference = targetIndex === sampleCount - 1 ? 32 : 5;
  expect(Math.abs(difference)).toBeLessThanOrEqual(maximumPointerDifference);
  const controlName = difference < 0 ? 'Previous sample' : 'Next sample';
  for (let index = 0; index < Math.abs(difference); index += 1) {
    await adapter.getByRole('button', { name: controlName }).click();
  }
}

async function pointerSelect(
  page: Page,
  adapter: Locator,
  adapterName: AdapterName,
  seriesIndex: number,
  sampleIndex: number,
  currentSeriesIndex: number,
) {
  const ratio = sampleIndex / (sampleCount - 1);
  await selectSeries(adapter, currentSeriesIndex, seriesIndex);
  if (adapterName === 'uplot') {
    const overlay = adapter.locator('.u-over');
    await overlay.scrollIntoViewIfNeeded();
    const bounds = await overlay.boundingBox();
    expect(bounds).not.toBeNull();
    const safeRatio = ratio === 1 ? 0.99 : ratio;
    const localX = Math.min(Math.max(bounds!.width * safeRatio, 1), bounds!.width - 1);
    await overlay.click({ position: { x: localX, y: bounds!.height / 2 } });
    await settleExactSample(adapter, sampleIndex);
    return seriesIndex;
  }

  const normalizedX = svgPlotStart + ratio * (svgPlotEnd - svgPlotStart);
  const graphic = adapter.locator('.p5c-visual svg');
  await graphic.scrollIntoViewIfNeeded();
  const clientPoint = await graphic.evaluate((svg, x) => {
    const matrix = svg.getScreenCTM();
    if (!matrix) throw new Error('P5C_TEST_SVG_MATRIX: SVG has no screen transform.');
    const point = new DOMPoint(x, 180).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  }, normalizedX);
  await page.mouse.click(clientPoint.x, clientPoint.y);
  await settleExactSample(adapter, sampleIndex);
  return seriesIndex;
}

async function expectInspection(
  adapter: Locator,
  expected: { series: string; time: string; value: string; knowledge?: string },
) {
  await expect(adapter.locator('[data-inspector-series]')).toHaveText(expected.series);
  await expect(adapter.locator('[data-inspector-time]')).toHaveText(expected.time);
  await expect(adapter.locator('[data-inspector-value]')).toHaveText(expected.value);
  if (expected.knowledge) {
    await expect(adapter.locator('[data-inspector-knowledge]')).toHaveText(expected.knowledge);
  }
}

test.describe('Phase 5C complete task and interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(proofPath);
  });

  test('answers the complete investigation from the shared authored summary and exact table', async ({
    page,
  }) => {
    await expect(page.getByText(/review queue crossed caution first at 08:00 UTC/i)).toBeVisible();
    await expect(
      page.getByText(/all four queues returned below caution by 14:12 UTC/i),
    ).toBeVisible();
    await expect(page.getByText(/redistributed incoming work at 14:00 UTC/i).first()).toBeVisible();

    await page.getByText('Inspect all exact queue observations').click();
    const tableRegion = page.getByRole('region', { name: 'Exact queue observations' });
    await tableRegion.focus();
    await expect(tableRegion).toBeFocused();

    const breach = page.getByRole('row', { name: /2026-08-18 08:00:00 UTC/ });
    await expect(breach).toContainText('86 items; knowledge: confirmed');
    await expect(breach).toContainText('46 items; knowledge: confirmed');
    await expect(breach).toContainText('47 items; knowledge: confirmed');
    await expect(breach).toContainText('48 items; knowledge: confirmed');

    const intervention = page.getByRole('row', { name: /2026-08-18 14:00:00 UTC/ });
    for (const value of ['85 items', '88 items', '91 items', '95 items']) {
      await expect(intervention).toContainText(`${value}; knowledge: confirmed`);
    }

    const recovery = page.getByRole('row', { name: /2026-08-18 14:12:00 UTC/ });
    for (const value of ['73 items', '74 items', '75 items', '76 items']) {
      await expect(recovery).toContainText(`${value}; knowledge: confirmed`);
    }

    expect(
      await tableRegion.evaluate((element) => element.scrollHeight > element.clientHeight),
    ).toBe(true);
  });

  test('keeps keyboard interaction native, bounded, and focused in every adapter', async ({
    page,
  }) => {
    for (const { selector } of adapters) {
      const adapter = page.locator(selector);
      const intake = adapter.getByRole('checkbox', { name: 'Intake queue' });
      await intake.focus();
      await intake.press('Space');
      await expect(intake).not.toBeChecked();
      await expect(intake).toBeFocused();
      await intake.press('Space');
      await expect(intake).toBeChecked();

      const nextSample = adapter.getByRole('button', { name: 'Next sample' });
      await nextSample.focus();
      await nextSample.press('Enter');
      await expect(nextSample).toBeFocused();
      await expectInspection(adapter, {
        series: 'Review queue',
        time: '2026-08-18 00:00:30 UTC',
        value: '39 items',
      });

      const nextSeries = adapter.getByRole('button', { name: 'Next series' });
      await nextSeries.focus();
      await nextSeries.press('Enter');
      await expect(nextSeries).toBeFocused();
      await expect(adapter.locator('[data-inspector-series]')).toHaveText('Intake queue');
    }
  });

  test('uses persistent exact inspection for task landmarks, gaps, and boundaries', async ({
    page,
  }) => {
    for (const { name, selector } of adapters) {
      const adapter = page.locator(selector);
      let currentSeries = 0;

      currentSeries = await pointerSelect(page, adapter, name, 0, 0, currentSeries);
      await expectInspection(adapter, {
        series: 'Review queue',
        time: '2026-08-18 00:00:00 UTC',
        value: '36 items',
      });

      currentSeries = await pointerSelect(page, adapter, name, 0, 960, currentSeries);
      await expectInspection(adapter, {
        series: 'Review queue',
        time: '2026-08-18 08:00:00 UTC',
        value: '86 items',
      });

      currentSeries = await pointerSelect(page, adapter, name, 2, 360, currentSeries);
      await expectInspection(adapter, {
        series: 'Classification queue',
        time: '2026-08-18 03:00:00 UTC',
        value: 'Unavailable',
        knowledge: 'Unavailable',
      });

      currentSeries = await pointerSelect(page, adapter, name, 3, 1_680, currentSeries);
      await expectInspection(adapter, {
        series: 'Dispatch queue',
        time: '2026-08-18 14:00:00 UTC',
        value: '95 items',
      });

      currentSeries = await pointerSelect(page, adapter, name, 3, 1_704, currentSeries);
      await expectInspection(adapter, {
        series: 'Dispatch queue',
        time: '2026-08-18 14:12:00 UTC',
        value: '76 items',
      });

      await pointerSelect(page, adapter, name, 3, sampleCount - 1, currentSeries);
      await expectInspection(adapter, {
        series: 'Dispatch queue',
        time: '2026-08-18 23:59:30 UTC',
        value: '75 items',
      });
    }
  });

  test('supports touch-sized native controls without pointer precision', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:4173',
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const touchPage = await context.newPage();
    await touchPage.goto(`${proofPath}?density=compact`);

    for (const { selector } of adapters) {
      const adapter = touchPage.locator(selector);
      const nextSample = adapter.getByRole('button', { name: 'Next sample' });
      const intakeLabel = adapter.getByRole('checkbox', { name: 'Intake queue' }).locator('..');
      for (const target of [nextSample, intakeLabel]) {
        const bounds = await target.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }

      await nextSample.tap();
      await expect(adapter.locator('[data-inspector-value]')).toHaveText('39 items');
      await intakeLabel.tap();
      await expect(adapter.getByRole('checkbox', { name: 'Intake queue' })).not.toBeChecked();
    }

    await context.close();
  });
});
