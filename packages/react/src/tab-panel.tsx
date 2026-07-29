import { createComponent } from '@lit/react';
import {
  defineWgTabPanel,
  WgTabPanel as WgTabPanelElement,
  wgTabPanelTagName,
} from '@wayglass/elements/tab-panel';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTabPanel);

export const WgTabPanel = createComponent({
  react: React,
  tagName: wgTabPanelTagName,
  elementClass: WgTabPanelElement,
  displayName: 'WgTabPanel',
});

export type WgTabPanelProps = ComponentProps<typeof WgTabPanel>;
