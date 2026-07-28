import { createComponent } from '@lit/react';
import {
  defineWgStatusIndicator,
  WgStatusIndicator as WgStatusIndicatorElement,
  wgStatusIndicatorTagName,
} from '@wayglass/elements/status-indicator';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgStatusIndicator);

export const WgStatusIndicator = createComponent({
  react: React,
  tagName: wgStatusIndicatorTagName,
  elementClass: WgStatusIndicatorElement,
  displayName: 'WgStatusIndicator',
});

export type WgStatusIndicatorProps = ComponentProps<typeof WgStatusIndicator>;
