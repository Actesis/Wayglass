import { createComponent } from '@lit/react';
import {
  defineWgValueTile,
  WgValueTile as WgValueTileElement,
  wgValueTileTagName,
} from '@wayglass/elements/value-tile';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgValueTile);

export const WgValueTile = createComponent({
  react: React,
  tagName: wgValueTileTagName,
  elementClass: WgValueTileElement,
  displayName: 'WgValueTile',
});

export type WgValueTileProps = ComponentProps<typeof WgValueTile>;
