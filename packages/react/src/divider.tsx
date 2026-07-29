import { createComponent } from '@lit/react';
import {
  defineWgDivider,
  WgDivider as WgDividerElement,
  wgDividerTagName,
} from '@wayglass/elements/divider';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgDivider);

export const WgDivider = createComponent({
  react: React,
  tagName: wgDividerTagName,
  elementClass: WgDividerElement,
  displayName: 'WgDivider',
});

export type WgDividerProps = ComponentProps<typeof WgDivider>;
