import { createComponent } from '@lit/react';
import { defineWgGrid, WgGrid as WgGridElement, wgGridTagName } from '@wayglass/elements/grid';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgGrid);

export const WgGrid = createComponent({
  react: React,
  tagName: wgGridTagName,
  elementClass: WgGridElement,
  displayName: 'WgGrid',
});

export type WgGridProps = ComponentProps<typeof WgGrid>;
