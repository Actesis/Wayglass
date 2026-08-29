import { expect, test } from '@playwright/test';

test('Phase 5D runtime candidate imports without browser or registration leakage', async ({
  page,
}) => {
  await page.goto('/experiments/phase-5d-icon-tooling/generated/review-index.html');
  const result = await page.evaluate(async () => {
    const before = customElements.get('wg-icon')?.name ?? null;
    const runtime = await import(
      /* @vite-ignore */ '/experiments/phase-5d-icon-tooling/src/runtime-candidate.ts'
    );
    const close = runtime.renderRuntimeIcon('close', 'ltr');
    const directionalLtr = runtime.renderRuntimeIcon('arrow-inline-start', 'ltr');
    const directionalRtl = runtime.renderRuntimeIcon('arrow-inline-start', 'rtl');

    return {
      after: customElements.get('wg-icon')?.name ?? null,
      before,
      close,
      directionalLtrTransform: directionalLtr.attributes.transform ?? null,
      directionalRtlTransform: directionalRtl.attributes.transform ?? null,
      globals: {
        runtimeCandidate: Object.hasOwn(globalThis, 'runtimeCandidate'),
        wayglassIcons: Object.hasOwn(globalThis, 'wayglassIcons'),
      },
      names: runtime.runtimeIconNames,
    };
  });

  expect(result.before).toBeNull();
  expect(result.after).toBeNull();
  expect(result.globals).toEqual({ runtimeCandidate: false, wayglassIcons: false });
  expect(result.names).toEqual(['arrow-inline-start', 'close', 'menu', 'more', 'refresh']);
  expect(result.close.attributes).toEqual({
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  });
  expect(result.directionalLtrTransform).toBeNull();
  expect(result.directionalRtlTransform).toBe('scale(-1 1) translate(-24 0)');
});
