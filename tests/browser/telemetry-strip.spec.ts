import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openStrip(page: import('@playwright/test').Page, query = ''): Promise<void> {
  await page.goto(`/tests/browser/telemetry-strip/${query}`);
  await expect(page.locator('wg-telemetry-strip').locator('path')).not.toHaveCount(0);
}

test('preserves readable light DOM before explicit registration', async ({ page }) => {
  await page.goto('/tests/browser/telemetry-strip/?upgrade=false');
  expect(await page.evaluate(() => customElements.get('wg-telemetry-strip'))).toBeUndefined();
  await expect(page.getByRole('heading', { name: 'Queue depth' })).toBeVisible();
  await expect(page.getByText(/One brief gap and two unavailable intervals/)).toBeVisible();
  await expect(page.locator('time')).toHaveCount(2);
  await expect(page.locator('svg')).toHaveCount(0);
});

test('renders one accessible group and keeps geometry non-semantic', async ({ page }) => {
  await openStrip(page);
  await expect(page.getByRole('group', { name: 'Queue depth' })).toBeVisible();
  await expect(page.locator('wg-telemetry-strip').locator('svg')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.getByRole('img')).toHaveCount(0);
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
  await expect(page.getByText('Caution', { exact: true })).toBeVisible();
  await expect(page.getByText('Pending', { exact: true })).toBeVisible();
});

test('retains bounded samples, knowledge runs, repeated times, and gaps', async ({ page }) => {
  await openStrip(page);
  const geometry = await page.locator('wg-telemetry-strip').evaluate((element) => {
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

test('updates silently without disturbing authored focus', async ({ page }) => {
  await openStrip(page);
  await page.getByRole('button', { name: 'Inspect exact observations' }).focus();
  const result = await page.locator('wg-telemetry-strip').evaluate(async (element) => {
    const strip = element as HTMLElement & {
      samples: readonly unknown[];
      updateComplete: Promise<boolean>;
    };
    let events = 0;
    element.addEventListener('change', () => (events += 1));
    element.addEventListener('input', () => (events += 1));
    const before = element.shadowRoot!.querySelector('path')!.getAttribute('d');
    strip.samples = window.createTelemetrySamples(17);
    await strip.updateComplete;
    return {
      events,
      changed: before !== element.shadowRoot!.querySelector('path')!.getAttribute('d'),
      focused: document.activeElement?.id,
    };
  });
  expect(result).toEqual({ events: 0, changed: true, focused: 'details' });
});

test('suppresses invalid geometry while preserving authored content', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  await openStrip(page);
  await page.locator('wg-telemetry-strip').evaluate(async (element) => {
    const strip = element as HTMLElement & {
      samples: readonly unknown[];
      updateComplete: Promise<boolean>;
    };
    strip.samples = [
      { observedAt: window.telemetryStart, value: 20 },
      { observedAt: window.telemetryEnd + 1, value: 20 },
    ];
    await strip.updateComplete;
    strip.requestUpdate?.();
    await strip.updateComplete;
  });
  expect(
    await page
      .locator('wg-telemetry-strip')
      .evaluate(
        (element) =>
          element.shadowRoot!.querySelectorAll('path, [data-gap], [data-boundary]').length,
      ),
  ).toBe(0);
  await expect(page.getByText(/One brief gap and two unavailable intervals/)).toBeVisible();
  expect(warnings.filter((warning) => warning.includes('[wg-telemetry-strip]'))).toHaveLength(1);
});

test('supports themes, density, direction, forced colors, zoom, and accessibility', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await openStrip(page, '?theme=wayglass-light&density=comfortable&dir=rtl');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const patterns = await page.locator('wg-telemetry-strip').evaluate((element) =>
    Array.from(element.shadowRoot!.querySelectorAll<SVGElement>('[data-knowledge]')).reduce<
      Record<string, string>
    >((result, mark) => {
      const knowledge = mark.dataset.knowledge!;
      result[knowledge] ||= getComputedStyle(mark).strokeDasharray;
      return result;
    }, {}),
  );
  expect(new Set(Object.values(patterns)).size).toBe(6);
  expect(await new AxeBuilder({ page }).analyze()).toEqual(
    expect.objectContaining({ violations: [] }),
  );
});
