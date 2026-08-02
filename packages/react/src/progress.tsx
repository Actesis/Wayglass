import { createComponent } from '@lit/react';
import {
  defineWgProgress,
  WgProgress as WgProgressElement,
  wgProgressTagName,
} from '@wayglass/elements/progress';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgProgress);

export const WgProgress = createComponent({
  react: React,
  tagName: wgProgressTagName,
  elementClass: WgProgressElement,
  displayName: 'WgProgress',
});

export type WgProgressProps = ComponentProps<typeof WgProgress>;
