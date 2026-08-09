import { createComponent } from '@lit/react';
import {
  defineWgFilterBar,
  WgFilterBar as WgFilterBarElement,
  wgFilterBarTagName,
} from '@wayglass/elements/filter-bar';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgFilterBar);

export const WgFilterBar = createComponent({
  react: React,
  tagName: wgFilterBarTagName,
  elementClass: WgFilterBarElement,
  displayName: 'WgFilterBar',
});

export type WgFilterBarProps = ComponentProps<typeof WgFilterBar>;
