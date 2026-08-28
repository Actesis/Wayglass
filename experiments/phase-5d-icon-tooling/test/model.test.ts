import { describe, expect, it } from 'vitest';

import { currentRuntimeIconNames, proofIconCatalog } from '../src/catalog.js';
import { IconModelError, validateIconCatalog } from '../src/model.js';

function mutableCatalog(): unknown[] {
  return structuredClone(proofIconCatalog) as unknown as unknown[];
}

function expectCode(input: unknown, code: string): void {
  try {
    validateIconCatalog(input);
    throw new Error(`Expected ${code}.`);
  } catch (error) {
    expect(error).toBeInstanceOf(IconModelError);
    expect((error as IconModelError).code).toBe(code);
  }
}

describe('Phase 5D-A icon source model', () => {
  it('accounts for the four current runtime names and one synthetic directional glyph', () => {
    const result = validateIconCatalog(proofIconCatalog);
    expect(result.map(({ id }) => id)).toEqual([...currentRuntimeIconNames, 'arrow-inline-start']);
    expect(result.filter(({ direction }) => direction === 'mirrors-in-rtl')).toHaveLength(1);
    expect(result.every(({ accessibleUse }) => accessibleUse === 'reinforcement-only')).toBe(true);
  });

  it('returns a deeply frozen copy without mutating authored input', () => {
    const input = mutableCatalog();
    const before = structuredClone(input);
    const result = validateIconCatalog(input);
    expect(input).toEqual(before);
    expect(result).not.toBe(input);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0])).toBe(true);
    expect(Object.isFrozen(result[0]!.primitives[0])).toBe(true);
  });

  it('rejects duplicate and unstable identifiers', () => {
    const duplicate = mutableCatalog();
    (duplicate[1] as { id: string }).id = 'close';
    expectCode(duplicate, 'P5D_ICON_ID_DUPLICATE');

    const unstable = mutableCatalog();
    (unstable[0] as { id: string }).id = 'Close icon';
    expectCode(unstable, 'P5D_ICON_ID');
  });

  it('rejects fields that would make geometry own labels or arbitrary markup', () => {
    const input = mutableCatalog();
    Object.assign(input[0] as object, { ariaLabel: 'Close', markup: '<script />' });
    expectCode(input, 'P5D_ICON_RECORD_KEYS');
  });

  it('rejects unsupported schemas, categories, direction, use, and provenance', () => {
    for (const [key, value, code] of [
      ['schemaVersion', 2, 'P5D_ICON_SCHEMA'],
      ['category', 'device', 'P5D_ICON_CATEGORY'],
      ['direction', 'rotate', 'P5D_ICON_DIRECTION'],
      ['accessibleUse', 'required-meaning', 'P5D_ICON_ACCESSIBLE_USE'],
    ] as const) {
      const input = mutableCatalog();
      Object.assign(input[0] as object, { [key]: value });
      expectCode(input, code);
    }

    const provenance = mutableCatalog();
    (provenance[0] as { provenance: { author: string } }).provenance.author = 'Unknown';
    expectCode(provenance, 'P5D_ICON_PROVENANCE');
  });

  it('rejects unsupported primitives and path commands', () => {
    const primitive = mutableCatalog();
    (primitive[0] as { primitives: unknown[] }).primitives[0] = { type: 'foreign-object' };
    expectCode(primitive, 'P5D_ICON_PRIMITIVE_KIND');

    const command = mutableCatalog();
    const commands = (
      (command[0] as { primitives: Array<{ commands: unknown[] }> }).primitives[0] as {
        commands: unknown[];
      }
    ).commands;
    commands[1] = { command: 'script', source: 'alert(1)' };
    expectCode(command, 'P5D_ICON_COMMAND_KIND');
  });

  it('rejects invisible paint and paths that do not begin with move-to', () => {
    const invisible = mutableCatalog();
    Object.assign((invisible[0] as { primitives: object[] }).primitives[0]!, {
      fill: 'none',
      stroke: 'none',
    });
    expectCode(invisible, 'P5D_ICON_INVISIBLE');

    const pathStart = mutableCatalog();
    const commands = (
      pathStart[0] as { primitives: Array<{ commands: Array<{ command: string }> }> }
    ).primitives[0]!.commands;
    commands[0] = { command: 'line-to', x: 6, y: 6 } as { command: string };
    expectCode(pathStart, 'P5D_ICON_PATH_START');
  });

  it('rejects non-finite, out-of-bounds, and non-positive geometry', () => {
    const nonFinite = mutableCatalog();
    const firstCommand = (nonFinite[0] as { primitives: Array<{ commands: Array<{ x: number }> }> })
      .primitives[0]!.commands[0]!;
    firstCommand.x = Number.NaN;
    expectCode(nonFinite, 'P5D_ICON_NUMBER');

    const outOfBounds = mutableCatalog();
    const outOfBoundsCommand = (
      outOfBounds[0] as { primitives: Array<{ commands: Array<{ x: number }> }> }
    ).primitives[0]!.commands[0]!;
    outOfBoundsCommand.x = 25;
    expectCode(outOfBounds, 'P5D_ICON_BOUNDS');

    const radius = mutableCatalog();
    (radius[2] as { primitives: Array<{ radius: number }> }).primitives[0]!.radius = 0;
    expectCode(radius, 'P5D_ICON_DIMENSION');
  });

  it('rejects empty and oversized catalog or primitive envelopes', () => {
    expectCode([], 'P5D_ICON_CATALOG_COUNT');
    expectCode(
      Array.from({ length: 501 }, () => proofIconCatalog[0]),
      'P5D_ICON_CATALOG_COUNT',
    );

    const empty = mutableCatalog();
    (empty[0] as { primitives: unknown[] }).primitives = [];
    expectCode(empty, 'P5D_ICON_PRIMITIVE_COUNT');
  });
});
