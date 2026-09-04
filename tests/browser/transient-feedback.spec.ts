import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/transient-feedback/');
  await page.waitForFunction(() => customElements.get('wg-toast-region') !== undefined);
});

test('keeps imports side-effect free and region registration scoped', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    await Promise.all([
      import('/packages/elements/dist/toast.js'),
      import('/packages/elements/dist/toast-region.js'),
    ]);
    return {
      toast: customElements.get('wg-toast') !== undefined,
      region: customElements.get('wg-toast-region') !== undefined,
    };
  });
  expect(result).toEqual({ toast: false, region: false });
});

test('shows static content without announcing initial markup', async ({ page }) => {
  await expect(page.locator('#static-toast')).toBeVisible();
  await expect(page.locator('#region').locator('[part="polite-announcer"]')).toHaveText('');
  await expect(page.getByRole('status')).toHaveCount(1);
  await expect(page.getByRole('alert')).toHaveCount(1);
});

test('opens dynamic feedback without moving focus and announces only its message', async ({
  page,
}) => {
  const outside = page.locator('#outside');
  await outside.focus();
  await page.locator('#region').evaluate((region) => {
    const toast = document.createElement('wg-toast');
    toast.setAttribute('toast-id', 'dynamic-save');
    toast.setAttribute('duration', '0');
    toast.setAttribute('close-label', 'Dismiss dynamic save notification');
    toast.setAttribute('open', '');
    toast.textContent = 'Contact preferences saved.';
    const action = document.createElement('button');
    action.slot = 'actions';
    action.textContent = 'View preferences';
    toast.append(action);
    region.append(toast);
  });
  await expect(outside).toBeFocused();
  await expect(page.locator('wg-toast[toast-id="dynamic-save"]')).toBeVisible();
  await expect(page.locator('#region').locator('[part="polite-announcer"]')).toHaveText(
    'Contact preferences saved.',
  );
});

test('bounds visible feedback and promotes requests in FIFO order', async ({ page }) => {
  await page.locator('#region').evaluate((region) => {
    for (const [id, message] of [
      ['second', 'Second acknowledgement'],
      ['third', 'Third acknowledgement'],
    ]) {
      const toast = document.createElement('wg-toast');
      toast.setAttribute('toast-id', id);
      toast.setAttribute('duration', '0');
      toast.setAttribute('close-label', `Dismiss ${id}`);
      toast.setAttribute('open', '');
      toast.textContent = message;
      region.append(toast);
    }
  });
  await expect(page.locator('wg-toast[data-presentation="visible"]')).toHaveCount(2);
  await expect(page.locator('wg-toast[toast-id="third"]')).not.toBeVisible();
  await page.locator('#region').evaluate((region) => {
    (region as HTMLElement & { dismiss(id: string): boolean }).dismiss('static-outcome');
  });
  await expect(page.locator('wg-toast[toast-id="third"]')).toBeVisible();
});

test('replaces explicit duplicates in place and reports presentation dismissal', async ({
  page,
}) => {
  await page.locator('#region').evaluate((region) => {
    (region as HTMLElement & { dismissals?: unknown[] }).dismissals = [];
    region.addEventListener('wg-toast-dismiss', (event) => {
      (region as HTMLElement & { dismissals: unknown[] }).dismissals.push(
        (event as CustomEvent).detail,
      );
    });
    const first = document.createElement('wg-toast');
    first.setAttribute('toast-id', 'upload-1');
    first.setAttribute('dedupe-key', 'upload');
    first.setAttribute('duration', '0');
    first.setAttribute('close-label', 'Dismiss first upload');
    first.setAttribute('open', '');
    first.textContent = 'One document uploaded.';
    region.append(first);
  });
  await expect(page.locator('wg-toast[toast-id="upload-1"]')).toBeVisible();
  await page.locator('#region').evaluate((region) => {
    const replacement = document.createElement('wg-toast');
    replacement.setAttribute('toast-id', 'upload-2');
    replacement.setAttribute('dedupe-key', 'upload');
    replacement.setAttribute('duration', '0');
    replacement.setAttribute('close-label', 'Dismiss replacement upload');
    replacement.setAttribute('open', '');
    replacement.textContent = 'Two documents uploaded.';
    region.append(replacement);
  });
  await expect(page.locator('wg-toast[toast-id="upload-1"]')).not.toBeVisible();
  await expect(page.locator('wg-toast[toast-id="upload-2"]')).toBeVisible();
  expect(
    await page
      .locator('#region')
      .evaluate((region) => (region as HTMLElement & { dismissals: unknown[] }).dismissals),
  ).toContainEqual({ toastId: 'upload-1', reason: 'replaced' });
});

