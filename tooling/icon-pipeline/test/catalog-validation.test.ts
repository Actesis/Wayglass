import { describe, expect, it } from 'vitest';

import { iconCatalog, productionIconNames } from '../src/catalog.js';
import { IconSourceError, validateIconCatalog } from '../src/validation.js';

type MutableRecord = Record<string, unknown>;

function clone(value: unknown): unknown {
  return structuredClone(value);
}

function first(catalog: MutableRecord[]): MutableRecord {
  return catalog[0]!;
}

function firstPrimitive(catalog: MutableRecord[]): MutableRecord {
  return (first(catalog).primitives as MutableRecord[])[0]!;
}

function firstCommand(catalog: MutableRecord[]): MutableRecord {
  return (firstPrimitive(catalog).commands as MutableRecord[])[0]!;
}

function invalid(mutator: (catalog: MutableRecord[]) => void): unknown {
  const catalog = clone(iconCatalog) as MutableRecord[];
  mutator(catalog);
  return catalog;
}

describe('canonical icon source', () => {
  it('contains exactly the four neutral production controls', () => {
    expect(iconCatalog.map(({ id }) => id)).toEqual(productionIconNames);
    expect(iconCatalog.every(({ direction }) => direction === 'neutral')).toBe(true);
  });

  it('returns an immutable copy without changing author input', () => {
    const input = clone(iconCatalog);
    const before = structuredClone(input);
    const result = validateIconCatalog(input);
    expect(input).toEqual(before);
    expect(result).not.toBe(input);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0]?.primitives)).toBe(true);
  });

  it.each([
    ['WG_ICON_SOURCE_RECORD_KEYS', (catalog: MutableRecord[]) => (first(catalog).label = 'Close')],
    ['WG_ICON_SOURCE_RECORD_KEYS', (catalog: MutableRecord[]) => (first(catalog).active = true)],
    [
      'WG_ICON_SOURCE_RECORD_KEYS',
      (catalog: MutableRecord[]) => (first(catalog).external = 'https://x'),
    ],
    ['WG_ICON_SOURCE_SCHEMA', (catalog: MutableRecord[]) => (first(catalog).schemaVersion = 2)],
    ['WG_ICON_SOURCE_ID', (catalog: MutableRecord[]) => (first(catalog).id = 'Close Icon')],
    [
      'WG_ICON_SOURCE_ID_DUPLICATE',
      (catalog: MutableRecord[]) => (catalog[1]!.id = first(catalog).id),
    ],
    ['WG_ICON_SOURCE_CATEGORY', (catalog: MutableRecord[]) => (first(catalog).category = 'device')],
    ['WG_ICON_SOURCE_DIRECTION', (catalog: MutableRecord[]) => (first(catalog).direction = 'left')],
    [
      'WG_ICON_SOURCE_ACCESSIBLE_USE',
      (catalog: MutableRecord[]) => (first(catalog).accessibleUse = 'label'),
    ],
    [
      'WG_ICON_SOURCE_PROVENANCE',
      (catalog: MutableRecord[]) => ((first(catalog).provenance as MutableRecord).author = 'Other'),
    ],
    [
      'WG_ICON_SOURCE_PRIMITIVE_KIND',
      (catalog: MutableRecord[]) => (firstPrimitive(catalog).type = 'script'),
    ],
    [
      'WG_ICON_SOURCE_COMMAND_KIND',
      (catalog: MutableRecord[]) => (firstCommand(catalog).command = 'curve-to'),
    ],
    [
      'WG_ICON_SOURCE_PATH_START',
      (catalog: MutableRecord[]) => (firstCommand(catalog).command = 'line-to'),
    ],
    ['WG_ICON_SOURCE_BOUNDS', (catalog: MutableRecord[]) => (firstCommand(catalog).x = 25)],
    ['WG_ICON_SOURCE_NUMBER', (catalog: MutableRecord[]) => (firstCommand(catalog).x = Number.NaN)],
    [
      'WG_ICON_SOURCE_INVISIBLE',
      (catalog: MutableRecord[]) => (firstPrimitive(catalog).stroke = 'none'),
    ],
  ])('rejects closed or unsafe input with %s', (code, mutator) => {
    expect(() => validateIconCatalog(invalid(mutator))).toThrowError(
      expect.objectContaining<Partial<IconSourceError>>({ code }),
    );
  });

  it('enforces catalog and geometry envelopes', () => {
    expect(() => validateIconCatalog([])).toThrow(/WG_ICON_SOURCE_CATALOG_COUNT/);
    expect(() => validateIconCatalog(Array.from({ length: 501 }, () => iconCatalog[0]))).toThrow(
      /WG_ICON_SOURCE_CATALOG_COUNT/,
    );
    expect(() =>
      validateIconCatalog(
        invalid((catalog) => {
          const primitive = firstPrimitive(catalog);
          first(catalog).primitives = Array.from({ length: 17 }, () => primitive);
        }),
      ),
    ).toThrow(/WG_ICON_SOURCE_PRIMITIVE_COUNT/);
  });
});
