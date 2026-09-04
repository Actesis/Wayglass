import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const confirmationDocument = read('docs/feedback/confirmation-dialog.md');
const dialogDocument = read('docs/feedback/content-dialog.md');
const confirmation = read('packages/elements/src/confirmation-dialog.ts');
const dialog = read('packages/elements/src/dialog.ts');
const controller = read('packages/elements/src/native-modal-controller.ts');
const confirmationReact = read('packages/react/src/confirmation-dialog.tsx');
const dialogReact = read('packages/react/src/dialog.tsx');
const elementsManifest = JSON.parse(read('packages/elements/package.json')) as {
  readonly exports: Readonly<Record<string, unknown>>;
};

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
  const render =
    source.match(/protected override render\(\) \{([\s\S]*?)\n {2}\}\n\n {2}show\(/)?.[1] ?? '';
  return [
    ...new Set([...render.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/))),
  ].sort();
}

describe('modal-feedback field-level contracts', () => {
  it('freezes confirmation fields, defaults, slots, and parts', () => {
    expect(sourceReactiveProperties(confirmation)).toEqual([
      'actionAppearance',
      'actionLabel',
      'attention',
      'cancelLabel',
      'dialogId',
      'initialFocus',
      'open',
    ]);
    expect(sourceSlots(confirmation)).toEqual(['default', 'heading', 'icon']);
    expect(sourceParts(confirmation)).toEqual([
      'action-button',
      'actions',
      'cancel-button',
      'content',
      'description',
      'dialog',
      'heading',
      'icon',
      'marker',
      'surface',
    ]);
    for (const value of [
      "this.dialogId = '';",
      'this.open = false;',
      "this.actionLabel = '';",
      "this.cancelLabel = '';",
      "this.actionAppearance = 'primary';",
      "this.attention = 'ordinary';",
      "this.initialFocus = 'cancel';",
    ]) {
      expect(confirmation).toContain(value);
    }
    for (const part of sourceParts(confirmation)) {
      expect(confirmationDocument).toContain(`\`${part}\``);
    }
  });

  it('freezes content-dialog fields, defaults, slots, and parts', () => {
    expect(sourceReactiveProperties(dialog)).toEqual([
      'closeLabel',
      'dialogId',
      'initialFocus',
      'open',
      'size',
    ]);
    expect(sourceSlots(dialog)).toEqual(['actions', 'default', 'heading']);
    expect(sourceParts(dialog)).toEqual([
      'actions',
      'body',
      'close-button',
      'dialog',
      'header',
      'heading',
      'surface',
    ]);
    for (const value of [
      "this.dialogId = '';",
      'this.open = false;',
      "this.closeLabel = '';",
      "this.initialFocus = 'heading';",
      "this.size = 'standard';",
    ]) {
      expect(dialog).toContain(value);
    }
    for (const part of sourceParts(dialog)) expect(dialogDocument).toContain(`\`${part}\``);
  });

  it('freezes methods, closed vocabularies, details, and event ordering', () => {
    expect(confirmation).toContain("['primary', 'critical']");
    expect(confirmation).toContain("['ordinary', 'interruptive']");
    expect(confirmation).toContain("['cancel', 'action', 'heading']");
    expect(confirmation).toContain("['action', 'cancel', 'escape', 'programmatic']");
    expect(confirmation).toContain('show(options: ConfirmationShowOptions = {}): boolean');
    expect(confirmation).toContain('cancel(): boolean');
    expect(confirmation).toContain("close(reason: 'programmatic' = 'programmatic'): boolean");
    expect(confirmation).toContain(
      "new CustomEvent<WgConfirmationCloseDetail>('wg-confirmation-close'",
    );
    expect(confirmation).toContain(
      "new CustomEvent<WgConfirmationActionDetail>('wg-confirmation-action'",
    );
    expect(confirmation.indexOf("'wg-confirmation-close'")).toBeLessThan(
      confirmation.indexOf("'wg-confirmation-action'"),
    );

    expect(dialog).toContain("['heading', 'close', 'first-interactive']");
    expect(dialog).toContain("['compact', 'standard', 'wide']");
    expect(dialog).toContain("['close-control', 'escape', 'programmatic']");
    expect(dialog).toContain('show(options: DialogShowOptions = {}): boolean');
    expect(dialog).toContain("close(reason: 'programmatic' = 'programmatic'): boolean");
    expect(dialog).toContain("new CustomEvent<WgDialogDetail>('wg-dialog-open'");
    expect(dialog).toContain("new CustomEvent<WgDialogCloseDetail>('wg-dialog-close'");
  });

  it('freezes native modal ownership as private shared infrastructure', () => {
    for (const source of [confirmation, dialog]) {
      expect(source).toContain('new NativeModalController(this)');
      expect(source).toContain('dialog.close(reason)');
      expect(source).not.toContain(".setAttribute('open'");
    }
    expect(controller).toContain('dialog.showModal();');
    expect(controller).toContain("documentOwner.querySelector('dialog:modal')");
    expect(controller).toContain('const activeModals = new WeakMap<Document, ActiveModal>();');
    expect(controller).toContain('value?.isConnected');
    expect(controller).toContain('this.#invoker.focus({ preventScroll: true });');
    expect(controller).toContain('this.#fallbackFocus.focus({ preventScroll: true });');
    expect(elementsManifest.exports).not.toHaveProperty('./native-modal-controller');
  });

  it('keeps mechanical sizing private and records no element-level styling hooks', () => {
    expect(dialog).toContain('--_wg-dialog-inline-maximum');
    expect(dialog).not.toMatch(/--wg-dialog-[a-z0-9-]+/);
    expect(confirmation).not.toMatch(/--wg-confirmation-[a-z0-9-]+/);
    expect(dialogDocument).toContain('exposes no element-specific CSS custom properties in v1');
    expect(confirmationDocument).toContain(
      'exposes no element-specific CSS custom properties in v1',
    );
  });

  it('freezes explicit registration and typed React event adaptation', () => {
    expect(confirmation).toContain(
      'defineElement(wgConfirmationDialogTagName, WgConfirmationDialog, registry);',
    );
    expect(dialog).toContain('defineElement(wgDialogTagName, WgDialog, registry);');
    expect(confirmationReact).toContain('registerElement(defineWgConfirmationDialog);');
    expect(confirmationReact).toContain("onWgConfirmationAction: 'wg-confirmation-action'");
    expect(confirmationReact).toContain("onWgConfirmationClose: 'wg-confirmation-close'");
    expect(dialogReact).toContain('registerElement(defineWgDialog);');
    expect(dialogReact).toContain("onWgDialogOpen: 'wg-dialog-open'");
    expect(dialogReact).toContain("onWgDialogClose: 'wg-dialog-close'");
  });

  it('records current evidence and continuing boundaries without overstating AT review', () => {
    expect(confirmationDocument).toContain('## Validation coverage');
    expect(confirmationDocument).toContain('## Continuing boundaries');
    expect(confirmationDocument).not.toContain('## Validation requirements');
    expect(confirmationDocument).not.toContain('## Deferred decisions');
    for (const currentDocument of [confirmationDocument, dialogDocument]) {
      expect(currentDocument).toContain('explicit public-release');
      expect(currentDocument).toContain('evidence gates');
    }
  });
});
