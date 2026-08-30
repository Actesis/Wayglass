import { describe, expect, it } from 'vitest';

import { generatedIconCatalog } from '../../../packages/icons/src/generated/catalog.js';
import { productionIconNames } from '../src/catalog.js';

// This fixture deliberately retains the old Lit geometry during migration review so every
// coordinate and paint role stays pinned. It is not an SVG parser or a second authoring source and
// is removed with the superseded runtime proof.
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

describe('icon runtime migration parity', () => {
  it('preserves the exact production names, order, geometry, direction, and paint roles', () => {
    expect(generatedIconCatalog).toEqual(acceptedGeometry);
    expect(generatedIconCatalog.map(({ name }) => name)).toEqual(productionIconNames);
  });
});
