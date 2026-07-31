import { createComponent } from '@lit/react';
import {
  defineWgNavigationRail,
  WgNavigationRail as WgNavigationRailElement,
  wgNavigationRailTagName,
} from '@wayglass/elements/navigation-rail';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgNavigationRail);
export const WgNavigationRail = createComponent({
  react: React,
  tagName: wgNavigationRailTagName,
  elementClass: WgNavigationRailElement,
  displayName: 'WgNavigationRail',
});
export type WgNavigationRailProps = ComponentProps<typeof WgNavigationRail>;
