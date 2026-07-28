import { createComponent } from '@lit/react';
import {
  defineWgCanvas,
  WgCanvas as WgCanvasElement,
  wgCanvasTagName,
} from '@wayglass/elements/canvas';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgCanvas);

export const WgCanvas = createComponent({
  react: React,
  tagName: wgCanvasTagName,
  elementClass: WgCanvasElement,
  displayName: 'WgCanvas',
});

export type WgCanvasProps = ComponentProps<typeof WgCanvas>;
