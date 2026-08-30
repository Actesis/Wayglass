import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { generatedIconCatalog } from '../../../packages/icons/src/generated/catalog.js';
import { productionIconNames } from '../src/catalog.js';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));

// This fixture is deliberately explicit: while the old Lit templates and the structured catalog
// coexist, every coordinate and paint role must pass review in both representations. It is not an
// SVG parser or a second authoring source and is removed with the superseded inline catalog.
const acceptedGeometry = [
  {
    name: 'close',
    direction: 'neutral',
    primitives: [
      {
        type: 'path',
        commands: [
          { command: 'move-to', x: 6, y: 6 },
          { command: 'line-to', x: 18, y: 18 },
          { command: 'move-to', x: 18, y: 6 },
          { command: 'line-to', x: 6, y: 18 },
        ],
        fill: 'none',
        stroke: 'currentColor',
      },
    ],
  },
  {
    name: 'menu',
    direction: 'neutral',
    primitives: [
      {
        type: 'path',
        commands: [
          { command: 'move-to', x: 4, y: 7 },
          { command: 'line-to', x: 20, y: 7 },
          { command: 'move-to', x: 4, y: 12 },
          { command: 'line-to', x: 20, y: 12 },
          { command: 'move-to', x: 4, y: 17 },
          { command: 'line-to', x: 20, y: 17 },
        ],
        fill: 'none',
        stroke: 'currentColor',
      },
    ],
  },
  {
    name: 'more',
    direction: 'neutral',
    primitives: [5, 12, 19].map((centerX) => ({
      type: 'circle',
      centerX,
      centerY: 12,
      radius: 1,
      fill: 'currentColor',
      stroke: 'none',
    })),
  },
  {
    name: 'refresh',
    direction: 'neutral',
    primitives: [
      {
        type: 'path',
        commands: [
          { command: 'move-to', x: 20, y: 6 },
          { command: 'line-to', x: 20, y: 11 },
          { command: 'line-to', x: 15, y: 11 },
          { command: 'move-to', x: 4, y: 18 },
          { command: 'line-to', x: 4, y: 13 },
          { command: 'line-to', x: 9, y: 13 },
          { command: 'move-to', x: 18.5, y: 9 },
          {
            command: 'arc-to',
            radiusX: 7,
            radiusY: 7,
            rotation: 0,
            largeArc: false,
            sweep: false,
            x: 6.4,
            y: 6.4,
          },
          { command: 'line-to', x: 4, y: 9 },
          { command: 'move-to', x: 5.5, y: 15 },
          {
            command: 'arc-to',
            radiusX: 7,
            radiusY: 7,
            rotation: 0,
            largeArc: false,
            sweep: false,
            x: 17.6,
            y: 17.6,
          },
          { command: 'line-to', x: 20, y: 15 },
        ],
        fill: 'none',
        stroke: 'currentColor',
      },
    ],
  },
] as const;

const acceptedInlineMarkup = [
  'close: svg`<path d="M6 6l12 12M18 6L6 18" />`',
  'menu: svg`<path d="M4 7h16M4 12h16M4 17h16" />`',
  'more: svg`<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />`',
  'refresh: svg`<path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 006.4 6.4L4 9M5.5 15A7 7 0 0017.6 17.6L20 15" />`',
] as const;

describe('Stage 3 runtime parity', () => {
  it('preserves the exact production names, order, geometry, direction, and paint roles', () => {
    expect(generatedIconCatalog).toEqual(acceptedGeometry);
    expect(generatedIconCatalog.map(({ name }) => name)).toEqual(productionIconNames);
  });

  it('keeps every accepted legacy geometry representation until runtime migration', () => {
    const inlineRuntime = readFileSync(join(repositoryRoot, 'packages/icons/src/index.ts'), 'utf8');

    for (const markup of acceptedInlineMarkup) expect(inlineRuntime).toContain(markup);
    expect(inlineRuntime).not.toContain('./generated/catalog');
  });
});
