import { describe, expect, it } from 'vitest';

import * as iconEntry from '../src/icon.js';
import * as rootEntry from '../src/index.js';
import {
  defineWgIcon,
  iconDirections,
  iconNames,
  iconSizes,
  isIconDirection,
  isIconName,
  isIconSize,
  WgIcon,
} from '../src/icon.js';
import {
  getIconRecord,
  iconPathData,
  resolveIconHostSemantics,
  shouldMirrorIcon,
} from '../src/runtime.js';

describe('Wayglass icon runtime', () => {
  it('keeps the initial catalog small and domain-neutral', () => {
    expect(iconNames).toEqual(['close', 'menu', 'more', 'refresh']);
    expect(isIconName('refresh')).toBe(true);
    expect(isIconName('porch-light')).toBe(false);
    expect(getIconRecord(undefined)).toBeUndefined();
    expect(getIconRecord('unknown')).toBeUndefined();
  });

  it('renders the generated path geometry without an inline fallback catalog', () => {
    const paths = iconNames.flatMap((name) => {
      const record = getIconRecord(name);
      if (!record) throw new Error(`Missing generated test record: ${name}`);
      return record.primitives
        .filter((primitive) => primitive.type === 'path')
        .map((primitive) => iconPathData(primitive));
    });

    expect(paths).toEqual([
      'M6 6L18 18M18 6L6 18',
      'M4 7L20 7M4 12L20 12M4 17L20 17',
      'M20 6L20 11L15 11M4 18L4 13L9 13M18.5 9A7 7 0 0 0 6.4 6.4L4 9M5.5 15A7 7 0 0 0 17.6 17.6L20 15',
    ]);
    expect(getIconRecord('more')?.primitives).toEqual([
      {
        type: 'circle',
        centerX: 5,
        centerY: 12,
        radius: 1,
        fill: 'currentColor',
        stroke: 'none',
      },
      {
        type: 'circle',
        centerX: 12,
        centerY: 12,
        radius: 1,
        fill: 'currentColor',
        stroke: 'none',
      },
      {
        type: 'circle',
        centerX: 19,
        centerY: 12,
        radius: 1,
        fill: 'currentColor',
        stroke: 'none',
      },
    ]);
  });

  it('keeps missing, unknown, empty-label, and labeled semantics distinct', () => {
    expect(resolveIconHostSemantics(undefined, undefined)).toEqual({ hidden: true });
    expect(resolveIconHostSemantics('unknown', 'Unknown symbol')).toEqual({ hidden: true });
    expect(resolveIconHostSemantics('close', '   ')).toEqual({ hidden: true });
    expect(resolveIconHostSemantics('close', '  Close dialog  ')).toEqual({
      hidden: false,
      role: 'img',
      label: 'Close dialog',
    });
  });

  it('defines and guards the accepted size and direction values', () => {
    expect(iconSizes).toEqual(['compact', 'standard', 'prominent']);
    expect(iconDirections).toEqual(['auto', 'ltr', 'rtl']);
    expect(isIconSize('prominent')).toBe(true);
    expect(isIconSize('large')).toBe(false);
    expect(isIconDirection('auto')).toBe(true);
    expect(isIconDirection('logical')).toBe(false);

    const icon = new WgIcon();
    expect(icon.name).toBeUndefined();
    expect(icon.label).toBeUndefined();
    expect(icon.size).toBe('standard');
    expect(icon.direction).toBe('auto');
  });

  it('mirrors only reviewed directional records in resolved RTL contexts', () => {
    expect(shouldMirrorIcon('neutral', 'rtl', 'ltr')).toBe(false);
    expect(shouldMirrorIcon('mirrors-in-rtl', 'ltr', 'rtl')).toBe(false);
    expect(shouldMirrorIcon('mirrors-in-rtl', 'rtl', 'ltr')).toBe(true);
    expect(shouldMirrorIcon('mirrors-in-rtl', 'auto', 'ltr')).toBe(false);
    expect(shouldMirrorIcon('mirrors-in-rtl', 'auto', 'rtl')).toBe(true);
  });

  it('uses semantic size tokens, public styling hooks, logical mirroring, and forced colors', () => {
    const styles = WgIcon.styles.toString();
    expect(styles).toContain('--wg-icon-color: currentColor');
    expect(styles).toContain('--wg-icon-size: var(--wg-component-icon-size-standard)');
    expect(styles).toContain("[size='compact']");
    expect(styles).toContain('--wg-component-icon-size-compact');
    expect(styles).toContain("[size='prominent']");
    expect(styles).toContain('--wg-component-icon-size-prominent');
    expect(styles).toContain("[part='svg']");
    expect(styles).toContain(":host([direction='auto']:dir(rtl))");
    expect(styles).toContain(":host([direction='rtl'])");
    expect(styles).toContain("[data-direction='mirrors-in-rtl']");
    expect(styles).toContain('color: CanvasText');
    expect(styles).toContain('forced-color-adjust: auto');
  });

  it('exports one implementation without registering it as an import side effect', () => {
    expect(rootEntry.WgIcon).toBe(iconEntry.WgIcon);
    expect(WgIcon.name).toBe('WgIcon');
    expect(globalThis.customElements?.get('wg-icon')).toBeUndefined();
  });

  it('registers explicitly, tolerates duplicates, and rejects a conflicting definition', () => {
    const definitions = new Map<string, CustomElementConstructor>();
    const registry = {
      define(name: string, constructor: CustomElementConstructor) {
        definitions.set(name, constructor);
      },
      get(name: string) {
        return definitions.get(name);
      },
    } as CustomElementRegistry;

    defineWgIcon(registry);
    expect(definitions.get('wg-icon')).toBe(WgIcon);
    expect(() => defineWgIcon(registry)).not.toThrow();

    definitions.set('wg-icon', class extends WgIcon {});
    expect(() => defineWgIcon(registry)).toThrow('wg-icon is already registered.');
  });
});
