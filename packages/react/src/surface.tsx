import { createComponent } from '@lit/react';
import {
  defineWgSurface,
  WgSurface as WgSurfaceElement,
  wgSurfaceTagName,
} from '@wayglass/elements/surface';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgSurface);

export const WgSurface = createComponent({
  react: React,
  tagName: wgSurfaceTagName,
  elementClass: WgSurfaceElement,
  displayName: 'WgSurface',
});

export type WgSurfaceProps = ComponentProps<typeof WgSurface>;
