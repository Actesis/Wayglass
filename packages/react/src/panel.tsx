import { createComponent } from '@lit/react';
import { defineWgPanel, WgPanel as WgPanelElement, wgPanelTagName } from '@wayglass/elements/panel';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgPanel);

export const WgPanel = createComponent({
  react: React,
  tagName: wgPanelTagName,
  elementClass: WgPanelElement,
  displayName: 'WgPanel',
});

export type WgPanelProps = ComponentProps<typeof WgPanel>;