test('suppresses unchanged duplicate announcements and announces meaningful replacements', async ({
  page,
}) => {
  await page.locator('#region').evaluate((region) => {
    const announcer = region.shadowRoot!.querySelector('[part="polite-announcer"]')!;
    (region as HTMLElement & { announcements?: string[] }).announcements = [];
    new MutationObserver(() => {
      const text = announcer.textContent?.trim();
      if (text) {
        (region as HTMLElement & { announcements: string[] }).announcements.push(text);
      }
    }).observe(announcer, { childList: true, characterData: true, subtree: true });
  });

  const addToast = async (id: string, message: string) => {
    await page.locator('#region').evaluate(
      (region, value) => {
        const toast = document.createElement('wg-toast');
        toast.setAttribute('toast-id', value.id);
        toast.setAttribute('dedupe-key', 'sync-result');
        toast.setAttribute('duration', '0');
        toast.setAttribute('close-label', `Dismiss ${value.id}`);
        toast.setAttribute('open', '');
        toast.textContent = value.message;
        region.append(toast);
      },
      { id, message },
    );
  };

  await addToast('sync-1', 'Catalog synchronized.');
  await expect(page.locator('#region').locator('[part="polite-announcer"]')).toHaveText(
    'Catalog synchronized.',
  );
  await addToast('sync-2', 'Catalog synchronized.');
  await page.waitForTimeout(250);
  expect(
    await page
      .locator('#region')
      .evaluate((region) => (region as HTMLElement & { announcements: string[] }).announcements),
  ).toEqual(['Catalog synchronized.']);

  await addToast('sync-3', 'Catalog synchronized with two changes.');
  await expect
    .poll(() =>
      page
        .locator('#region')
        .evaluate((region) => (region as HTMLElement & { announcements: string[] }).announcements),
    )
    .toEqual(['Catalog synchronized.', 'Catalog synchronized with two changes.']);
});

test('suppresses an unchanged replacement that was already assertive', async ({ page }) => {
  await page.locator('#region').evaluate((region) => {
    const announcer = region.shadowRoot!.querySelector('[part="assertive-announcer"]')!;
    (region as HTMLElement & { announcements?: string[] }).announcements = [];
    new MutationObserver(() => {
      const text = announcer.textContent?.trim();
      if (text) {
        (region as HTMLElement & { announcements: string[] }).announcements.push(text);
      }
    }).observe(announcer, { childList: true, characterData: true, subtree: true });
  });

  const addToast = async (id: string) => {
    await page.locator('#region').evaluate((region, toastId) => {
      const toast = document.createElement('wg-toast');
      toast.setAttribute('toast-id', toastId);
      toast.setAttribute('dedupe-key', 'assertive-sync-result');
      toast.setAttribute('announcement', 'assertive');
      toast.setAttribute('duration', '0');
      toast.setAttribute('close-label', `Dismiss ${toastId}`);
      toast.setAttribute('open', '');
      toast.textContent = 'Immediate synchronization failure.';
      region.append(toast);
    }, id);
  };

  await addToast('assertive-sync-1');
  await expect(page.locator('#region').locator('[part="assertive-announcer"]')).toHaveText(
    'Immediate synchronization failure.',
  );
  await addToast('assertive-sync-2');
  await page.waitForTimeout(250);
  expect(
    await page
      .locator('#region')
      .evaluate((region) => (region as HTMLElement & { announcements: string[] }).announcements),
  ).toEqual(['Immediate synchronization failure.']);
});

test('distinguishes implicit manual action lifetime from an explicit duration', async ({
  page,
}) => {
  const duration = await page.locator('#region').evaluate(async (region) => {
    const toast = document.createElement('wg-toast') as HTMLElement & {
      effectiveDuration: number;
      duration: number;
      updateComplete: Promise<boolean>;
    };
    toast.setAttribute('toast-id', 'action-toast');
    toast.setAttribute('close-label', 'Dismiss action notification');
    toast.setAttribute('open', '');
    toast.textContent = 'Report exported.';
    const action = document.createElement('button');
    action.slot = 'actions';
    action.textContent = 'View report';
    toast.append(action);
    region.append(toast);
    await toast.updateComplete;
    const implicit = toast.effectiveDuration;
    toast.duration = 8_000;
    await toast.updateComplete;
    return {
      implicit,
      explicit: toast.effectiveDuration,
      reflected: toast.hasAttribute('duration'),
    };
  });
  expect(duration).toEqual({ implicit: 0, explicit: 8_000, reflected: false });
});

test('starts timed lifetime only when a toast becomes visible', async ({ page }) => {
  await page.clock.install();
  await page.locator('#region').evaluate((region) => {
    region.removeAttribute('paused');
    const toast = document.createElement('wg-toast');
    toast.setAttribute('toast-id', 'timed-toast');
    toast.setAttribute('duration', '5000');
    toast.setAttribute('close-label', 'Dismiss timed notification');
    toast.setAttribute('open', '');
    toast.textContent = 'Timed acknowledgement.';
    region.append(toast);
  });
  const toast = page.locator('wg-toast[toast-id="timed-toast"]');
  await expect(toast).toBeVisible();
  await page.clock.fastForward(4_000);
  await expect(toast).toBeVisible();
  await page.clock.fastForward(1_100);
  await expect(toast).not.toBeVisible();
});

