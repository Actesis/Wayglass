import { createComponent } from '@lit/react';
import {
  defineWgScrollRegion,
  WgScrollRegion as WgScrollRegionElement,
  wgScrollRegionTagName,
} from '@wayglass/elements/scroll-region';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgScrollRegion);

export const WgScrollRegion = createComponent({
  react: React,
  tagName: wgScrollRegionTagName,
  elementClass: WgScrollRegionElement,
  displayName: 'WgScrollRegion',
});

export type WgScrollRegionProps = ComponentProps<typeof WgScrollRegion>;
