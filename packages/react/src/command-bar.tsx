import { createComponent } from '@lit/react';
import {
  defineWgCommandBar,
  WgCommandBar as WgCommandBarElement,
  wgCommandBarTagName,
} from '@wayglass/elements/command-bar';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgCommandBar);

export const WgCommandBar = createComponent({
  react: React,
  tagName: wgCommandBarTagName,
  elementClass: WgCommandBarElement,
  displayName: 'WgCommandBar',
});

export type WgCommandBarProps = ComponentProps<typeof WgCommandBar>;