test('preserves remaining lifetime across explicit pause and resume', async ({ page }) => {
  await page.clock.install();
  await page.locator('#region').evaluate((region) => {
    region.removeAttribute('paused');
    const toast = document.createElement('wg-toast');
    toast.setAttribute('toast-id', 'pause-resume');
    toast.setAttribute('duration', '5000');
    toast.setAttribute('close-label', 'Dismiss pause-resume notification');
    toast.setAttribute('open', '');
    toast.textContent = 'Pause and resume acknowledgement.';
    region.append(toast);
  });
  const toast = page.locator('wg-toast[toast-id="pause-resume"]');
  await expect(toast).toBeVisible();
  await page.clock.fastForward(1_000);
  await page
    .locator('#region')
    .evaluate((region) => (region as HTMLElement & { pause(): void }).pause());
  await page.clock.fastForward(10_000);
  await expect(toast).toBeVisible();
  await page
    .locator('#region')
    .evaluate((region) => (region as HTMLElement & { resume(): void }).resume());
  await page.clock.fastForward(2_000);
  await expect(toast).toBeVisible();
  await page.clock.fastForward(2_500);
  await expect(toast).not.toBeVisible();
});

test('pauses timed lifetime while a toast contains focus', async ({ page }) => {
  await page.clock.install();
  await page.locator('#region').evaluate((region) => {
    region.removeAttribute('paused');
    const toast = document.createElement('wg-toast');
    toast.setAttribute('toast-id', 'focus-pause');
    toast.setAttribute('duration', '5000');
    toast.setAttribute('close-label', 'Dismiss focus-pause notification');
    toast.setAttribute('open', '');
    toast.textContent = 'Review is available.';
    const action = document.createElement('button');
    action.slot = 'actions';
    action.textContent = 'Review';
    toast.append(action);
    region.append(toast);
  });
  const toast = page.locator('wg-toast[toast-id="focus-pause"]');
  await page.clock.fastForward(2_000);
  await toast.getByRole('button', { name: 'Review' }).focus();
  await page.clock.fastForward(10_000);
  await expect(toast).toBeVisible();
  await page.locator('#outside').focus();
  await page.clock.fastForward(2_000);
  await expect(toast).toBeVisible();
  await page.clock.fastForward(2_500);
  await expect(toast).not.toBeVisible();
});

test('defers dismiss-all for a focused toast until focus leaves', async ({ page }) => {
  const toast = page.locator('#static-toast');
  await toast.getByRole('button', { name: 'Dismiss saved notification' }).focus();
  await page
    .locator('#region')
    .evaluate((region) => (region as HTMLElement & { dismissAll(): void }).dismissAll());
  await expect(toast).toBeVisible();
  await page.locator('#outside').focus();
  await expect(toast).not.toBeVisible();
});

test('emits close reason and returns focus to the stack entry target', async ({ page }) => {
  const outside = page.locator('#outside');
  const toast = page.locator('#static-toast');
  await outside.focus();
  await toast.getByRole('button', { name: 'Dismiss saved notification' }).focus();
  await toast.getByRole('button', { name: 'Dismiss saved notification' }).click();
  await expect(outside).toBeFocused();
  await expect(toast).not.toBeVisible();
});

test('normalizes public vocabularies, duration, and visible limits', async ({ page }) => {
  const toast = page.locator('#static-toast');
  const region = page.locator('#region');
  await toast.evaluate((element) => {
    element.setAttribute('condition', 'healthy');
    element.setAttribute('announcement', 'urgent');
    element.setAttribute('duration', '12');
  });
  await region.evaluate((element) => {
    element.setAttribute('placement', 'center');
    element.setAttribute('max-visible', '99');
  });
  await expect(toast).toHaveAttribute('condition', 'neutral');
  await expect(toast).toHaveAttribute('announcement', 'polite');
  await expect(toast).toHaveAttribute('duration', '5000');
  await expect(region).toHaveAttribute('placement', 'block-end-end');
  await expect(region).toHaveAttribute('max-visible', '5');
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('suppresses entry motion under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-toast-region') !== undefined);
  expect(
    await page
      .locator('#static-toast')
      .locator('[part="base"]')
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
});

test('reflows without page overflow at the 320 CSS-pixel viewport produced by 400 percent zoom', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const dimensions = await page.locator('html').evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(dimensions.scroll - dimensions.client).toBeLessThanOrEqual(1);
  await expect(page.locator('#static-toast')).toBeVisible();
  await expect(
    page.locator('#static-toast').getByRole('button', { name: 'Dismiss saved notification' }),
  ).toBeVisible();
});
