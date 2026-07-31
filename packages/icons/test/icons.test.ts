import { describe, expect, it } from 'vitest';

import { iconNames, isIconName, WgIcon } from '../src/index.js';

describe('Wayglass icon catalog', () => {
  it('keeps the initial catalog small and domain-neutral', () => {
    expect(iconNames).toEqual(['close', 'menu', 'more', 'refresh']);
    expect(isIconName('refresh')).toBe(true);
    expect(isIconName('porch-light')).toBe(false);
  });

  it('exports the element class without registering it', () => {
    expect(WgIcon.name).toBe('WgIcon');
    expect(globalThis.customElements?.get('wg-icon')).toBeUndefined();
  });
});
