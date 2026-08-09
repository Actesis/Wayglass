import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openProof(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/tests/browser/telemetry-architecture/');
  await page.waitForFunction(() => typeof window.defineTelemetryProof === 'function');
}

async function upgradeProof(page: import('@playwright/test').Page, offset = 0): Promise<void> {
  await page.evaluate((nextOffset) => {
    window.defineTelemetryProof();
    const proof = document.querySelector('wg-telemetry-proof') as HTMLElement & {
      samples: readonly unknown[];
      windowStart: number;
      windowEnd: number;
      scaleMinimum: number;
      scaleMaximum: number;
    };
    const fixture = window.createTelemetrySamples(nextOffset);
    proof.windowStart = fixture.window.start;
    proof.windowEnd = fixture.window.end;
    proof.scaleMinimum = 0;
    proof.scaleMaximum = 40;
    proof.samples = fixture.samples;
  }, offset);
  await expect(page.locator('wg-telemetry-proof')).toHaveAttribute('data-valid', '');
}

test.beforeEach(async ({ page }) => {
  await openProof(page);
});

test('keeps the readable overview useful before custom-element registration', async ({ page }) => {
  expect(await page.evaluate(() => customElements.get('wg-telemetry-proof'))).toBeUndefined();
  await expect(page.getByRole('heading', { name: 'Queue depth' })).toBeVisible();
  await expect(page.getByText('Latest observation: 24 records')).toBeVisible();
  await expect(page.locator('time')).toHaveCount(2);
  await expect(page.getByText(/One brief gap and two unavailable intervals/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect exact observations' })).toBeVisible();
  await expect(page.locator('svg')).toHaveCount(0);
});

test('uses one named group and excludes calculated SVG from accessible ownership', async ({
  page,
}) => {
  await upgradeProof(page);
  const group = page.getByRole('group', { name: 'Queue depth', exact: true });
  await expect(group).toBeVisible();
  await expect(page.getByText('Latest observation: 24 records')).toBeVisible();
  await expect(page.getByText(/One brief gap and two unavailable intervals/)).toBeVisible();
  await expect(page.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('svg')).toHaveAttribute('focusable', 'false');
  await expect(page.getByRole('img')).toHaveCount(0);
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

test('retains 240 irregular samples, knowledge runs, repeated time, and explicit gaps', async ({
  page,
}) => {
  await upgradeProof(page);
  const geometry = await page.locator('wg-telemetry-proof').evaluate((element) => {
    const root = element.shadowRoot!;
    const paths = Array.from(root.querySelectorAll<SVGPathElement>('path'));
    return {
      segments: paths.reduce((sum, path) => sum + Number(path.dataset.segments), 0),
      knowledge: paths.map((path) => path.dataset.knowledge),
      gaps: Array.from(root.querySelectorAll<SVGLineElement>('[data-gap]')).map(
        (gap) => gap.dataset.knowledge,
      ),
      boundaries: root.querySelectorAll('[data-boundary]').length,
    };
  });
  expect(geometry.segments).toBe(230);
  expect(geometry.knowledge).toEqual(
    expect.arrayContaining(['confirmed', 'inferred', 'stale', 'conflicting']),
  );
  expect(geometry.gaps).toEqual(expect.arrayContaining(['confirmed', 'unknown', 'unavailable']));
  expect(geometry.gaps).toHaveLength(6);
  expect(geometry.boundaries).toBeGreaterThan(0);
});

test('resizes through phone and wall widths without reprocessing or page overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await upgradeProof(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  const before = await page.locator('wg-telemetry-proof').evaluate((element) => {
    const proof = element as HTMLElement & { renderCount: number };
    return {
      renderCount: proof.renderCount,
      geometry: element.shadowRoot!.querySelector('path')!.getAttribute('d'),
    };
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const after = await page.locator('wg-telemetry-proof').evaluate((element) => {
    const proof = element as HTMLElement & { renderCount: number };
    return {
      renderCount: proof.renderCount,
      geometry: element.shadowRoot!.querySelector('path')!.getAttribute('d'),
      graphicWidth: element.shadowRoot!.querySelector('svg')!.getBoundingClientRect().width,
    };
  });
  expect(after.renderCount).toBe(before.renderCount);
  expect(after.geometry).toBe(before.geometry);
  expect(after.graphicWidth).toBeGreaterThan(1000);
});

test('keeps every knowledge and gap pattern distinct in forced colors and grayscale', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await upgradeProof(page);
  await page.locator('body').evaluate((body) => body.setAttribute('data-grayscale', ''));
  const patterns = await page.locator('wg-telemetry-proof').evaluate((element) => {
    const root = element.shadowRoot!;
    return Array.from(root.querySelectorAll<SVGElement>('[data-knowledge]')).reduce<
      Record<string, string>
    >((result, mark) => {
      const knowledge = mark.dataset.knowledge!;
      result[knowledge] ||= getComputedStyle(mark).strokeDasharray;
      return result;
    }, {});
  });
  expect(Object.keys(patterns).sort()).toEqual(
    ['confirmed', 'conflicting', 'inferred', 'stale', 'unavailable', 'unknown'].sort(),
  );
  expect(new Set(Object.values(patterns)).size).toBe(6);
});

test('replaces the 240-sample series silently while retaining authored focus', async ({
  page,
  browserName,
}) => {
  await upgradeProof(page);
  const detail = page.getByRole('button', { name: 'Inspect exact observations' });
  await detail.focus();
  const result = await page.locator('wg-telemetry-proof').evaluate(async (element) => {
    const proof = element as HTMLElement & {
      samples: readonly unknown[];
      renderCount: number;
      lastRenderDuration: number;
    };
    let events = 0;
    const count = () => {
      events += 1;
    };
    element.addEventListener('change', count);
    element.addEventListener('input', count);
    const before = proof.renderCount;
    const fixture = window.createTelemetrySamples(17);
    const started = performance.now();
    proof.samples = fixture.samples;
    const assignmentDuration = performance.now() - started;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    return {
      assignmentDuration,
      renderDuration: proof.lastRenderDuration,
      renderDelta: proof.renderCount - before,
      events,
      focused: document.activeElement?.id,
      liveRegions: element.shadowRoot!.querySelectorAll(
        '[aria-live], [role="status"], [role="alert"]',
      ).length,
    };
  });
  expect(result.renderDelta).toBe(1);
  expect(result.events).toBe(0);
  expect(result.focused).toBe('details');
  expect(result.liveRegions).toBe(0);
  if (browserName === 'chromium') {
    expect(result.assignmentDuration).toBeLessThan(100);
    expect(result.renderDuration).toBeLessThan(100);
  }
});

test('fails invalid data neutrally without removing readable content', async ({ page }) => {
  await upgradeProof(page);
  await page.locator('wg-telemetry-proof').evaluate((element) => {
    const proof = element as HTMLElement & { samples: readonly unknown[] };
    const fixture = window.createTelemetrySamples();
    proof.samples = [...fixture.samples, { observedAt: fixture.window.end + 1, value: 80 }];
  });
  await expect(page.locator('wg-telemetry-proof')).not.toHaveAttribute('data-valid', '');
  await expect(page.locator('wg-telemetry-proof').locator('path')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Queue depth' })).toBeVisible();
  await expect(page.getByText(/One brief gap and two unavailable intervals/)).toBeVisible();
});

test('accepts empty, repeated-time, and exact-boundary input without inferring state', async ({
  page,
}) => {
  await upgradeProof(page);
  const result = await page.locator('wg-telemetry-proof').evaluate(async (element) => {
    const proof = element as HTMLElement & { samples: readonly unknown[] };
    const fixture = window.createTelemetrySamples();
    proof.samples = [];
    await Promise.resolve();
    const empty = {
      valid: element.hasAttribute('data-valid'),
      marks: element.shadowRoot!.querySelectorAll('path, [data-gap]').length,
    };
    proof.samples = [
      { observedAt: fixture.window.start, value: 0 },
      { observedAt: fixture.window.start, value: 40 },
      { observedAt: fixture.window.end, value: null, knowledge: 'unknown' },
    ];
    await Promise.resolve();
    return {
      empty,
      boundaryValid: element.hasAttribute('data-valid'),
      boundarySegments: Number(
        element.shadowRoot!.querySelector<SVGPathElement>('path')?.dataset.segments,
      ),
      boundaryGaps: element.shadowRoot!.querySelectorAll('[data-gap]').length,
    };
  });
  expect(result.empty).toEqual({ valid: true, marks: 0 });
  expect(result.boundaryValid).toBe(true);
  expect(result.boundarySegments).toBe(1);
  expect(result.boundaryGaps).toBe(1);
  await expect(page.getByText(/One brief gap and two unavailable intervals/)).toBeVisible();
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

for (const theme of ['dark', 'light'] as const) {
  test(`has no automated accessibility violations in the ${theme} proof`, async ({ page }) => {
    await page.locator('body').evaluate((body, nextTheme) => {
      body.setAttribute('data-theme', nextTheme);
    }, theme);
    await upgradeProof(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
