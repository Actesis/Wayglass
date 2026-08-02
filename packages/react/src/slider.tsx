import { createComponent } from '@lit/react';
import {
  defineWgSlider,
  WgSlider as WgSliderElement,
  wgSliderTagName,
} from '@wayglass/elements/slider';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgSlider);
export const WgSlider = createComponent({
  react: React,
  tagName: wgSliderTagName,
  elementClass: WgSliderElement,
  displayName: 'WgSlider',
});
export type WgSliderProps = ComponentProps<typeof WgSlider>;
