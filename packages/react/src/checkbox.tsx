import { createComponent } from '@lit/react';
import {
  defineWgCheckbox,
  WgCheckbox as WgCheckboxElement,
  wgCheckboxTagName,
} from '@wayglass/elements/checkbox';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgCheckbox);
export const WgCheckbox = createComponent({
  react: React,
  tagName: wgCheckboxTagName,
  elementClass: WgCheckboxElement,
  displayName: 'WgCheckbox',
});
export type WgCheckboxProps = ComponentProps<typeof WgCheckbox>;
