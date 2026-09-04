import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const document = readFileSync(
  resolve(repositoryRoot, 'docs/feedback/transient-feedback.md'),
  'utf8',
);
const toast = readFileSync(resolve(repositoryRoot, 'packages/elements/src/toast.ts'), 'utf8');
const region = readFileSync(
  resolve(repositoryRoot, 'packages/elements/src/toast-region.ts'),
  'utf8',
);
const feedbackValues = readFileSync(
  resolve(repositoryRoot, 'packages/elements/src/feedback-values.ts'),
  'utf8',
);
const toastReact = readFileSync(resolve(repositoryRoot, 'packages/react/src/toast.tsx'), 'utf8');
const regionReact = readFileSync(
  resolve(repositoryRoot, 'packages/react/src/toast-region.tsx'),
  'utf8',
);

function sourceReactiveProperties(source: string): string[] {
  const block = source.match(/static override properties = \{([\s\S]*?)\n {2}\};/);
  if (!block) return [];
  return [...block[1]!.matchAll(/^ {4}([a-z][A-Za-z0-9]*):/gm)].map((match) => match[1]!).sort();
}

function sourceSlots(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<slot(?:\s+name="([^"]+)")?/g)].map((match) => match[1] ?? 'default'),
    ),
  ].sort();
}

function sourceParts(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/part="([^"]+)"/g)]
        .flatMap((match) => match[1]!.split(/\s+/))
        .filter((part) => !part.includes('${')),
    ),
  ].sort();
}

describe('transient-feedback field-level contracts', () => {
  it('freezes toast fields, defaults, slots, parts, and styling hooks', () => {
    expect(sourceReactiveProperties(toast)).toEqual([
      'announcement',
      'closeLabel',
      'condition',
      'dedupeKey',
      'dismissible',
      'duration',
      'open',
      'toastId',
    ]);
    expect(sourceSlots(toast)).toEqual(['actions', 'default', 'detail', 'icon']);
    expect(sourceParts(toast)).toEqual([
      'actions',
      'base',
      'close-button',
      'detail',
      'icon',
      'marker',
      'message',
    ]);
    for (const value of [
      "this.toastId = '';",
      'this.open = false;',
      "this.condition = 'neutral';",
      "this.announcement = 'polite';",
      "this.dedupeKey = '';",
      'this.dismissible = true;',
      "this.closeLabel = '';",
      '#duration = 8_000;',
    ]) {
      expect(toast).toContain(value);
    }

    const properties = [...new Set(toast.match(/--wg-toast-[a-z0-9-]+/g) ?? [])].sort();
    expect(properties).toEqual([
      '--wg-toast-color-background',
      '--wg-toast-color-border',
      '--wg-toast-color-detail',
      '--wg-toast-color-text',
      '--wg-toast-radius',
      '--wg-toast-size-marker',
      '--wg-toast-space',
      '--wg-toast-space-related',
    ]);
    for (const property of properties) expect(document).toContain(`\`${property}\``);
  });

  it('freezes region fields, defaults, slots, parts, and methods', () => {
    expect(sourceReactiveProperties(region)).toEqual(['maxVisible', 'paused', 'placement']);
    expect(sourceSlots(region)).toEqual(['default']);
    expect(sourceParts(region)).toEqual(['assertive-announcer', 'polite-announcer', 'stack']);
    expect(region).toContain("this.placement = 'block-end-end';");
    expect(region).toContain('this.maxVisible = 3;');
    expect(region).toContain('this.paused = false;');
    expect(region).toContain("dismiss(toastId: string, reason?: 'programmatic'): boolean;");
    expect(region).toContain("dismissAll(reason: 'programmatic' = 'programmatic'): void");
    expect(region).toContain('pause(): void');
    expect(region).toContain('resume(): void');
    expect(document).not.toMatch(/CSS parts:\n\n- `base`\n- `stack`/);
    expect(document).toContain('exposes no element-specific CSS custom properties in v1');
  });

  it('freezes closed vocabularies, dismissal detail, and replacement announcements', () => {
    expect(toast).toContain("['timeout', 'close', 'programmatic', 'replaced']");
    expect(feedbackValues).toContain("['off', 'polite', 'assertive']");
    expect(feedbackValues).toContain("'neutral',\n  'positive',\n  'caution',\n  'critical'");
    expect(region).toContain(
      "'block-start-end',\n  'block-start-start',\n  'block-end-end',\n  'block-end-start'",
    );
    expect(region).toContain("duplicate.toast.announcement !== 'assertive'");
    expect(region).toContain("toast.announcement === 'assertive'");
    expect(toast).toContain('readonly toastId: string;');
    expect(toast).toContain('readonly reason: ToastDismissReason;');
    expect(region).toContain("new CustomEvent<WgToastDismissDetail>('wg-toast-dismiss'");
  });

  it('freezes explicit registration and thin React adaptation', () => {
    expect(toast).toContain('defineElement(wgToastTagName, WgToast, registry);');
    expect(region).toContain('defineWgToast(registry);');
    expect(region).toContain('defineElement(wgToastRegionTagName, WgToastRegion, registry);');
    expect(toastReact).toContain("from '@wayglass/elements/toast'");
    expect(toastReact).toContain('registerElement(defineWgToast);');
    expect(toastReact).toContain("onWgToastDismiss: 'wg-toast-dismiss'");
    expect(regionReact).toContain("from '@wayglass/elements/toast-region'");
    expect(regionReact).toContain('registerElement(defineWgToastRegion);');
    expect(regionReact).not.toContain('events:');
  });

  it('records current evidence and continuing boundaries without overstating AT review', () => {
    expect(document).toContain('## Validation coverage');
    expect(document).toContain('## Continuing boundaries');
    expect(document).toContain('explicit public-release');
    expect(document).toContain('evidence gates');
    expect(document).not.toContain('## Validation requirements');
    expect(document).not.toContain('## Deferred decisions');
  });
});
