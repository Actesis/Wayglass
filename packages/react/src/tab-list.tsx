import { createComponent } from '@lit/react';
import {
  defineWgTabList,
  WgTabList as WgTabListElement,
  wgTabListTagName,
} from '@wayglass/elements/tab-list';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTabList);

export const WgTabList = createComponent({
  react: React,
  tagName: wgTabListTagName,
  elementClass: WgTabListElement,
  displayName: 'WgTabList',
});

export type WgTabListProps = ComponentProps<typeof WgTabList>;
