import type { IconRecord } from '../src/types.js';

export const directionalFixture = {
  schemaVersion: 1,
  id: 'arrow-inline-start',
  category: 'control',
  direction: 'mirrors-in-rtl',
  accessibleUse: 'reinforcement-only',
  provenance: { author: 'Wayglass', license: 'Apache-2.0' },
  primitives: [
    {
      type: 'path',
      fill: 'none',
      stroke: 'currentColor',
      commands: [
        { command: 'move-to', x: 19, y: 12 },
        { command: 'line-to', x: 5, y: 12 },
        { command: 'line-to', x: 11, y: 6 },
      ],
    },
  ],
} as const satisfies IconRecord;
