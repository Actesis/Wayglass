import { createComponent } from '@lit/react';
import {
  defineWgTrendIndicator,
  WgTrendIndicator as WgTrendIndicatorElement,
  wgTrendIndicatorTagName,
} from '@wayglass/elements/trend-indicator';
import * as React from 'react';
import type { ComponentProps } from 'react';

import { registerElement } from './register.js';

registerElement(defineWgTrendIndicator);

export const WgTrendIndicator = createComponent({
  react: React,
  tagName: wgTrendIndicatorTagName,
  elementClass: WgTrendIndicatorElement,
  displayName: 'WgTrendIndicator',
});

export type WgTrendIndicatorProps = ComponentProps<typeof WgTrendIndicator>;
