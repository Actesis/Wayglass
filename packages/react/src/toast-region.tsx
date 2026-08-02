import { createComponent } from '@lit/react';
import {
  defineWgToastRegion,
  WgToastRegion as WgToastRegionElement,
  wgToastRegionTagName,
} from '@wayglass/elements/toast-region';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgToastRegion);

export const WgToastRegion = createComponent({
  react: React,
  tagName: wgToastRegionTagName,
  elementClass: WgToastRegionElement,
  displayName: 'WgToastRegion',
});

export type WgToastRegionProps = ComponentProps<typeof WgToastRegion>;
