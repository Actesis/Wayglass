import { createComponent } from '@lit/react';
import {
  defineWgStatusList,
  WgStatusList as WgStatusListElement,
  wgStatusListTagName,
} from '@wayglass/elements/status-list';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgStatusList);

export const WgStatusList = createComponent({
  react: React,
  tagName: wgStatusListTagName,
  elementClass: WgStatusListElement,
  displayName: 'WgStatusList',
});

export type WgStatusListProps = ComponentProps<typeof WgStatusList>;
