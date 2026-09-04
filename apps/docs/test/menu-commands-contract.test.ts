import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const document = readFileSync(
  resolve(repositoryRoot, 'docs/controls/menus-and-commands.md'),
  'utf8',
);
const menu = readFileSync(resolve(repositoryRoot, 'packages/elements/src/menu.ts'), 'utf8');
const commandItem = readFileSync(
  resolve(repositoryRoot, 'packages/elements/src/command-item.ts'),
  'utf8',
);
const reactMenu = readFileSync(resolve(repositoryRoot, 'packages/react/src/menu.tsx'), 'utf8');
const reactCommandItem = readFileSync(
  resolve(repositoryRoot, 'packages/react/src/command-item.tsx'),
  'utf8',
);

function sourceSlots(source: string): string[] {
  return [
    ...new Set(
      [...source.matchAll(/<slot(?:\s+name="([^"]+)")?/g)].map((match) => match[1] ?? 'default'),
    ),
  ].sort();
}

function sourceParts(source: string): string[] {
  return [
    ...new Set([...source.matchAll(/part="([^"]+)"/g)].flatMap((match) => match[1]!.split(/\s+/))),
  ].sort();
}

describe('menu and command field-level contracts', () => {
  it('freezes menu fields, defaults, slots, parts, and styling hooks', () => {
    expect(menu).toContain('label: { type: String }');
    expect(menu).toContain('disabled: { type: Boolean, reflect: true }');
    expect(menu).toContain('placement: { type: String, reflect: true }');
    expect(menu).toContain("this.label = '';");
    expect(menu).toContain('this.disabled = false;');
    expect(menu).toContain("this.placement = 'block-end-end';");
    expect(menu).toContain('get open(): boolean');
    expect(sourceSlots(menu)).toEqual(['default', 'trigger']);
    expect(sourceParts(menu)).toEqual(['indicator', 'menu', 'popup', 'trigger', 'trigger-content']);

    const cssProperties = [
      '--wg-menu-color-trigger-background',
      '--wg-menu-color-trigger-background-hover',
      '--wg-menu-color-popup-background',
      '--wg-menu-color-border',
      '--wg-menu-color-text',
      '--wg-menu-color-detail',
      '--wg-menu-item-color-background-hover',
      '--wg-menu-trigger-radius',
      '--wg-menu-popup-radius',
      '--wg-menu-space',
      '--wg-menu-item-size-minimum',
    ];
    for (const property of cssProperties) {
      expect(menu).toContain(`${property}:`);
      expect(document).toContain(`\`${property}\``);
    }
  });

  it('freezes command-item fields, slots, parts, semantics, and command event', () => {
    expect(commandItem).toContain('value: { type: String, reflect: true }');
    expect(commandItem).toContain('disabled: { type: Boolean, reflect: true }');
    expect(commandItem).toContain("this.value = '';");
    expect(commandItem).toContain('this.disabled = false;');
    expect(sourceSlots(commandItem)).toEqual(['default', 'detail', 'leading', 'trailing']);
    expect(sourceParts(commandItem)).toEqual([
      'content',
      'detail',
      'item',
      'label',
      'leading',
      'trailing',
    ]);
    expect(commandItem).toContain("this.setAttribute('role', 'menuitem')");
    expect(commandItem).toContain("new CustomEvent<WgCommandDetail>('wg-command'");
    expect(commandItem).toContain('bubbles: true');
    expect(commandItem).toContain('composed: true');
    expect(commandItem).toContain(
      "export type CommandTrigger = 'keyboard' | 'pointer' | 'programmatic'",
    );
    expect(commandItem).toContain('readonly trigger: CommandTrigger;');
  });

  it('freezes popup ownership, methods, event reasons, and explicit compound registration', () => {
    expect(menu).toContain('readonly open: boolean;');
    expect(menu).toContain('readonly reason: MenuToggleReason;');
    for (const reason of [
      'trigger',
      'keyboard',
      'command',
      'escape',
      'tab',
      'outside',
      'programmatic',
    ]) {
      expect(menu).toContain(`'${reason}'`);
      expect(document).toContain(`\`${reason}\``);
    }
    expect(menu).toContain('override focus(options?: FocusOptions): void');
    expect(menu).toContain('async show(options: MenuShowOptions = {}): Promise<void>');
    expect(menu).toContain('hide(options: MenuHideOptions = {}): void');
    expect(menu).toContain('toggle(options: MenuShowOptions = {}): void');
    expect(menu).toContain("new CustomEvent<WgMenuToggleDetail>('wg-menu-toggle'");
    expect(menu).toContain('defineWgCommandItem(registry);');
    expect(menu).toContain('defineElement(wgMenuTagName, WgMenu, registry);');
  });

  it('freezes thin React event adaptation', () => {
    expect(reactMenu).toContain('registerElement(defineWgMenu);');
    expect(reactMenu).toContain("onWgMenuToggle: 'wg-menu-toggle'");
    expect(reactMenu).toContain('WayglassCustomEvent<WgMenuElement, WgMenuToggleDetail>');
    expect(reactCommandItem).toContain('registerElement(defineWgCommandItem);');
    expect(reactCommandItem).toContain("onWgCommand: 'wg-command'");
    expect(reactCommandItem).toContain(
      'WayglassCustomEvent<WgCommandItemElement, WgCommandDetail>',
    );
  });

  it('documents the implemented v1 contract and continuing boundaries', () => {
    for (const term of [
      '`label: string`',
      '`disabled: boolean`',
      '`placement:',
      '`readonly open: boolean`',
      '`value: string`',
      '`trigger`',
      '`indicator`',
      '`content`',
      '`wg-menu-toggle`',
      '`wg-command`',
      '`focus(options?: FocusOptions): void`',
      '`show(options?:',
      '`hide(options?:',
      '`toggle(options?:',
      '`click(): void`',
    ]) {
      expect(document).toContain(term);
    }
    expect(document).toContain('## Validation coverage');
    expect(document).toContain('## Continuing boundaries');
    expect(document).not.toContain('## Proposed public API');
    expect(document).not.toContain('### Proposed markup');
    expect(document).not.toContain('## Deferred decisions');
    expect(document).not.toContain('remain in Phase 2E');
  });
});
