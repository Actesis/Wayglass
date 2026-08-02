import { createComponent } from '@lit/react';
import {
  defineWgSelect,
  WgSelect as WgSelectElement,
  wgSelectTagName,
} from '@wayglass/elements/select';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgSelect);
export const WgSelect = createComponent({
  react: React,
  tagName: wgSelectTagName,
  elementClass: WgSelectElement,
  displayName: 'WgSelect',
});
export type WgSelectProps = ComponentProps<typeof WgSelect>;
