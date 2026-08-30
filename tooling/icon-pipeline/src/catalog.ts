import type { IconRecord } from './types.js';

const provenance = { author: 'Wayglass', license: 'Apache-2.0' } as const;
const stroke = { fill: 'none', stroke: 'currentColor' } as const;

export const productionIconNames = ['close', 'menu', 'more', 'refresh'] as const;

export const iconCatalog = [
  {
    schemaVersion: 1,
    id: 'close',
    category: 'control',
    direction: 'neutral',
    accessibleUse: 'reinforcement-only',
    provenance,
    primitives: [
      {
        type: 'path',
        ...stroke,
        commands: [
          { command: 'move-to', x: 6, y: 6 },
          { command: 'line-to', x: 18, y: 18 },
          { command: 'move-to', x: 18, y: 6 },
          { command: 'line-to', x: 6, y: 18 },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: 'menu',
    category: 'control',
    direction: 'neutral',
    accessibleUse: 'reinforcement-only',
    provenance,
    primitives: [
      {
        type: 'path',
        ...stroke,
        commands: [
          { command: 'move-to', x: 4, y: 7 },
          { command: 'line-to', x: 20, y: 7 },
          { command: 'move-to', x: 4, y: 12 },
          { command: 'line-to', x: 20, y: 12 },
          { command: 'move-to', x: 4, y: 17 },
          { command: 'line-to', x: 20, y: 17 },
        ],
      },
    ],
  },
  {
    schemaVersion: 1,
    id: 'more',
    category: 'control',
    direction: 'neutral',
    accessibleUse: 'reinforcement-only',
    provenance,
    primitives: [5, 12, 19].map((centerX) => ({
      type: 'circle' as const,
      centerX,
      centerY: 12,
      radius: 1,
      fill: 'currentColor' as const,
      stroke: 'none' as const,
    })),
  },
  {
    schemaVersion: 1,
    id: 'refresh',
    category: 'control',
    direction: 'neutral',
    accessibleUse: 'reinforcement-only',
    provenance,
    primitives: [
      {
        type: 'path',
        ...stroke,
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
      },
    ],
  },
] as const satisfies readonly IconRecord[];
